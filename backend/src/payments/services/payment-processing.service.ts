import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import {
  AppException,
  ErrorCode,
  NotFoundError,
  UnauthenticatedError,
} from '../../common/exceptions/app.exception';
import { translateDatabaseError } from '../../common/exceptions/database-errors';
import { authConfig, type AuthConfig } from '../../config/configuration';
import {
  PaymentGatewayService,
  PaymentProviderError,
} from '../../integrations/payments/payment.service';
import {
  WebhookSignatureError,
  type Money,
} from '../../integrations/payments/payment.interface';
import {
  PaymentsRepository,
  type PaymentForProcessing,
  type PaymentRow,
} from '../payments.repository';

/** Refund attempts before a ledger row is left for an admin to resolve. */
const MAX_REFUND_ATTEMPTS = 5;

export interface PaymentOutcome {
  payment: PaymentRow;
  /** Set when the customer must finish on the provider's page. */
  checkoutUrl?: string;
}

/**
 * Drives a charge through the payment provider.
 *
 *   payForBooking → payment_prepare() (payer checks, fee split, pending row)
 *                 → provider.initializePayment()
 *                 → provider.verifyPayment()   ← the only source of truth
 *                 → payment_mark_paid() / payment_mark_failed()
 *
 * Webhooks enter through handleWebhook(): the adapter verifies the signature,
 * the event is written to payment_events under the provider's event id (a
 * redelivery inserts nothing and stops there), and the payment is then
 * re-verified with the provider rather than updated from the webhook's own
 * claims. Every step is idempotent: re-running any of them changes nothing
 * that has already happened.
 *
 * Money is never computed here. Amounts, currency, fees, commission and the
 * agency split come from the database; this service carries them to the
 * provider and back.
 */
