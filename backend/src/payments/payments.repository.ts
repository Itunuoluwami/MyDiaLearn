import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface PaymentRow {
  id: string;
  booking_id: string;
  payer_id: string;
  tutor_id: string;
  amount: string;
  currency: string;
  platform_fee: string;
  commission_amount: string;
  tutor_payout: string;
  status: string;
  provider: string | null;
  provider_reference: string | null;
  paid_at: Date | null;
  refunded_amount: string | null;
  failure_reason?: string | null;
  created_at: Date;
}

/** A payment with what the provider needs to process it. System read. */
export interface PaymentForProcessing extends PaymentRow {
  currency_decimals: number;
  payer_email: string | null;
  payer_name: string | null;
  booking_status: string;
}

export interface RefundLedgerRow {
  id: string;
  payment_id: string;
  amount: string;
  currency: string;
  currency_decimals: number;
  idempotency_key: string;
  status: string;
  attempts: number;
  payment_provider: string | null;
  payment_provider_reference: string | null;
}

const PAYMENT_COLUMNS = `
  p.id, p.booking_id, p.payer_id, p.tutor_id, p.amount, p.currency, p.platform_fee,
  p.commission_amount, p.tutor_payout, p.status::text, p.provider, p.provider_reference,
  p.paid_at, p.refunded_amount, p.failure_reason, p.created_at
`;

export interface PayoutRow {
  id: string;
  tutor_id: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  notes: string | null;
  requested_at: Date;
  settled_at: Date | null;
}

