import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotFoundError } from '../common/exceptions/app.exception';
import { translateDatabaseError } from '../common/exceptions/database-errors';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { PaymentResponse, PayoutResponse } from './dto/payment.dto';
import { PaymentsRepository, type PaymentRow, type PayoutRow } from './payments.repository';
import { PaymentProcessingService } from './services/payment-processing.service';
import { PricingService, type BookingQuote } from './services/pricing.service';
import {
  SettlementService,
  type EarningsSummary,
  type SettlementPolicy,
} from './services/settlement.service';

/**
 * Payments, commission and payouts.
 *
 * The arithmetic is not here. Quotes come from booking_quote() and charges from
 * payment_prepare() (via PaymentProcessingService), both of which encode the fee split, the tiered
 * commission window and the rule that `amount` is the total captured at quote
 * time — so a later rule change never retroactively alters an existing charge.
 * This service orchestrates, audits, and shapes responses.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly repository: PaymentsRepository,
    private readonly pricing: PricingService,
    private readonly settlement: SettlementService,
    private readonly audit: AuditService,
    private readonly processing: PaymentProcessingService,
  ) {}

  async quote(
    callerId: string,
    input: { tutorId: string; durationMinutes: number },
  ): Promise<BookingQuote> {
    return this.pricing.quote(callerId, input);
  }

  /**
   * Pays for a booking through the configured payment provider. The provider
   * flow — prepare, charge, server-side verification, confirmation — lives in
   * PaymentProcessingService; this keeps the controller's contract.
   */
  async payForBooking(
    payerId: string,
    bookingId: string,
    context: AuditContext,
  ): Promise<PaymentResponse> {
    const outcome = await this.processing.payForBooking(payerId, bookingId, context);
    return {
      ...toPaymentResponse(outcome.payment),
      ...(outcome.checkoutUrl ? { checkoutUrl: outcome.checkoutUrl } : {}),
    };
  }

  async verify(userId: string, paymentId: string): Promise<PaymentResponse> {
    return toPaymentResponse(await this.processing.verifyForPayer(userId, paymentId));
  }

  async list(userId: string, query: PaginationQueryDto): Promise<Paginated<PaymentResponse>> {
    const { rows, total } = await this.repository.listForUser(userId, query);
    return paginate(rows.map(toPaymentResponse), total, query);
  }

  async findOne(userId: string, id: string): Promise<PaymentResponse> {
    const row = await this.repository.findById(userId, id);
    if (!row) throw new NotFoundError('Payment');
    return toPaymentResponse(row);
  }

  // --- Tutor earnings and payouts -------------------------------------------

  async earnings(tutorUserId: string): Promise<EarningsSummary | null> {
    return this.settlement.earnings(tutorUserId);
  }

  async earningsRecords(
    tutorUserId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.repository.earningsRecords(tutorUserId, query);
  }

  async settlementPolicy(): Promise<SettlementPolicy> {
    return this.settlement.policy();
  }

  async requestPayout(
    tutorUserId: string,
    amount: number,
    context: AuditContext,
  ): Promise<{ id: string }> {
    // Checked before the call so the tutor sees the configured minimum rather
    // than a raised database exception.
    await this.settlement.assertPayoutAllowed(amount);

    let id: string;
    try {
      id = await this.repository.requestPayout(tutorUserId, amount);
    } catch (error) {
      throw translateDatabaseError(error, 'We could not request that payout.');
    }

    await this.audit.record('payout.requested', {
      actorId: tutorUserId,
      entityType: 'payout',
      entityId: id,
      context,
      metadata: { amount: String(amount) },
    });

    return { id };
  }

  async listPayouts(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Paginated<PayoutResponse>> {
    const { rows, total } = await this.repository.listPayouts(userId, query);
    return paginate(rows.map(toPayoutResponse), total, query);
  }
}

export function toPaymentResponse(row: PaymentRow): PaymentResponse {
  return {
    id: row.id,
    bookingId: row.booking_id,
    amount: String(row.amount),
    currency: row.currency,
    platformFee: String(row.platform_fee),
    commissionAmount: String(row.commission_amount),
    tutorPayout: String(row.tutor_payout),
    status: row.status,
    provider: row.provider,
    providerReference: row.provider_reference,
    refundedAmount: row.refunded_amount === null ? null : String(row.refunded_amount),
    paidAt: row.paid_at ? row.paid_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

export function toPayoutResponse(row: PayoutRow): PayoutResponse {
  return {
    id: row.id,
    amount: String(row.amount),
    currency: row.currency,
    status: row.status,
    reference: row.reference,
    notes: row.notes,
    requestedAt: row.requested_at.toISOString(),
    settledAt: row.settled_at ? row.settled_at.toISOString() : null,
  };
}
