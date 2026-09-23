/**
 * Payment port.
 *
 * Today DiaLearn has no gateway. pay_for_booking() inserts a payments row with
 * status 'paid' and computes the fee/commission split — an instant simulated
 * charge. `payments.provider` and `payments.provider_reference` exist on the
 * table and are unused, which is the seam this port formalises.
 *
 * The interface is shaped for a real gateway rather than for the simulation:
 * charges are asynchronous, carry an idempotency key, and are confirmed by
 * webhook. Designing to the simulation would guarantee a rewrite later.
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ChargeRequest {
  /** Booking being paid for. Becomes provider metadata. */
  bookingId: string;
  /** Minor units (kobo, cents) — never a float. */
  amountMinor: number;
  currency: string;
  customerEmail: string;
  /**
   * Caller-supplied key that makes a retry safe. A double-submitted checkout
   * must not charge twice; the existing RPC guards this with an ALREADY_PAID
   * check, which a real gateway cannot rely on.
   */
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  status: PaymentStatus;
  /** The provider's own id, stored in payments.provider_reference. */
  reference: string;
  /** Set when the provider needs the customer to complete payment off-site. */
  redirectUrl?: string;
}

export interface RefundRequest {
  reference: string;
  amountMinor?: number;
  reason?: string;
}

export interface RefundResult {
  status: PaymentStatus;
  reference: string;
}

export interface PaymentProvider {
  /** Value written to payments.provider. */
  readonly name: string;
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(request: RefundRequest): Promise<RefundResult>;
  /**
   * Verifies a webhook signature. Returning false must cause the caller to
   * reject the request — an unverified webhook is an unauthenticated request
   * that can mark any booking paid.
   */
  verifyWebhook(payload: string | Buffer, signature: string): boolean;
}

export const PAYMENT_PROVIDER = Symbol('PaymentProvider');
