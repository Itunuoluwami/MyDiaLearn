import type { PinoLogger } from 'nestjs-pino';

import type { AuditService } from '../../common/audit/audit.service';
import type { AuthConfig } from '../../config/configuration';
import type { PaymentGatewayService } from '../../integrations/payments/payment.service';
import type { PaymentsRepository } from '../payments.repository';
import { PaymentProcessingService } from './payment-processing.service';

const PAYMENT_ID = '11111111-1111-4111-8111-111111111111';

function payment(overrides: Record<string, unknown> = {}) {
  return {
    id: PAYMENT_ID,
    booking_id: 'b1',
    payer_id: 'payer-1',
    tutor_id: 't1',
    amount: '20.50',
    currency: 'USD',
    platform_fee: '0.50',
    commission_amount: '3.60',
    tutor_payout: '16.40',
    status: 'pending',
    provider: 'simulated',
    provider_reference: null,
    paid_at: null,
    refunded_amount: null,
    created_at: new Date(),
    currency_decimals: 2,
    payer_email: 'p@example.com',
    payer_name: 'P',
    booking_status: 'pending',
    ...overrides,
  };
}

function setup() {
  const repository = {
    prepare: jest.fn().mockResolvedValue(payment()),
    forProcessing: jest.fn().mockResolvedValue(payment()),
    setProviderReference: jest.fn(),
    markPaid: jest.fn().mockResolvedValue(payment({ status: 'paid' })),
    markFailed: jest.fn().mockResolvedValue(payment({ status: 'failed' })),
    recordEvent: jest.fn().mockResolvedValue(true),
    findIdByProviderReference: jest.fn().mockResolvedValue(null),
    findRefundByKey: jest.fn().mockResolvedValue(null),
    findRefundByProviderReference: jest.fn().mockResolvedValue(null),
    pendingRefunds: jest.fn().mockResolvedValue([]),
    recordRefundOutcome: jest.fn(),
  };
  const gateway = {
    providerName: 'simulated',
    capabilities: { refunds: true, webhooks: true },
    initializePayment: jest
      .fn()
      .mockResolvedValue({ status: 'succeeded', providerReference: 'sim_1' }),
    verifyPayment: jest.fn().mockResolvedValue({
      status: 'succeeded',
      providerReference: 'sim_1',
      amount: '20.50',
      currency: 'USD',
    }),
    refundPayment: jest
      .fn()
      .mockResolvedValue({ status: 'succeeded', providerRefundReference: 'r1' }),
    parseWebhook: jest.fn(),
  };
  const audit = { record: jest.fn() };
  const logger = { setContext: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn() };
  const service = new PaymentProcessingService(
    repository as unknown as PaymentsRepository,
    gateway as unknown as PaymentGatewayService,
    audit as unknown as AuditService,
    logger as unknown as PinoLogger,
    { appUrl: 'http://localhost:8080' } as AuthConfig,
  );
  return { service, repository, gateway, audit };
}