@Injectable()
export class PaymentProcessingService {
  constructor(
    private readonly repository: PaymentsRepository,
    private readonly gateway: PaymentGatewayService,
    private readonly audit: AuditService,
    private readonly logger: PinoLogger,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {
    this.logger.setContext(PaymentProcessingService.name);
  }

  // --- Charging -----------------------------------------------------------------

  async payForBooking(
    payerId: string,
    bookingId: string,
    context: AuditContext,
  ): Promise<PaymentOutcome> {
    const provider = this.gateway.providerName;
    let prepared: PaymentRow;
    try {
      prepared = await this.repository.prepare(payerId, bookingId, provider);
    } catch (error) {
      throw translateDatabaseError(error, 'We could not start that payment.');
    }

    const payment = await this.requireForProcessing(prepared.id);
    if (payment.status !== 'pending' && payment.status !== 'processing') {
      return { payment };
    }

    let init;
    try {
      init = await this.gateway.initializePayment({
        reference: payment.id,
        money: moneyOf(payment),
        customer: { email: payment.payer_email ?? '', name: payment.payer_name },
        description: 'DiaLearn lesson',
        returnUrl: `${this.config.appUrl}/bookings?payment=${payment.id}`,
        metadata: { bookingId: payment.booking_id, paymentId: payment.id },
      });
    } catch (error) {
      await this.event(payment, 'initialize', 'error');
      throw providerUnavailable(error);
    }

    await this.event(payment, 'initialize', init.status, {
      checkout: Boolean(init.checkoutUrl),
    });
    await this.repository.setProviderReference(payment.id, init.providerReference);

    if (init.status === 'failed') {
      const failed = await this.repository.markFailed(
        payment.id,
        init.failureReason ?? 'declined',
      );
      await this.auditPayment('payment.created', payerId, failed, context);
      throw new AppException(
        ErrorCode.CONFLICT,
        'The payment was declined. Please try again or use another method.',
        402,
      );
    }

    if (init.status === 'pending') {
      const refreshed = await this.requireForProcessing(payment.id);
      return {
        payment: refreshed,
        ...(init.checkoutUrl ? { checkoutUrl: init.checkoutUrl } : {}),
      };
    }

    // Reported successful at once — still believed only after verification.
    const confirmed = await this.confirmFromProvider(payment.id, init.providerReference);
    await this.auditPayment('payment.created', payerId, confirmed, context);
    return { payment: confirmed };
  }

  /** The payer returning from the provider: re-check with the provider. */
  async verifyForPayer(userId: string, paymentId: string): Promise<PaymentRow> {
    const payment = await this.requireForProcessing(paymentId);
    if (payment.payer_id !== userId) throw new NotFoundError('Payment');
    return this.confirmFromProvider(paymentId, payment.provider_reference);
  }

  /**
   * Asks the provider what happened and records it. Idempotent: a payment
   * already paid or failed is returned unchanged.
   */
  async confirmFromProvider(
    paymentId: string,
    providerReference: string | null,
  ): Promise<PaymentRow> {
    const payment = await this.requireForProcessing(paymentId);
    if (payment.status !== 'pending' && payment.status !== 'processing') return payment;

    let result;
    try {
      result = await this.gateway.verifyPayment({
        reference: payment.id,
        providerReference: providerReference ?? payment.provider_reference,
        expected: moneyOf(payment),
      });
    } catch (error) {
      await this.event(payment, 'verify', 'error');
      throw providerUnavailable(error);
    }
    await this.event(payment, 'verify', result.status, {}, result.amount, result.currency);

    if (result.status === 'failed') {
      return this.repository.markFailed(payment.id, result.failureReason ?? 'failed');
    }
    if (result.status === 'pending') return payment;

    if (result.amount === null || result.currency === null) {
      // A provider that cannot say what it collected cannot confirm a charge.
      this.logger.error({ paymentId }, 'Provider verified a payment without an amount');
      return payment;
    }
    try {
      return await this.repository.markPaid(
        payment.id,
        result.providerReference,
        result.amount,
        result.currency,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/PAYMENT_AMOUNT_MISMATCH/.test(message)) {
        // Left pending for a human: money arrived, but not the money expected.
        await this.event(
          payment,
          'verify',
          'amount_mismatch',
          {},
          result.amount,
          result.currency,
        );
        this.logger.error(
          { paymentId },
          'Provider amount or currency differs from the booking',
        );
        throw new AppException(
          ErrorCode.CONFLICT,
          'The payment amount did not match this booking. Our team has been alerted.',
          409,
        );
      }
      throw translateDatabaseError(error, 'We could not confirm that payment.');
    }
  }

  // --- Webhooks -------------------------------------------------------------------

  async handleWebhook(
    providerName: string,
    rawBody: Buffer | undefined,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ received: true; duplicate: boolean }> {
    let event;
    try {
      event = this.gateway.parseWebhook(providerName, rawBody, headers);
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        throw new UnauthenticatedError('Webhook signature could not be verified.');
      }
      throw error;
    }

    const paymentId =
      event.reference ??
      (event.providerReference
        ? await this.repository.findIdByProviderReference(
            providerName,
            event.providerReference,
          )
        : null);
    const refund = event.refundIdempotencyKey
      ? await this.repository.findRefundByKey(event.refundIdempotencyKey)
      : event.type.startsWith('refund.') && event.providerReference
        ? await this.repository.findRefundByProviderReference(event.providerReference)
        : null;

    const first = await this.repository.recordEvent({
      paymentId: (await this.exists(paymentId)) ? paymentId : (refund?.payment_id ?? null),
      refundId: refund?.id ?? null,
      provider: providerName,
      providerEventId: event.eventId,
      source: 'webhook',
      eventType: event.type,
      details: event.details,
    });
    if (!first) return { received: true, duplicate: true };

    if ((event.type === 'payment.succeeded' || event.type === 'payment.failed') && paymentId) {
      // The webhook says what happened; the provider, asked directly, decides.
      if (await this.exists(paymentId)) {
        await this.confirmFromProvider(paymentId, event.providerReference);
      }
    } else if (
      (event.type === 'refund.succeeded' || event.type === 'refund.failed') &&
      refund
    ) {
      await this.repository.recordRefundOutcome(refund.id, {
        status: event.type === 'refund.succeeded' ? 'succeeded' : 'failed',
        provider: providerName,
        providerRefundReference: event.providerReference,
        failureReason: event.type === 'refund.failed' ? 'reported failed by provider' : null,
        countAttempt: false,
      });
    }
    return { received: true, duplicate: false };
  }

  // --- Refunds ---------------------------------------------------------------------

