/**
 * The payment provider port.
 *
 * Everything DiaLearn needs from a payment provider, and nothing a particular
 * provider happens to offer. Booking, pricing and commission logic never see a
 * provider: they see PaymentGatewayService, which sees this interface. Adding
 * Paystack, Flutterwave or Stripe means writing one adapter that implements
 * it and naming it in configuration — nothing else changes.
 *
 * DiaLearn's requirements, and so the shape of the port:
 *
 *  - A lesson is charged once, for an amount the database computed. The
 *    provider receives that amount; it never proposes one.
 *  - A charge may complete immediately or later (redirect, bank transfer), so
 *    initialisation returns a status that may be `pending`.
 *  - Completion is only ever believed after the server asks the provider
 *    (`verifyPayment`) — never from the browser, and never from a webhook's
 *    claims alone.
 *  - Webhooks are authenticated by the adapter, which alone knows the
 *    provider's signature scheme; an unverifiable webhook is refused.
 *  - Refunds are recorded by DiaLearn's own approval process and then sent to
 *    the provider, once, under an idempotency key.
 *
 * Amounts cross this boundary as exact decimal strings in major units, with
 * the currency's minor-unit exponent alongside (from the currencies table), so
 * adapters convert without floats and without hardcoding a currency.
 */

export type ProviderPaymentStatus = 'succeeded' | 'pending' | 'failed';
export type ProviderRefundStatus = 'succeeded' | 'pending' | 'failed';

export interface Money {
  /** Exact decimal string in major units, e.g. "20.50". Never a float. */
  amount: string;
  /** ISO 4217 code, from the booking. */
  currency: string;
  /** Digits after the decimal point for this currency (currencies.decimals). */
  decimals: number;
}

export interface InitializePaymentRequest {
  /**
   * Our payment id. Sent as the provider's reference/idempotency key, so
   * initialising the same attempt twice cannot create two charges.
   */
  reference: string;
  money: Money;
  customer: { email: string; name?: string | null };
  description: string;
  /** Where a redirect-based provider sends the customer afterwards. */
  returnUrl: string;
  /** Opaque ids only (booking, payer). Never personal or card data. */
  metadata: Record<string, string>;
}

export interface InitializePaymentResult {
  status: ProviderPaymentStatus;
  /** The provider's id for the charge, stored in payments.provider_reference. */
  providerReference: string;
  /** Set when the customer must complete payment on the provider's page. */
  checkoutUrl?: string;
  failureReason?: string;
}

export interface VerifyPaymentRequest {
  reference: string;
  providerReference: string | null;
  /** What we expect; providers that can look the charge up report their own figures. */
  expected: Money;
}

export interface VerifyPaymentResult {
  status: ProviderPaymentStatus;
  providerReference: string;
  /** What the provider says it collected, exact decimal string in major units. */
  amount: string | null;
  currency: string | null;
  failureReason?: string;
}

export interface RefundPaymentRequest {
  providerReference: string;
  money: Money;
  /** Our refund ledger key; the provider must treat a repeat as the same refund. */
  idempotencyKey: string;
  reason?: string | undefined;
}

export interface RefundPaymentResult {
  status: ProviderRefundStatus;
  providerRefundReference: string | null;
  failureReason?: string;
}

export type WebhookEventType =
  'payment.succeeded' | 'payment.failed' | 'refund.succeeded' | 'refund.failed' | 'unknown';

/** A webhook after its signature has been verified by the adapter. */
export interface WebhookEvent {
  /** The provider's unique event id; duplicates are dropped on this. */
  eventId: string;
  type: WebhookEventType;
  /** Our payment id, if the provider echoes it. */
  reference: string | null;
  providerReference: string | null;
  /** For refund events: our refund ledger key, if echoed. */
  refundIdempotencyKey: string | null;
  /** Sanitised fields worth keeping in the audit trail. */
  details: Record<string, string | number | boolean | null>;
}

export class WebhookSignatureError extends Error {
  constructor(message = 'Webhook signature could not be verified.') {
    super(message);
    this.name = 'WebhookSignatureError';
  }
}

export interface PaymentProvider {
  /** Stored in payments.provider; also the webhook route segment. */
  readonly name: string;
  readonly capabilities: {
    /** Can refund through the provider (otherwise refunds stay manual). */
    refunds: boolean;
    /** Sends webhooks that this adapter can verify. */
    webhooks: boolean;
  };

  initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResult>;

  /** Server-side status check; the only source of truth for completion. */
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult>;

  /**
   * Authenticates and parses a webhook. Must throw WebhookSignatureError for
   * anything it cannot verify; the caller rejects the request.
   */
  parseWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookEvent;

  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult>;
}

export const PAYMENT_PROVIDER = Symbol('PaymentProvider');
