import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

/** Mirrors the booking_status enum. */
export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;

export class CreateBookingDto {
  @IsUUID('4')
  studentId!: string;

  @IsUUID('4')
  tutorId!: string;

  @IsOptional()
  @IsUUID('4')
  subjectId?: string;

  @IsOptional()
  @IsUUID('4')
  educationLevelId?: string;

  /** ISO 8601 with an offset. An instant, not a wall-clock time. */
  @IsDateString()
  startsAt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  /**
   * IANA zone the learner booked in, stored on the row.
   *
   * starts_at alone is not enough: a lesson booked for "4pm Lagos time" has to
   * keep displaying as 4pm after a DST shift elsewhere, and reports are read
   * in the booker's zone.
   */
  @IsString()
  @MaxLength(64)
  timezone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  studentNotes?: string;
}

export class RespondBookingDto {
  @IsBoolean()
  accept!: boolean;
}

export class RateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

/** Mirrors the dispute_category enum. */
export const DISPUTE_CATEGORIES = [
  'payment',
  'conduct',
  'quality',
  'scheduling',
  'other',
] as const;

export class RaiseDisputeDto {
  @IsIn(DISPUTE_CATEGORIES)
  category!: (typeof DISPUTE_CATEGORIES)[number];

  @IsString()
  @MinLength(1, { message: 'Please describe what went wrong.' })
  @MaxLength(4000)
  description!: string;
}

export class FamilyCancelDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class EndClassDto {
  /** Omitted when the tutor does not record attendance; tutor_end_class defaults it. */
  @IsOptional()
  @IsBoolean()
  studentAttended?: boolean;
}

export class AvailableSlotsQueryDto {
  @IsUUID('4')
  tutorId!: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  days = 14;

  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;
}

export class ListBookingsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: (typeof BOOKING_STATUSES)[number];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

/**
 * The tutor schedule filters by a set of statuses (tutor_bookings takes a
 * booking_status[]), sent as `?statuses=pending,confirmed`.
 */
export class TutorScheduleQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsIn(BOOKING_STATUSES, { each: true })
  statuses?: (typeof BOOKING_STATUSES)[number][];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

/**
 * Response shape.
 *
 * `booked_by` is included because portals show who made the booking, but no
 * internal audit columns are. Money stays a string for the same reason as in
 * payments.
 */
export interface BookingResponse {
  id: string;
  studentId: string;
  tutorId: string;
  bookedBy: string;
  subjectId: string | null;
  educationLevelId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  hourlyRate: string;
  currency: string;
  totalAmount: string;
  status: string;
  subjectName: string | null;
  paid: boolean;
  sessionMeetingUrl: string | null;
  sessionStatus: string | null;
  /** Session and tutor details are filled by the list query only. */
  sessionId: string | null;
  sessionTutorNotes: string | null;
  sessionHomework: string | null;
  tutorName: string | null;
  tutorAvatarUrl: string | null;
  studentNotes: string | null;
  tutorAcceptedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

export interface AvailableSlotResponse {
  startsAt: string;
  endsAt: string;
}
