import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import {
  AppException,
  ConflictError,
  ErrorCode,
  NotFoundError,
} from '../common/exceptions/app.exception';
import { translateDatabaseError } from '../common/exceptions/database-errors';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type {
  AvailableSlotResponse,
  BookingResponse,
  CreateBookingDto,
} from './dto/booking.dto';
import {
  BookingsRepository,
  type BookingNotificationContext,
  type BookingRow,
} from './bookings.repository';

/**
 * Booking lifecycle.
 *
 * The rules this domain must preserve mostly are not in this file, and that is
 * deliberate:
 *
 *  - **No overlapping bookings** — two GiST exclusion constraints,
 *    bookings_no_tutor_overlap and bookings_no_student_overlap. Enforced by
 *    PostgreSQL, so two simultaneous requests cannot both win a check-then-act
 *    race the way an application-level test would.
 *  - **Availability** — tutor_available_slots() reads availability_windows.
 *  - **Confirmation** — a lesson becomes `confirmed` only once the tutor has
 *    accepted AND a paid payment exists. That rule is split across
 *    tutor_respond_booking() and the confirm_booking_on_payment trigger; both
 *    halves stay where they are.
 *  - **Price capture** — the quote is written onto the row at creation, so a
 *    later commission change never alters an existing booking.
 *
 * What this service adds: notice and horizon checks against admin
 * configuration, friendly errors for the database's raised exceptions, audit
 * records for every status change, and telling the other party it happened.
 *
 * Notifications are raised by trigger key only. No copy is written here —
 * subject and body come from `notification_templates`, so an admin can reword
 * them without a deploy. Every dispatch is best-effort: a booking must not
 * fail because a notification could not be delivered.
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly repository: BookingsRepository,
    private readonly settings: PlatformSettingsService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationDispatchService,
  ) {}

  /**
   * The lesson, as a notification talks about it.
   *
   * `starts_at` is rendered in the booking's own timezone rather than the
   * server's, because "your lesson on ..." is useless if it names an hour the
   * reader was never in.
   */
  private static describe(ctx: BookingNotificationContext, timezone: string) {
    // A notice names an hour, so it has to name it in a timezone the reader
    // actually lives in. Telling a tutor their lesson is at 09:30 in one
    // message and 08:30 in the next, for the same lesson, is worse than
    // saying nothing.
    return {
      subject: ctx.subject_name ?? 'lesson',
      starts_at: new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: timezone,
      }).format(ctx.starts_at),
    };
  }

  /** Never lets a notification failure reach the caller. */
  private async notifySafely(run: () => Promise<unknown>): Promise<void> {
    try {
      await run();
    } catch {
      // NotificationDispatchService already logs with the trigger key; the
      // booking itself has committed and must stand regardless.
    }
  }

  async create(
    callerId: string,
    dto: CreateBookingDto,
    context: AuditContext,
  ): Promise<BookingResponse> {
    const startsAt = new Date(dto.startsAt);
    await this.assertBookableWindow(startsAt, dto.durationMinutes);

    let row: BookingRow;
    try {
      row = await this.repository.createWithQuote(callerId, {
        studentId: dto.studentId,
        tutorId: dto.tutorId,
        subjectId: dto.subjectId,
        educationLevelId: dto.educationLevelId,
        startsAt,
        durationMinutes: dto.durationMinutes,
        timezone: dto.timezone,
        studentNotes: dto.studentNotes,
      });
    } catch (error) {
      throw translateBookingError(error);
    }

    await this.audit.record('booking.created', {
      actorId: callerId,
      entityType: 'booking',
      entityId: row.id,
      context,
      metadata: {
        tutorId: row.tutor_id,
        studentId: row.student_id,
        startsAt: row.starts_at.toISOString(),
        durationMinutes: row.duration_minutes,
        totalAmount: String(row.total_amount),
        currency: row.currency,
      },
    });

    // The tutor is the one who has to do something about this.
    await this.notifySafely(async () => {
      const ctx = await this.repository.notificationContext(row.id);
      if (!ctx) return;
      await this.notifications.dispatch({
        actorId: callerId,
        userId: ctx.tutor_user_id,
        ...(ctx.tutor_email ? { email: ctx.tutor_email } : {}),
        triggerKey: 'booking.created',
        vars: {
          student_name: ctx.student_name,
          ...BookingsService.describe(ctx, ctx.tutor_timezone),
        },
        link: '/tutor/classes',
      });
    });

    return toResponse(row);
  }

  async list(
    userId: string,
    query: PaginationQueryDto & { status?: string; from?: string; to?: string },
  ): Promise<Paginated<BookingResponse>> {
    const { rows, total } = await this.repository.list(userId, query, {
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
    return paginate(rows.map(toResponse), total, query);
  }

  async findOne(userId: string, id: string): Promise<BookingResponse> {
    const row = await this.repository.findById(userId, id);
    if (!row) throw new NotFoundError('Booking');
    return toResponse(row);
  }

  /**
   * Bookable slots.
   *
   * tutor_available_slots() reports when the tutor is *free*, which is not the
   * same as when a lesson may be *booked*: it knows nothing about the minimum
   * notice period or the booking horizon, both of which are admin settings.
   * Left unfiltered it offers slots that create() then refuses, which shows a
   * user a time they can select and cannot have.
   *
   * Filtering here rather than in the SQL keeps one definition of the window —
   * the same `assertBookableWindow` that guards creation.
   */
  async availableSlots(
    callerId: string,
    input: { tutorId: string; from?: string; days: number; durationMinutes: number },
  ): Promise<AvailableSlotResponse[]> {
    const [minNoticeHours, maxAdvanceDays] = await Promise.all([
      this.settings.minNoticeHours(),
      this.settings.maxAdvanceDays(),
    ]);

    const earliest = Date.now() + minNoticeHours * 3_600_000;
    const latest = Date.now() + maxAdvanceDays * 86_400_000;

    const slots = await this.repository.availableSlots(callerId, {
      tutorId: input.tutorId,
      // Asking from the earliest bookable moment rather than now, so the
      // function does not spend effort on slots that will be discarded.
      from: input.from ? new Date(input.from) : new Date(earliest),
      days: input.days,
      durationMinutes: input.durationMinutes,
    });

    return slots
      .filter((slot) => {
        const at = slot.starts_at.getTime();
        return at >= earliest && at <= latest;
      })
      .map((slot) => ({
        startsAt: slot.starts_at.toISOString(),
        endsAt: slot.ends_at.toISOString(),
      }));
  }

  async respond(
    tutorUserId: string,
    bookingId: string,
    accept: boolean,
    context: AuditContext,
  ): Promise<{ status: string }> {
    let status: string;
    try {
      status = await this.repository.respond(tutorUserId, bookingId, accept);
    } catch (error) {
      throw translateBookingError(error);
    }

    await this.audit.record(accept ? 'booking.accepted' : 'booking.declined', {
      actorId: tutorUserId,
      entityType: 'booking',
      entityId: bookingId,
      context,
      metadata: { status },
    });

    // Only on `confirmed`. Accepting an unpaid lesson leaves it pending, and
    // saying "confirmed" then would be a lie the payment screen contradicts.
    if (accept && status === 'confirmed') {
      await this.notifySafely(() => this.announceConfirmed(tutorUserId, bookingId));
    }

    return { status };
  }

  /**
   * Tells the family a lesson is on.
   *
   * Both the booker and the learner hear about it when they are different
   * people and the learner has their own login — a child with an account
   * should not have to be told by their parent.
   */
  private async announceConfirmed(actorId: string, bookingId: string): Promise<void> {
    const ctx = await this.repository.notificationContext(bookingId);
    if (!ctx) return;

    // The family's own frame here: they chose it when they booked.
    const described = BookingsService.describe(ctx, ctx.booking_timezone);
    const emailVars = {
      tutor_name: ctx.tutor_name ?? 'Your tutor',
      student_name: ctx.student_name,
      ...described,
    };

    // Keyed by user so a learner who booked for themselves is told once, not
    // twice for being both the booker and the learner.
    const recipients = new Map<string, { email: string | null; link: string }>();
    recipients.set(ctx.booker_user_id, { email: ctx.booker_email, link: '/bookings' });
    if (ctx.student_user_id && ctx.student_user_id !== ctx.booker_user_id) {
      // The learner's own portal, not the parent's. Same event, different app.
      recipients.set(ctx.student_user_id, {
        email: ctx.student_email,
        link: '/student/history',
      });
    } else if (ctx.student_user_id === ctx.booker_user_id) {
      recipients.set(ctx.booker_user_id, {
        email: ctx.booker_email,
        link: '/student/history',
      });
    }

    for (const [userId, recipient] of recipients) {
      await this.notifications.dispatch({
        actorId,
        userId,
        ...(recipient.email ? { email: recipient.email } : {}),
        triggerKey: 'booking.confirmed',
        vars: { counterpart: ctx.tutor_name ?? 'your tutor', ...described, ...emailVars },
        link: recipient.link,
      });
    }
  }

  async rate(
    userId: string,
    bookingId: string,
    input: { score: number; comment?: string | undefined },
  ): Promise<void> {
    let outcome: Awaited<ReturnType<BookingsRepository['rate']>>;
    try {
      outcome = await this.repository.rate(userId, bookingId, input);
    } catch (error) {
      // ratings_booking_id_key: one rating per lesson.
      const message = error instanceof Error ? error.message : String(error);
      if (/23505|ratings_booking_id_key|duplicate key/i.test(message)) {
        throw new ConflictError('This lesson has already been rated.');
      }
      throw translateDatabaseError(error, 'We could not save that rating.');
    }
    if (outcome === 'not_found') throw new NotFoundError('Booking');
    if (outcome === 'not_completed') {
      throw new ConflictError('Only a completed lesson can be rated.');
    }
  }

  async cancelByFamily(
    userId: string,
    bookingId: string,
    reason: string | undefined,
    context: AuditContext,
  ): Promise<void> {
    const outcome = await this.repository.cancelByFamily(
      userId,
      bookingId,
      reason?.trim() || 'Cancelled by parent',
    );
    if (outcome === 'not_found') throw new NotFoundError('Booking');
    if (outcome === 'not_cancellable') {
      throw new ConflictError(
        'Only an unpaid lesson that is still pending can be cancelled here. Contact support for a paid lesson.',
      );
    }
    await this.audit.record('booking.cancelled', {
      actorId: userId,
      entityType: 'booking',
      entityId: bookingId,
      context,
      metadata: { by: 'family' },
    });

    // Only an unpaid, still-pending lesson reaches here, so there is nothing
    // to refund and the template's refund note says so rather than staying a
    // visible {{placeholder}}.
    await this.notifySafely(async () => {
      const ctx = await this.repository.notificationContext(bookingId);
      if (!ctx) return;
      await this.notifications.dispatch({
        actorId: userId,
        userId: ctx.tutor_user_id,
        ...(ctx.tutor_email ? { email: ctx.tutor_email } : {}),
        triggerKey: 'booking.cancelled',
        vars: {
          ...BookingsService.describe(ctx, ctx.tutor_timezone),
          refund_note: 'No payment had been taken.',
        },
        link: '/tutor/classes',
      });
    });
  }

  myRatings(userId: string): Promise<Record<string, unknown>[]> {
    return this.repository.myRatings(userId);
  }

  async raiseDispute(
    userId: string,
    bookingId: string,
    input: { category: string; description: string },
    context: AuditContext,
  ): Promise<{ id: string }> {
    let id: string;
    try {
      id = await this.repository.raiseDispute(userId, bookingId, {
        category: input.category,
        description: input.description.trim(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/DESCRIPTION_REQUIRED/.test(message)) {
        throw new AppException(
          ErrorCode.VALIDATION_FAILED,
          'Please describe what went wrong.',
          400,
        );
      }
      throw translateBookingError(error);
    }
    await this.audit.record('dispute.raised', {
      actorId: userId,
      entityType: 'dispute',
      entityId: id,
      context,
      metadata: { bookingId, category: input.category },
    });
    return { id };
  }

  async tutorSchedule(
    tutorUserId: string,
    input: { from?: string; to?: string; statuses?: string[] },
  ): Promise<Record<string, unknown>[]> {
    return this.repository.tutorSchedule(tutorUserId, {
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
      statuses: input.statuses?.length ? input.statuses : undefined,
    });
  }

  async openClass(tutorUserId: string, bookingId: string): Promise<Record<string, unknown>> {
    const session = await this.repository.openClass(tutorUserId, bookingId);
    if (!session) throw new NotFoundError('Class session');
    return session;
  }

  async startClass(
    tutorUserId: string,
    bookingId: string,
    context: AuditContext,
  ): Promise<void> {
    try {
      await this.repository.startClass(tutorUserId, bookingId);
    } catch (error) {
      throw translateBookingError(error);
    }
    await this.audit.record('booking.class_started', {
      actorId: tutorUserId,
      entityType: 'booking',
      entityId: bookingId,
      context,
    });
  }

  async endClass(
    tutorUserId: string,
    bookingId: string,
    studentAttended: boolean | undefined,
    context: AuditContext,
  ): Promise<void> {
    try {
      await this.repository.endClass(tutorUserId, bookingId, studentAttended);
    } catch (error) {
      throw translateBookingError(error);
    }
    await this.audit.record('booking.class_ended', {
      actorId: tutorUserId,
      entityType: 'booking',
      entityId: bookingId,
      context,
      metadata: { studentAttended: studentAttended ?? null },
    });
  }

  /**
   * Notice period and booking horizon, both admin-configured.
   *
   * Checked here rather than in a DTO because the values are platform_settings
   * rows, not constants — a DTO cannot know what "too soon" means today.
   */
  private async assertBookableWindow(startsAt: Date, durationMinutes: number): Promise<void> {
    const [minNoticeHours, maxAdvanceDays, allowedDurations] = await Promise.all([
      this.settings.minNoticeHours(),
      this.settings.maxAdvanceDays(),
      this.settings.allowedDurations(),
    ]);

    if (!allowedDurations.includes(durationMinutes)) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `Lessons must be one of ${allowedDurations.join(', ')} minutes.`,
        400,
        { allowedDurations },
      );
    }

    const noticeMs = minNoticeHours * 3_600_000;
    if (startsAt.getTime() - Date.now() < noticeMs) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `Lessons must be booked at least ${minNoticeHours} hours in advance.`,
        400,
        { minNoticeHours },
      );
    }

    const horizonMs = maxAdvanceDays * 86_400_000;
    if (startsAt.getTime() - Date.now() > horizonMs) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `Lessons cannot be booked more than ${maxAdvanceDays} days ahead.`,
        400,
        { maxAdvanceDays },
      );
    }
  }
}

