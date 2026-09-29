import { createHmac, timingSafeEqual } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import {
  WebhookSignatureError,
  type InitializePaymentRequest,
  type InitializePaymentResult,
  type PaymentProvider,
  type RefundPaymentRequest,
  type RefundPaymentResult,
  type VerifyPaymentRequest,
  type VerifyPaymentResult,
  type WebhookEvent,
  type WebhookEventType,
} from '../payment.interface';

const SIGNATURE_HEADER = 'x-dialearn-signature';

/**
 * PLACEHOLDER ADAPTER — no money moves.
 *
 * DiaLearn has not chosen a payment provider. This adapter keeps today's
 * behaviour (an instant successful charge) so the product works end to end,
 * while exercising the real flow: initialise → verify server-side → confirm,
 * webhooks, and refunds. It invents nothing about any real provider.
 *
 * Its webhook format is its own, for testing the webhook pipeline only: a JSON
 * body signed with HMAC-SHA256 over the raw bytes, keyed by
 * PAYMENT_WEBHOOK_SECRET, hex in the `x-dialearn-signature` header. With no
 * secret configured every webhook is refused.
 *
 * It must never be selected in production; AppModule refuses that at startup.
 */
@Injectable()
export class SimulatedPaymentProvider implements PaymentProvider {
  readonly name = 'simulated';
  readonly capabilities = { refunds: true, webhooks: true };

  constructor(
    private readonly logger: PinoLogger,
    private readonly webhookSecret: string | undefined,
  ) {
    this.logger.setContext(SimulatedPaymentProvider.name);
  }

  async initializePayment(
    request: InitializePaymentRequest,
  ): Promise<InitializePaymentResult> {
    this.logger.warn(
      {
        reference: request.reference,
        amount: request.money.amount,
        currency: request.money.currency,
      },
      'Simulated charge — no money moved',
    );
    // Deterministic from our reference: initialising the same attempt twice
    // yields the same provider reference, as a real idempotency key would.
    return { status: 'succeeded', providerReference: `sim_${request.reference}` };
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    // There is no ledger to consult, so the simulation reports the charge it
    // would have made. A real adapter returns the provider's own figures.
    return {
      status: 'succeeded',
      providerReference: request.providerReference ?? `sim_${request.reference}`,
      amount: request.expected.amount,
      currency: request.expected.currency,
    };
  }

  parseWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookEvent {
    const secret = this.webhookSecret;
    const header = headers[SIGNATURE_HEADER];
    const signature = Array.isArray(header) ? header[0] : header;
    if (!secret || !signature) throw new WebhookSignatureError();

    const expected = createHmac('sha256', secret).update(rawBody).digest();
    const given = Buffer.from(signature, 'hex');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      throw new WebhookSignatureError();
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
    } catch {
      throw new WebhookSignatureError('Webhook body is not valid JSON.');
    }
    const text = (v: unknown) => (typeof v === 'string' && v ? v : null);
    const eventId = text(body['id']);
    if (!eventId) throw new WebhookSignatureError('Webhook has no event id.');

    const known: WebhookEventType[] = [
      'payment.succeeded',
      'payment.failed',
      'refund.succeeded',
      'refund.failed',
    ];
    const type = known.includes(body['type'] as WebhookEventType)
      ? (body['type'] as WebhookEventType)
      : 'unknown';

    return {
      eventId,
      type,
      reference: text(body['reference']),
      providerReference: text(body['providerReference']),
      refundIdempotencyKey: text(body['refundKey']),
      details: { type: String(body['type'] ?? '') },
    };
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult> {
    this.logger.warn(
      { idempotencyKey: request.idempotencyKey, amount: request.money.amount },
      'Simulated refund — no money moved',
    );
    return {
      status: 'succeeded',
      providerRefundReference: `simref_${request.idempotencyKey}`,
    };
  }
}
