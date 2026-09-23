import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface BookingRow {
  id: string;
  student_id: string;
  tutor_id: string;
  booked_by: string;
  subject_id: string | null;
  education_level_id: string | null;
  starts_at: Date;
  ends_at: Date;
  duration_minutes: number;
  booking_timezone: string;
  hourly_rate: string;
  currency: string;
  total_amount: string;
  status: string;
  student_notes: string | null;
  tutor_accepted_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  created_at: Date;
}

export interface AvailableSlot {
  starts_at: Date;
  ends_at: Date;
}

export interface CreateBookingInput {
  studentId: string;
  tutorId: string;
  subjectId?: string | undefined;
  educationLevelId?: string | undefined;
  startsAt: Date;
  durationMinutes: number;
  timezone: string;
  studentNotes?: string | undefined;
  /** Captured from booking_quote() in the same transaction. */
  hourlyRate: string;
  currency: string;
  totalAmount: string;
  commissionRuleId: string | null;
}

@Injectable()
export class BookingsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Quotes and inserts in one transaction.
   *
   * The price has to be captured at booking time — bookings.total_amount is
   * what pay_for_booking() later charges, so a commission rule edited in
   * between must not change what an existing booking costs. Doing both in one
   * transaction is what makes "the price you were shown" and "the price
   * stored" the same number.
   *
   * The insert is subject to the bookings_insert RLS policy and to the
   * bookings_no_tutor_overlap / bookings_no_student_overlap exclusion
   * constraints, so double-booking is refused by the database rather than by a
   * check here that could race.
   */
  async createWithQuote(
    callerId: string,
    input: Omit<
      CreateBookingInput,
      'hourlyRate' | 'currency' | 'totalAmount' | 'commissionRuleId'
    >,
  ): Promise<BookingRow> {
    return this.prisma.withUser(callerId, async (tx) => {
      const quotes = await tx.$queryRaw<
        {
          currency: string;
          hourly_rate: string;
          total_amount: string;
          commission_rule_id: string | null;
        }[]
      >`select * from public.booking_quote(${input.tutorId}::uuid, ${input.durationMinutes})`;

      const quote = quotes[0];
      if (!quote) throw new Error('NO_QUOTE');

      const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);

      const rows = await tx.$queryRaw<BookingRow[]>`
        insert into public.bookings (
          student_id, tutor_id, booked_by, subject_id, education_level_id,
          starts_at, ends_at, duration_minutes, booking_timezone,
          hourly_rate, currency, total_amount, commission_rule_id, student_notes
        ) values (
          ${input.studentId}::uuid, ${input.tutorId}::uuid, ${callerId}::uuid,
          ${input.subjectId ?? null}::uuid, ${input.educationLevelId ?? null}::uuid,
          ${input.startsAt}, ${endsAt}, ${input.durationMinutes}, ${input.timezone},
          ${quote.hourly_rate}::numeric, ${quote.currency}, ${quote.total_amount}::numeric,
          ${quote.commission_rule_id}::uuid, ${input.studentNotes ?? null}
        )
        returning id, student_id, tutor_id, booked_by, subject_id, education_level_id,
                  starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate,
                  currency, total_amount, status::text, student_notes, tutor_accepted_at,
                  cancelled_at, cancellation_reason, created_at
      `;
      return rows[0]!;
    });
  }

  /** Bookings the caller may see. RLS decides which those are. */
  async list(
    userId: string,
    query: PaginationQueryDto,
    filters: { status?: string | undefined; from?: Date | undefined; to?: Date | undefined },
  ): Promise<{ rows: BookingRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<BookingRow[]>`
        select id, student_id, tutor_id, booked_by, subject_id, education_level_id,
               starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate,
               currency, total_amount, status::text, student_notes, tutor_accepted_at,
               cancelled_at, cancellation_reason, created_at
        from public.bookings
        where (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or starts_at <= ${filters.to ?? null})
        order by starts_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n
        from public.bookings
        where (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or starts_at <= ${filters.to ?? null})
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async findById(userId: string, id: string): Promise<BookingRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<BookingRow[]>`
        select id, student_id, tutor_id, booked_by, subject_id, education_level_id,
               starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate,
               currency, total_amount, status::text, student_notes, tutor_accepted_at,
               cancelled_at, cancellation_reason, created_at
        from public.bookings where id = ${id}::uuid
      `;
      return rows[0] ?? null;
    });
  }

  /** Bookable slots, honouring the tutor's availability_windows. */
  async availableSlots(
    callerId: string,
    input: { tutorId: string; from: Date; days: number; durationMinutes: number },
  ): Promise<AvailableSlot[]> {
    return this.prisma.withUser(
      callerId,
      async (tx) =>
        tx.$queryRaw<AvailableSlot[]>`
        select * from public.tutor_available_slots(
          ${input.tutorId}::uuid, ${input.from}, ${input.days}, ${input.durationMinutes}
        )
      `,
    );
  }

  /** Accept or decline, via tutor_respond_booking(). Returns the new status. */
  async respond(tutorUserId: string, bookingId: string, accept: boolean): Promise<string> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<{ status: string }[]>`
        select public.tutor_respond_booking(${bookingId}::uuid, ${accept})::text as status
      `;
      return rows[0]!.status;
    });
  }

  /** The tutor's own schedule, via tutor_bookings(). */
  async tutorSchedule(
    tutorUserId: string,
    input: { from?: Date | undefined; to?: Date | undefined; status?: string | undefined },
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      tutorUserId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_bookings(
          ${input.from ?? null}::timestamptz,
          ${input.to ?? null}::timestamptz,
          ${input.status ?? null}::text
        )
      `,
    );
  }

  async openClass(
    tutorUserId: string,
    bookingId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_open_class(${bookingId}::uuid)
      `;
      return rows[0] ?? null;
    });
  }

  async startClass(tutorUserId: string, bookingId: string): Promise<void> {
    await this.prisma.withUser(tutorUserId, async (tx) => {
      await tx.$executeRaw`select public.tutor_start_class(${bookingId}::uuid)`;
    });
  }

  async endClass(
    tutorUserId: string,
    bookingId: string,
    studentAttended: boolean,
  ): Promise<void> {
    await this.prisma.withUser(tutorUserId, async (tx) => {
      await tx.$executeRaw`
        select public.tutor_end_class(${bookingId}::uuid, ${studentAttended})
      `;
    });
  }

  /** Admin cancellation with a refund percentage. */
  async adminCancel(
    adminId: string,
    input: { bookingId: string; reason: string; refundPercentage: number },
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.admin_cancel_booking(
          ${input.bookingId}::uuid, ${input.reason}, ${input.refundPercentage}::numeric
        )
      `;
      return rows[0] ?? null;
    });
  }
}