export function toResponse(row: BookingRow): BookingResponse {
  return {
    id: row.id,
    studentId: row.student_id,
    tutorId: row.tutor_id,
    bookedBy: row.booked_by,
    subjectId: row.subject_id,
    educationLevelId: row.education_level_id,
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at.toISOString(),
    durationMinutes: row.duration_minutes,
    timezone: row.booking_timezone,
    hourlyRate: String(row.hourly_rate),
    currency: row.currency,
    totalAmount: String(row.total_amount),
    status: row.status,
    subjectName: row.subject_name ?? null,
    paid: row.paid ?? false,
    sessionMeetingUrl: row.session_meeting_url ?? null,
    sessionStatus: row.session_status ?? null,
    sessionId: row.session_id ?? null,
    sessionTutorNotes: row.session_tutor_notes ?? null,
    sessionHomework: row.session_homework ?? null,
    tutorName: row.tutor_name ?? null,
    tutorAvatarUrl: row.tutor_avatar_url ?? null,
    studentNotes: row.student_notes,
    tutorAcceptedAt: row.tutor_accepted_at ? row.tutor_accepted_at.toISOString() : null,
    cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at.toISOString(),
  };
}

/** Booking-flavoured wrapper around the shared translator. */
export function translateBookingError(error: unknown): AppException {
  return translateDatabaseError(error, 'We could not complete that booking action.');
}