@Injectable()
export class PaymentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /** Payments the caller is party to. RLS decides which those are. */
  async listForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: PaymentRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<PaymentRow[]>`
        select id, booking_id, payer_id, tutor_id, amount, currency, platform_fee,
               commission_amount, tutor_payout, status::text, provider, provider_reference,
               paid_at, refunded_amount, created_at
        from public.payments
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.payments
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async findById(userId: string, id: string): Promise<PaymentRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<PaymentRow[]>`
        select id, booking_id, payer_id, tutor_id, amount, currency, platform_fee,
               commission_amount, tutor_payout, status::text, provider, provider_reference,
               paid_at, refunded_amount, created_at
        from public.payments where id = ${id}::uuid
      `;
      return rows[0] ?? null;
    });
  }

  /** Tutor earnings ledger, paginated by the function's own limit/offset. */
  async earningsRecords(
    tutorUserId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      tutorUserId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_earnings_records(${query.limit}, ${query.skip})
      `,
    );
  }

  async requestPayout(tutorUserId: string, amount: number): Promise<string> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.tutor_request_payout(${amount}::numeric) as id
      `;
      return rows[0]!.id;
    });
  }

  async listPayouts(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: PayoutRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<PayoutRow[]>`
        select id, tutor_id, amount, currency, status::text, reference, notes,
               requested_at, settled_at
        from public.payouts
        order by requested_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.payouts
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  // --- Provider flow ------------------------------------------------------------
  //
  // prepare() runs in the payer's claims: payment_prepare() checks they may pay
  // for the booking. The confirm/fail/event/refund writes are the server's own
  // decisions after verifying with the provider, and run without user claims;
  // payment_mark_paid() and payment_mark_failed() are not executable by
  // anyone but the API's database role.

  async prepare(payerId: string, bookingId: string, provider: string): Promise<PaymentRow> {
    return this.prisma.withUser(payerId, async (tx) => {
      const rows = await tx.$queryRaw<PaymentRow[]>`
        select * from public.payment_prepare(${bookingId}::uuid, ${provider})
      `;
      return rows[0]!;
    });
  }

  async forProcessing(paymentId: string): Promise<PaymentForProcessing | null> {
    const rows = await this.prisma.$queryRawUnsafe<PaymentForProcessing[]>(
      `select ${PAYMENT_COLUMNS},
              coalesce(cur.decimals, 2)::int as currency_decimals,
              pr.email as payer_email, pr.full_name as payer_name,
              b.status::text as booking_status
       from public.payments p
       join public.bookings b on b.id = p.booking_id
       left join public.currencies cur on cur.code = p.currency
       left join public.profiles pr on pr.id = p.payer_id
       where p.id = $1::uuid`,
      paymentId,
    );
    return rows[0] ?? null;
  }

  async findIdByProviderReference(
    provider: string,
    providerReference: string,
  ): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      select id from public.payments
      where provider = ${provider} and provider_reference = ${providerReference}
      order by created_at desc limit 1
    `;
    return rows[0]?.id ?? null;
  }

  async setProviderReference(paymentId: string, providerReference: string): Promise<void> {
    await this.prisma.$executeRaw`
      update public.payments set provider_reference = ${providerReference}
      where id = ${paymentId}::uuid and provider_reference is distinct from ${providerReference}
    `;
  }

  async markPaid(
    paymentId: string,
    providerReference: string,
    amount: string,
    currency: string,
  ): Promise<PaymentRow> {
    const rows = await this.prisma.$queryRaw<PaymentRow[]>`
      select * from public.payment_mark_paid(
        ${paymentId}::uuid, ${providerReference}, ${amount}::numeric, ${currency}
      )
    `;
    return rows[0]!;
  }

  async markFailed(paymentId: string, reason: string): Promise<PaymentRow> {
    const rows = await this.prisma.$queryRaw<PaymentRow[]>`
      select * from public.payment_mark_failed(${paymentId}::uuid, ${reason})
    `;
    return rows[0]!;
  }

  /**
   * Appends to the payment audit trail. For webhooks, the provider's event id
   * is unique: a redelivered event inserts nothing and returns false, which
   * is how duplicates are dropped before they touch any financial record.
   */
  async recordEvent(event: {
    paymentId: string | null;
    refundId?: string | null;
    provider: string;
    providerEventId?: string | null;
    source: 'api' | 'webhook';
    eventType: string;
    status?: string | null;
    amount?: string | null;
    currency?: string | null;
    details?: Record<string, unknown>;
  }): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      insert into public.payment_events
        (payment_id, refund_id, provider, provider_event_id, source, event_type, status,
         amount, currency, details)
      values (${event.paymentId}::uuid, ${event.refundId ?? null}::uuid, ${event.provider},
              ${event.providerEventId ?? null}, ${event.source}, ${event.eventType},
              ${event.status ?? null}, ${event.amount ?? null}::numeric, ${event.currency ?? null},
              ${JSON.stringify(event.details ?? {})}::jsonb)
      on conflict (provider, provider_event_id) where provider_event_id is not null do nothing
      returning id
    `;
    return rows.length > 0;
  }

  async pendingRefunds(
    paymentId: string | null,
    maxAttempts: number,
  ): Promise<RefundLedgerRow[]> {
    return this.prisma.$queryRaw<RefundLedgerRow[]>`
      select r.id, r.payment_id, r.amount, r.currency, coalesce(cur.decimals, 2)::int as currency_decimals,
             r.idempotency_key, r.status, r.attempts,
             p.provider as payment_provider, p.provider_reference as payment_provider_reference
      from public.payment_refunds r
      join public.payments p on p.id = r.payment_id
      left join public.currencies cur on cur.code = r.currency
      where r.status = 'pending' and r.attempts < ${maxAttempts}
        and (${paymentId}::uuid is null or r.payment_id = ${paymentId}::uuid)
      order by r.requested_at
      limit 50
    `;
  }

  async findRefundByKey(key: string): Promise<{ id: string; payment_id: string } | null> {
    const rows = await this.prisma.$queryRaw<{ id: string; payment_id: string }[]>`
      select id, payment_id from public.payment_refunds where idempotency_key = ${key}
    `;
    return rows[0] ?? null;
  }

  async findRefundByProviderReference(
    reference: string,
  ): Promise<{ id: string; payment_id: string } | null> {
    const rows = await this.prisma.$queryRaw<{ id: string; payment_id: string }[]>`
      select id, payment_id from public.payment_refunds where provider_refund_reference = ${reference}
    `;
    return rows[0] ?? null;
  }

  /** A settled refund is final; a later event cannot reopen it. */
  async recordRefundOutcome(
    refundId: string,
    outcome: {
      status: 'pending' | 'succeeded' | 'failed';
      provider: string;
      providerRefundReference: string | null;
      failureReason: string | null;
      countAttempt: boolean;
    },
  ): Promise<void> {
    await this.prisma.$executeRaw`
      update public.payment_refunds set
        status = ${outcome.status},
        provider = ${outcome.provider},
        provider_refund_reference = coalesce(${outcome.providerRefundReference}, provider_refund_reference),
        failure_reason = ${outcome.failureReason},
        attempts = attempts + ${outcome.countAttempt ? 1 : 0},
        completed_at = case when ${outcome.status} in ('succeeded', 'failed') then now() end
      where id = ${refundId}::uuid and status = 'pending'
    `;
  }
}
