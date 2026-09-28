import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface BookingRow {
  id: string;
  subject_name?: string | null;
  paid?: boolean;
  session_meeting_url?: string | null;
  session_status?: string | null;
  session_id?: string | null;
  session_tutor_notes?: string | null;
  session_homework?: string | null;
  tutor_name?: string | null;
  tutor_avatar_url?: string | null;
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
          cancellation_policy_id: string | null;
        }[]
      >`select * from public.booking_quote(${input.tutorId}::uuid, ${input.durationMinutes})`;

      const quote = quotes[0];
      if (!quote) throw new Error('NO_QUOTE');

      const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);

      const rows = await tx.$queryRaw<BookingRow[]>`
        insert into public.bookings (
          student_id, tutor_id, booked_by, subject_id, education_level_id,
          starts_at, ends_at, duration_minutes, booking_timezone,
          hourly_rate, currency, total_amount, commission_rule_id,
          cancellation_policy_id, student_notes
        ) values (
          ${input.studentId}::uuid, ${input.tutorId}::uuid, ${callerId}::uuid,
          ${input.subjectId ?? null}::uuid, ${input.educationLevelId ?? null}::uuid,
          ${input.startsAt}, ${endsAt}, ${input.durationMinutes}, ${input.timezone},
          ${quote.hourly_rate}::numeric, ${quote.currency}, ${quote.total_amount}::numeric,
          ${quote.commission_rule_id}::uuid, ${quote.cancellation_policy_id}::uuid,
          ${input.studentNotes ?? null}
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
        select b.id, b.student_id, b.tutor_id, b.booked_by, b.subject_id, b.education_level_id,
               b.starts_at, b.ends_at, b.duration_minutes, b.booking_timezone, b.hourly_rate,
               b.currency, b.total_amount, b.status::text, b.student_notes, b.tutor_accepted_at,
               b.cancelled_at, b.cancellation_reason, b.created_at,
               sub.name as subject_name,
               exists(select 1 from public.payments p where p.booking_id = b.id and p.status = 'paid') as paid,
               cs.meeting_url as session_meeting_url, cs.status::text as session_status,
               cs.id as session_id, cs.tutor_notes as session_tutor_notes,
               cs.homework as session_homework,
               tp.full_name as tutor_name, tp.avatar_url as tutor_avatar_url
        from public.bookings b
        left join public.subjects sub on sub.id = b.subject_id
        left join public.class_sessions cs on cs.booking_id = b.id
        left join public.tutors t on t.id = b.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        where (${filters.status ?? null}::text is null or b.status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or b.starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or b.starts_at <= ${filters.to ?? null})
        order by b.starts_at desc
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

  /**
   * Rates a lesson. The tutor and student come from the booking, read under
   * the caller's claims — so a booking the caller cannot see cannot be rated,
   * and the request cannot point a rating at a different tutor.
   */
  async rate(
    userId: string,
    bookingId: string,
    input: { score: number; comment?: string | undefined },
  ): Promise<'rated' | 'not_found' | 'not_completed'> {
    return this.prisma.withUser(userId, async (tx) => {
      const found = await tx.$queryRaw<
        { tutor_id: string; student_id: string; status: string }[]
      >`
        select tutor_id, student_id, status::text from public.bookings where id = ${bookingId}::uuid
      `;
      const booking = found[0];
      if (!booking) return 'not_found';
      if (booking.status !== 'completed') return 'not_completed';

      await tx.$executeRaw`
        insert into public.ratings (booking_id, tutor_id, student_id, rater_id, score, comment)
        values (${bookingId}::uuid, ${booking.tutor_id}::uuid, ${booking.student_id}::uuid,
                ${userId}::uuid, ${input.score}, ${input.comment ?? null})
      `;
      return 'rated';
    });
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
    input: { from?: Date | undefined; to?: Date | undefined; statuses?: string[] | undefined },
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      tutorUserId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_bookings(
          ${input.from ?? null}::timestamptz,
          ${input.to ?? null}::timestamptz,
          ${input.statuses ?? null}::public.booking_status[]
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
    studentAttended: boolean | undefined,
  ): Promise<void> {
    await this.prisma.withUser(tutorUserId, async (tx) => {
      await tx.$executeRaw`
        select public.tutor_end_class(${bookingId}::uuid, ${studentAttended ?? null}::boolean)
      `;
    });
  }

  /**
   * raise_dispute() checks the caller is a party to the booking (booked_by,
   * the student, their parent or the tutor) and fills in who it is against.
   */
  async raiseDispute(
    userId: string,
    bookingId: string,
    input: { category: string; description: string },
  ): Promise<string> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.raise_dispute(
          ${bookingId}::uuid, ${input.category}::public.dispute_category, ${input.description}
        ) as id
      `;
      return rows[0]!.id;
    });
  }
}
