import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
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
