import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { AppException, ErrorCode, NotFoundError } from '../common/exceptions/app.exception';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type {
  AvailableSlotResponse,
  BookingResponse,
  CreateBookingDto,
} from './dto/booking.dto';
import { BookingsRepository, type BookingRow } from './bookings.repository';

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
 * configuration, friendly errors for the database's raised exceptions, and
 * audit records for every status change.
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly repository: BookingsRepository,
    private readonly settings: PlatformSettingsService,
    private readonly audit: AuditService,
  ) {}

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

  async availableSlots(
    callerId: string,
    input: { tutorId: string; from?: string; days: number; durationMinutes: number },
  ): Promise<AvailableSlotResponse[]> {
    const slots = await this.repository.availableSlots(callerId, {
      tutorId: input.tutorId,
      from: input.from ? new Date(input.from) : new Date(),
      days: input.days,
      durationMinutes: input.durationMinutes,
    });
    return slots.map((slot) => ({
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

    return { status };
  }

  async tutorSchedule(
    tutorUserId: string,
    input: { from?: string; to?: string; status?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.repository.tutorSchedule(tutorUserId, {
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
      status: input.status,
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
    studentAttended: boolean,
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
      metadata: { studentAttended },
    });
  }

  async adminCancel(
    adminId: string,
    input: { bookingId: string; reason: string; refundPercentage: number },
    context: AuditContext,
  ): Promise<Record<string, unknown>> {
    let result: Record<string, unknown> | null;
    try {
      result = await this.repository.adminCancel(adminId, input);
    } catch (error) {
      throw translateBookingError(error);
    }
    if (!result) throw new NotFoundError('Booking');

    await this.audit.record('booking.cancelled', {
      actorId: adminId,
      entityType: 'booking',
      entityId: input.bookingId,
      context,
      metadata: {
        reason: input.reason,
        refundPercentage: input.refundPercentage,
        refundAmount: String(result.refund_amount ?? ''),
      },
    });

    return result;
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
    studentNotes: row.student_notes,
    tutorAcceptedAt: row.tutor_accepted_at ? row.tutor_accepted_at.toISOString() : null,
    cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at.toISOString(),
  };
}

/**
 * Turns the database's raised exceptions into answers a caller can act on.
 *
 * The PL/pgSQL functions raise bare codes — NOT_AUTHORIZED, ALREADY_PAID — and
 * the exclusion constraints surface as 23P01. Without this the frontend would
 * show "An unexpected error occurred" for "that slot was just taken", which is
 * the single most likely thing to go wrong when booking.
 */
export function translateBookingError(error: unknown): AppException {
  const message = error instanceof Error ? error.message : String(error);

  if (/23P01|exclusion constraint|no_tutor_overlap|no_student_overlap/i.test(message)) {
    return new AppException(
      ErrorCode.CONFLICT,
      'That time is no longer available. Please choose another slot.',
      409,
    );
  }
  if (/NOT_AUTHORIZED/.test(message)) {
    return new AppException(
      ErrorCode.NOT_AUTHORIZED,
      'You do not have access to this booking.',
      403,
    );
  }
  if (/NOT_A_TUTOR/.test(message)) {
    return new AppException(ErrorCode.NOT_AUTHORIZED, 'This action is for tutors.', 403);
  }
  if (/BOOKING_NOT_FOUND/.test(message)) {
    return new AppException(ErrorCode.NOT_FOUND, 'Booking not found.', 404);
  }
  if (/CLASS_NOT_READY/.test(message)) {
    return new AppException(ErrorCode.CONFLICT, 'This class cannot be opened yet.', 409);
  }
  if (/ALREADY_PAID/.test(message)) {
    return new AppException(ErrorCode.CONFLICT, 'This booking has already been paid.', 409);
  }
  if (/BOOKING_NOT_PAYABLE/.test(message)) {
    return new AppException(
      ErrorCode.CONFLICT,
      'This booking can no longer be paid for.',
      409,
    );
  }
  if (/NO_QUOTE/.test(message)) {
    return new AppException(ErrorCode.NOT_FOUND, 'No price is available for this tutor.', 404);
  }

  return new AppException(
    ErrorCode.INTERNAL_ERROR,
    'We could not complete that booking action.',
    500,
  );
}