describe('PaymentProcessingService', () => {
  it('confirms a charge only with the amount the provider reports, after verifying', async () => {
    const { service, repository, gateway } = setup();
    await service.payForBooking('payer-1', 'b1', {});
    expect(gateway.initializePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: PAYMENT_ID,
        money: { amount: '20.50', currency: 'USD', decimals: 2 },
      }),
    );
    expect(gateway.verifyPayment).toHaveBeenCalled();
    expect(repository.markPaid).toHaveBeenCalledWith(PAYMENT_ID, 'sim_1', '20.50', 'USD');
  });

  it('marks a declined charge failed and does not confirm it', async () => {
    const { service, repository, gateway } = setup();
    gateway.initializePayment.mockResolvedValue({
      status: 'failed',
      providerReference: 'sim_1',
      failureReason: 'declined',
    });
    await expect(service.payForBooking('payer-1', 'b1', {})).rejects.toThrow();
    expect(repository.markFailed).toHaveBeenCalledWith(PAYMENT_ID, 'declined');
    expect(repository.markPaid).not.toHaveBeenCalled();
  });

  it('returns the checkout link and leaves the payment pending for a redirect provider', async () => {
    const { service, repository, gateway } = setup();
    gateway.initializePayment.mockResolvedValue({
      status: 'pending',
      providerReference: 'p1',
      checkoutUrl: 'https://pay.example/1',
    });
    const outcome = await service.payForBooking('payer-1', 'b1', {});
    expect(outcome.checkoutUrl).toBe('https://pay.example/1');
    expect(repository.markPaid).not.toHaveBeenCalled();
  });

  it('never trusts a webhook: it re-verifies with the provider', async () => {
    const { service, repository, gateway } = setup();
    gateway.parseWebhook.mockReturnValue({
      eventId: 'evt_1',
      type: 'payment.succeeded',
      reference: PAYMENT_ID,
      providerReference: 'sim_1',
      refundIdempotencyKey: null,
      details: {},
    });
    // The provider, asked directly, says the charge failed.
    gateway.verifyPayment.mockResolvedValue({
      status: 'failed',
      providerReference: 'sim_1',
      amount: null,
      currency: null,
    });
    await service.handleWebhook('simulated', Buffer.from('{}'), {});
    expect(repository.markPaid).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalled();
  });

  it('drops a redelivered webhook before touching the payment', async () => {
    const { service, repository, gateway } = setup();
    gateway.parseWebhook.mockReturnValue({
      eventId: 'evt_1',
      type: 'payment.succeeded',
      reference: PAYMENT_ID,
      providerReference: 'sim_1',
      refundIdempotencyKey: null,
      details: {},
    });
    repository.recordEvent.mockResolvedValue(false); // already recorded
    const result = await service.handleWebhook('simulated', Buffer.from('{}'), {});
    expect(result.duplicate).toBe(true);
    expect(gateway.verifyPayment).not.toHaveBeenCalled();
    expect(repository.markPaid).not.toHaveBeenCalled();
  });

  it('rejects an unverifiable webhook with 401', async () => {
    const { service, gateway } = setup();
    const { WebhookSignatureError } =
      await import('../../integrations/payments/payment.interface');
    gateway.parseWebhook.mockImplementation(() => {
      throw new WebhookSignatureError();
    });
    await expect(
      service.handleWebhook('simulated', Buffer.from('{}'), {}),
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it('does not confirm when the provider collected a different amount', async () => {
    const { service, repository, gateway } = setup();
    gateway.verifyPayment.mockResolvedValue({
      status: 'succeeded',
      providerReference: 'sim_1',
      amount: '1.00',
      currency: 'USD',
    });
    repository.markPaid.mockRejectedValue(new Error('PAYMENT_AMOUNT_MISMATCH'));
    await expect(service.confirmFromProvider(PAYMENT_ID, 'sim_1')).rejects.toMatchObject({
      status: 409,
    });
  });

  it('is a no-op for a payment already settled', async () => {
    const { service, repository, gateway } = setup();
    repository.forProcessing.mockResolvedValue(payment({ status: 'paid' }));
    await service.confirmFromProvider(PAYMENT_ID, 'sim_1');
    expect(gateway.verifyPayment).not.toHaveBeenCalled();
  });

  it('sends each pending refund to the provider with its ledger key', async () => {
    const { service, repository, gateway } = setup();
    repository.pendingRefunds.mockResolvedValue([
      {
        id: 'r-1',
        payment_id: PAYMENT_ID,
        amount: '5.00',
        currency: 'USD',
        currency_decimals: 2,
        idempotency_key: `${PAYMENT_ID}:5.00`,
        status: 'pending',
        attempts: 0,
        payment_provider: 'simulated',
        payment_provider_reference: 'sim_1',
      },
    ]);
    const tally = await service.processPendingRefunds();
    expect(gateway.refundPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `${PAYMENT_ID}:5.00`,
        providerReference: 'sim_1',
      }),
    );
    expect(repository.recordRefundOutcome).toHaveBeenCalledWith(
      'r-1',
      expect.objectContaining({ status: 'succeeded' }),
    );
    expect(tally.succeeded).toBe(1);
  });

  it('leaves a refund for manual action when the charge used another provider', async () => {
    const { service, repository, gateway } = setup();
    repository.pendingRefunds.mockResolvedValue([
      {
        id: 'r-2',
        payment_id: PAYMENT_ID,
        amount: '5.00',
        currency: 'USD',
        currency_decimals: 2,
        idempotency_key: 'k',
        status: 'pending',
        attempts: 0,
        payment_provider: 'some-other-provider',
        payment_provider_reference: 'x',
      },
    ]);
    await service.processPendingRefunds();
    expect(gateway.refundPayment).not.toHaveBeenCalled();
    expect(repository.recordRefundOutcome).toHaveBeenCalledWith(
      'r-2',
      expect.objectContaining({ status: 'pending' }),
    );
  });
});
