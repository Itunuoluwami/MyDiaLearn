import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
import { ConflictError, NotAuthorizedError } from '../common/exceptions/app.exception';

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

/**
 * Who to tell about a booking, and what to call them.
 *
 * Addressing a notification is system work, not the actor's: when a tutor
 * accepts, the person to notify is the family, and when a family books, it is
 * the tutor. Neither can necessarily read the other's profile under RLS, so
 * this one lookup runs on the owner connection — the same way template lookups
 * and audit writes do.
 */
export interface BookingNotificationContext {
  id: string;
  starts_at: Date;
  /** The timezone the family booked in. */
  booking_timezone: string;
  /** The tutor's own, for notices addressed to them. */
  tutor_timezone: string;
  total_amount: string;
  currency: string;
  subject_name: string | null;
  tutor_user_id: string;
  tutor_name: string | null;
  tutor_email: string | null;
  student_name: string;
  /** The learner's own login, when they have one. */
  student_user_id: string | null;
  student_email: string | null;
  /** Whoever made the booking: the learner themselves, or their parent. */
  booker_user_id: string;
  booker_name: string | null;
  booker_email: string | null;
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
      // The bookings insert policy: the caller must be able to act for the
      // student (their own record, or their child). No row-level security on
      // this connection, so it is checked here.
      const allowed = await tx.$queryRaw<{ ok: boolean }[]>`
        select (public.can_access_student(${input.studentId}::uuid) or public.is_admin()) as ok
      `;
      if (!allowed[0]?.ok) throw new NotAuthorizedError('You cannot book for this student.');

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
  /**
   * Both sides of a booking, for addressing notifications.
   *
   * Owner connection on purpose: see BookingNotificationContext. Returns null
   * when the booking has gone, so a caller never has to guard separately.
   */
  async notificationContext(bookingId: string): Promise<BookingNotificationContext | null> {
    const rows = await this.prisma.$queryRaw<BookingNotificationContext[]>`
      select b.id,
             b.starts_at,
             b.booking_timezone,
             coalesce(t.timezone, b.booking_timezone) as tutor_timezone,
             b.total_amount::text as total_amount,
             b.currency,
             sub.name                  as subject_name,
             t.profile_id              as tutor_user_id,
             tp.full_name              as tutor_name,
             tp.email                  as tutor_email,
             trim(concat(s.first_name, ' ', coalesce(s.last_name, ''))) as student_name,
             sp.id                     as student_user_id,
             sp.email                  as student_email,
             b.booked_by               as booker_user_id,
             bp.full_name              as booker_name,
             bp.email                  as booker_email
      from public.bookings b
      join public.tutors t          on t.id = b.tutor_id
      join public.profiles tp       on tp.id = t.profile_id
      join public.students s        on s.id = b.student_id
      left join public.profiles sp  on sp.id = s.profile_id
      left join public.profiles bp  on bp.id = b.booked_by
      left join public.subjects sub on sub.id = b.subject_id
      where b.id = ${bookingId}::uuid
      limit 1
    `;
    return rows[0] ?? null;
  }

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
        select tutor_id, student_id, status::text from public.bookings
        where id = ${bookingId}::uuid
          and (booked_by = auth.uid() or public.can_access_student(student_id))
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

  /**
   * The classroom as a family member sees it, marking them present.
   *
   * The tutor has `tutor_open_class()`; the family had nothing, and the student
   * screen read `meeting_url` off the booking list instead. That meant no
   * authorization of its own, no session row when the tutor had not opened one,
   * and nowhere to record that the learner turned up — so `student_attended`
   * stayed null however many lessons were taught.
   *
   * `can_access_booking()` is the same check the row-level security policies
   * use, so a parent, the learner and the tutor all pass and nobody else does.
   */
  async joinClass(userId: string, bookingId: string): Promise<Record<string, unknown> | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const allowed = await tx.$queryRaw<{ ok: boolean }[]>`
        select public.can_access_booking(${bookingId}::uuid) as ok
      `;
      if (!allowed[0]?.ok) throw new NotAuthorizedError('That class is not yours to join.');

      const ready = await tx.$queryRaw<{ status: string }[]>`
        select status::text from public.bookings where id = ${bookingId}::uuid
      `;
      const status = ready[0]?.status;
      if (!status) return null;
      if (!['confirmed', 'in_progress', 'completed'].includes(status)) {
        throw new ConflictError('This lesson is not confirmed yet.');
      }

      // The tutor may not have opened the room yet; the learner arriving first
      // is normal and should not be an error.
      await tx.$executeRaw`
        insert into public.class_sessions (booking_id, status)
        -- class_sessions.status is booking_status, mirroring the booking.
        select ${bookingId}::uuid, ${status}::public.booking_status
        where not exists (
          select 1 from public.class_sessions where booking_id = ${bookingId}::uuid
        )
      `;
      await tx.$executeRaw`
        update public.class_sessions
           set student_attended = true, updated_at = now()
         where booking_id = ${bookingId}::uuid
      `;

      const rows = await tx.$queryRaw<Record<string, unknown>[]>`
        select cs.id, cs.meeting_url, cs.meeting_provider, cs.started_at, cs.ended_at,
               cs.status::text as status,
               b.starts_at, b.ends_at, b.duration_minutes,
               sub.name as subject_name,
               tp.full_name as tutor_name
        from public.class_sessions cs
        join public.bookings b       on b.id = cs.booking_id
        join public.tutors t         on t.id = b.tutor_id
        join public.profiles tp      on tp.id = t.profile_id
        left join public.subjects sub on sub.id = b.subject_id
        where cs.booking_id = ${bookingId}::uuid
        limit 1
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * Records the room a provider handed back.
   *
   * Owner connection: provisioning happens on the system's behalf when the
   * tutor opens the class, and the columns were designed for exactly this.
   */
  async setMeetingRoom(
    bookingId: string,
    meetingUrl: string,
    provider: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      update public.class_sessions
         set meeting_url = ${meetingUrl}, meeting_provider = ${provider}, updated_at = now()
       where booking_id = ${bookingId}::uuid
    `;
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

  /** Ratings the caller has written, so the history page knows what is rated. */
  async myRatings(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, booking_id, tutor_id, score, comment, created_at
        from public.ratings where rater_id = ${userId}::uuid
        order by created_at desc
      `,
    );
  }

  /**
   * A family cancels a lesson it has not paid for. The same condition the
   * bookings page offers the button under: still pending and unpaid. A paid
   * or confirmed lesson is cancelled by an admin, where the cancellation
   * policy's refund applies. Access mirrors the bookings update policy.
   */
  async cancelByFamily(
    userId: string,
    bookingId: string,
    reason: string,
  ): Promise<'cancelled' | 'not_found' | 'not_cancellable'> {
    return this.prisma.withUser(userId, async (tx) => {
      const found = await tx.$queryRaw<{ status: string; paid: boolean }[]>`
        select b.status::text as status,
               exists(select 1 from public.payments p
                      where p.booking_id = b.id and p.status in ('paid', 'processing')) as paid
        from public.bookings b
        where b.id = ${bookingId}::uuid
          and (b.booked_by = auth.uid() or public.can_access_student(b.student_id))
        for update
      `;
      const booking = found[0];
      if (!booking) return 'not_found';
      if (booking.status !== 'pending' || booking.paid) return 'not_cancellable';
      await tx.$executeRaw`
        update public.bookings set
          status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(),
          cancellation_reason = ${reason}, updated_at = now()
        where id = ${bookingId}::uuid
      `;
      return 'cancelled';
    });
  }
}