  /**
   * Sends pending refunds to the provider, once each. The ledger rows are
   * written by the database whenever a refund is recorded on a payment (the
   * approval dispatcher, admin cancellation); this only carries them out.
   */
  async processPendingRefunds(paymentId: string | null = null): Promise<{
    processed: number;
    succeeded: number;
    pending: number;
    failed: number;
  }> {
    const rows = await this.repository.pendingRefunds(paymentId, MAX_REFUND_ATTEMPTS);
    const tally = { processed: 0, succeeded: 0, pending: 0, failed: 0 };

    for (const row of rows) {
      tally.processed += 1;
      const provider = this.gateway.providerName;

      if (!this.gateway.capabilities.refunds || row.payment_provider !== provider) {
        // Charged through a provider we are not configured for (or one that
        // cannot refund): leave it pending, clearly marked, for manual action.
        await this.repository.recordRefundOutcome(row.id, {
          status: 'pending',
          provider,
          providerRefundReference: null,
          failureReason: 'Manual refund required: charged through another provider.',
          countAttempt: true,
        });
        tally.pending += 1;
        continue;
      }
      if (!row.payment_provider_reference) {
        await this.repository.recordRefundOutcome(row.id, {
          status: 'pending',
          provider,
          providerRefundReference: null,
          failureReason: 'Manual refund required: the charge has no provider reference.',
          countAttempt: true,
        });
        tally.pending += 1;
        continue;
      }

      try {
        const result = await this.gateway.refundPayment({
          providerReference: row.payment_provider_reference,
          money: {
            amount: String(row.amount),
            currency: row.currency,
            decimals: row.currency_decimals,
          },
          idempotencyKey: row.idempotency_key,
        });
        await this.repository.recordRefundOutcome(row.id, {
          status: result.status,
          provider,
          providerRefundReference: result.providerRefundReference,
          failureReason: result.failureReason ?? null,
          countAttempt: true,
        });
        await this.repository.recordEvent({
          paymentId: row.payment_id,
          refundId: row.id,
          provider,
          source: 'api',
          eventType: 'refund',
          status: result.status,
          amount: String(row.amount),
          currency: row.currency,
        });
        tally[result.status] += 1;
        if (result.status === 'succeeded') {
          await this.audit.record('payment.refunded', {
            actorId: null,
            entityType: 'payment',
            entityId: row.payment_id,
            metadata: { refundId: row.id, amount: String(row.amount), currency: row.currency },
          });
        }
      } catch (error) {
        // Stays pending and is retried on the next run, up to the limit.
        await this.repository.recordRefundOutcome(row.id, {
          status: 'pending',
          provider,
          providerRefundReference: null,
          failureReason:
            error instanceof PaymentProviderError ? error.message : 'Provider error',
          countAttempt: true,
        });
        tally.pending += 1;
      }
    }
    return tally;
  }

  // --- helpers ---------------------------------------------------------------------

  private async requireForProcessing(paymentId: string): Promise<PaymentForProcessing> {
    const payment = await this.repository.forProcessing(paymentId);
    if (!payment) throw new NotFoundError('Payment');
    return payment;
  }

  private async exists(paymentId: string | null): Promise<boolean> {
    return paymentId !== null && /^[0-9a-f-]{36}$/i.test(paymentId)
      ? (await this.repository.forProcessing(paymentId)) !== null
      : false;
  }

  private event(
    payment: PaymentRow,
    type: string,
    status: string,
    details: Record<string, unknown> = {},
    amount: string | null = payment.amount === null ? null : String(payment.amount),
    currency: string | null = payment.currency,
  ): Promise<boolean> {
    return this.repository.recordEvent({
      paymentId: payment.id,
      provider: this.gateway.providerName,
      source: 'api',
      eventType: type,
      status,
      amount,
      currency,
      details,
    });
  }

  private async auditPayment(
    action: 'payment.created',
    actorId: string,
    payment: PaymentRow,
    context: AuditContext,
  ): Promise<void> {
    await this.audit.record(action, {
      actorId,
      entityType: 'payment',
      entityId: payment.id,
      context,
      // Amounts and identifiers only — never provider secrets or card data.
      metadata: {
        bookingId: payment.booking_id,
        amount: String(payment.amount),
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
      },
    });
  }
}

function moneyOf(payment: PaymentForProcessing): Money {
  return {
    amount: String(payment.amount),
    currency: payment.currency,
    decimals: payment.currency_decimals,
  };
}

function providerUnavailable(error: unknown): AppException {
  if (error instanceof AppException) return error;
  return new AppException(
    ErrorCode.INTEGRATION_UNAVAILABLE,
    'The payment service is unavailable right now. Please try again shortly.',
    503,
  );
}
