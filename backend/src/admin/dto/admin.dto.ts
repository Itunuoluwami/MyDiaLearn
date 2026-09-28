import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Mirrors the app_role enum, including super_admin. */
export const APP_ROLES = [
  'student',
  'parent',
  'tutor',
  'agency',
  'admin',
  'super_admin',
] as const;

/** Mirrors the verification_status enum. */
export const VERIFICATION_STATUSES = [
  'unverified',
  'pending',
  'in_review',
  'verified',
  'rejected',
  'suspended',
] as const;

export class AdminUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(APP_ROLES)
  role?: (typeof APP_ROLES)[number];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class SuspendUserDto {
  @IsBoolean()
  isActive!: boolean;
}

export class VerificationQueueQueryDto {
  /** A single status, or "all" for every tutor who has submitted. Defaults to pending. */
  @IsOptional()
  @IsIn([...VERIFICATION_STATUSES, 'all'])
  status?: (typeof VERIFICATION_STATUSES)[number] | 'all';
}

export class ReviewVerificationDto {
  @IsIn(VERIFICATION_STATUSES)
  status!: (typeof VERIFICATION_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewerNotes?: string;
}

export class RejectTutorDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}

export class SetHourlyRateDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  hourlyRate!: number;
}

// --- Bookings, payments, payouts, disputes -----------------------------------

/**
 * Statuses an admin may set directly. "cancelled" is absent on purpose: a
 * cancellation carries a refund decision, so it goes through the approval
 * queue (POST /admin/bookings/:id/cancel), exactly as the portal offers it.
 */
export const BOOKING_OVERRIDE_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'no_show',
  'rejected',
] as const;

export const BOOKING_STATUSES = [...BOOKING_OVERRIDE_STATUSES, 'cancelled'] as const;
export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
] as const;
export const PAYOUT_STATUSES = [
  'requested',
  'processing',
  'paid',
  'rejected',
  'cancelled',
] as const;
export const DISPUTE_STATUSES = ['open', 'investigating', 'resolved', 'dismissed'] as const;

export class AdminBookingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn([...BOOKING_STATUSES, 'all'])
  status?: (typeof BOOKING_STATUSES)[number] | 'all';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class OverrideBookingStatusDto {
  @IsIn(BOOKING_OVERRIDE_STATUSES)
  status!: (typeof BOOKING_OVERRIDE_STATUSES)[number];
}

export class CancelBookingRequestDto {
  @IsString()
  @MaxLength(500)
  reason!: string;

  /** 0-100. Omitted means the booking's cancellation policy decides. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  refundPercentage?: number;
}

export class AdminPaymentsQueryDto {
  /** A stored status, "all", "flagged" (failed or stuck >24h) or "refunded" (any refund). */
  @IsOptional()
  @IsIn([...PAYMENT_STATUSES, 'all', 'flagged', 'refunded'])
  status?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class RefundRequestDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AdminPayoutsQueryDto {
  @IsOptional()
  @IsIn([...PAYOUT_STATUSES, 'all'])
  status?: string;
}

export class RejectPayoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AdminDisputesQueryDto {
  /** Defaults to open. */
  @IsOptional()
  @IsIn([...DISPUTE_STATUSES, 'all'])
  status?: string;
}

export class ResolveDisputeDto {
  @IsIn(DISPUTE_STATUSES)
  status!: (typeof DISPUTE_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

// --- Moderation and reports ---------------------------------------------------

export class ModerationReviewsQueryDto {
  /** "true" or "false" to filter; omitted lists all. */
  @IsOptional()
  @IsIn(['true', 'false'])
  published?: 'true' | 'false';
}

export class SetReviewPublishedDto {
  @IsBoolean()
  isPublished!: boolean;
}

export class ModerationMessagesQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  search!: string;
}

export class SetMessageHiddenDto {
  @IsBoolean()
  isHidden!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReportQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
