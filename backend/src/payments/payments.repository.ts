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
  created_at: Date;
}

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

  /**
   * Pays for a booking through pay_for_booking().
   *
   * That function is the only sanctioned write path into payments: the table
   * grants writes to admins alone, and the function carries the payer check,
   * the ALREADY_PAID guard and the fee split. Calling it inside the payer's
   * claims is what makes those checks apply to the right person.
   */
  async payForBooking(payerId: string, bookingId: string): Promise<PaymentRow> {
    return this.prisma.withUser(payerId, async (tx) => {
      // `select * from f()`, never `select (f()).*`.
      //
      // Expanding a composite with `(f()).*` makes PostgreSQL re-evaluate the
      // function once per output column — 19 times for public.payments. The
      // first call charged and the rest raised ALREADY_PAID, so the request
      // 500'd on a payment that had in fact succeeded. With a real gateway
      // instead of the simulated provider, that is 19 charges.
      const rows = await tx.$queryRaw<PaymentRow[]>`
        select * from public.pay_for_booking(${bookingId}::uuid)
      `;
      return rows[0]!;
    });
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
}
