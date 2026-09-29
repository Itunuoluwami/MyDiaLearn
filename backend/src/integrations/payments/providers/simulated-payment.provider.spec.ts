import { createHmac } from 'node:crypto';

import type { PinoLogger } from 'nestjs-pino';

import { WebhookSignatureError } from '../payment.interface';
import { toMinorUnits } from '../payment.service';
import { SimulatedPaymentProvider } from './simulated-payment.provider';

const logger = { setContext: jest.fn(), warn: jest.fn() } as unknown as PinoLogger;
const SECRET = 'test-webhook-secret-123456';

function signed(body: object, secret = SECRET) {
  const raw = Buffer.from(JSON.stringify(body));
  return { raw, signature: createHmac('sha256', secret).update(raw).digest('hex') };
}

describe('SimulatedPaymentProvider webhooks', () => {
  const provider = new SimulatedPaymentProvider(logger, SECRET);
  const event = { id: 'evt_1', type: 'payment.succeeded', reference: 'pay-1' };

  it('accepts a correctly signed webhook', () => {
    const { raw, signature } = signed(event);
    const parsed = provider.parseWebhook(raw, { 'x-dialearn-signature': signature });
    expect(parsed).toMatchObject({
      eventId: 'evt_1',
      type: 'payment.succeeded',
      reference: 'pay-1',
    });
  });

  it('rejects a webhook signed with the wrong secret', () => {
    const { raw, signature } = signed(event, 'another-secret-abcdefgh');
    expect(() => provider.parseWebhook(raw, { 'x-dialearn-signature': signature })).toThrow(
      WebhookSignatureError,
    );
  });

  it('rejects a body altered after signing', () => {
    const { signature } = signed(event);
    const tampered = Buffer.from(JSON.stringify({ ...event, reference: 'someone-else' }));
    expect(() =>
      provider.parseWebhook(tampered, { 'x-dialearn-signature': signature }),
    ).toThrow(WebhookSignatureError);
  });

  it('rejects an unsigned webhook', () => {
    expect(() => provider.parseWebhook(Buffer.from(JSON.stringify(event)), {})).toThrow(
      WebhookSignatureError,
    );
  });

  it('refuses every webhook when no secret is configured', () => {
    const open = new SimulatedPaymentProvider(logger, undefined);
    const { raw, signature } = signed(event);
    expect(() => open.parseWebhook(raw, { 'x-dialearn-signature': signature })).toThrow(
      WebhookSignatureError,
    );
  });

  it('gives the same provider reference when an attempt is initialised twice', async () => {
    const request = {
      reference: 'pay-1',
      money: { amount: '20.50', currency: 'USD', decimals: 2 },
      customer: { email: 'a@b.c' },
      description: 'x',
      returnUrl: 'http://x',
      metadata: {},
    };
    const first = await provider.initializePayment(request);
    const second = await provider.initializePayment(request);
    expect(first.providerReference).toBe(second.providerReference);
  });
});

describe('toMinorUnits', () => {
  it.each([
    ['20.50', 2, 2050n],
    ['20.5', 2, 2050n],
    ['20', 2, 2000n],
    ['1500', 0, 1500n],
    ['0.001', 3, 1n],
  ])('%s with %i decimals is %s', (amount, decimals, expected) => {
    expect(toMinorUnits({ amount, currency: 'X', decimals })).toBe(expected);
  });

  it('refuses more precision than the currency has', () => {
    expect(() => toMinorUnits({ amount: '1.005', currency: 'USD', decimals: 2 })).toThrow();
  });
});
