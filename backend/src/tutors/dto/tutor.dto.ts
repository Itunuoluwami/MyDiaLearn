import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

/**
 * Self-service tutor profile edits.
 *
 * `hourlyRate` is deliberately absent. The tutors_admin_only_hourly_rate
 * trigger rejects a tutor changing their own rate, so accepting the field would
 * build a request that always fails at the database.
 */
export class UpdateTutorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  biography?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  qualifications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  education?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(70)
  yearsExperience?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  introVideoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  methodology?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teachingContext?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  onboardingStep?: number;
}

export class TutorSubjectEntryDto {
  @IsUUID('4')
  subjectId!: string;

  @IsOptional()
  @IsUUID('4')
  educationLevelId?: string;
}

export class ReplaceTutorSubjectsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => TutorSubjectEntryDto)
  subjects!: TutorSubjectEntryDto[];
}

/** HH:MM or HH:MM:SS, so the value can be cast straight to `time`. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class AvailabilityWindowDto {
  /** 0 = Sunday, matching PostgreSQL's extract(dow). */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @Matches(TIME_PATTERN, { message: 'startTime must be HH:MM or HH:MM:SS.' })
  startTime!: string;

  @Matches(TIME_PATTERN, { message: 'endTime must be HH:MM or HH:MM:SS.' })
  endTime!: string;

  /** The zone the times were expressed in — not the server's. */
  @IsString()
  @MaxLength(64)
  timezone!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReplaceAvailabilityDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  windows!: AvailabilityWindowDto[];
}

export class AddTutorDocumentDto {
  @IsOptional()
  @IsUUID('4')
  stepId?: string;

  @IsString()
  @MaxLength(120)
  label!: string;

  /** Provider-relative key. The bytes go to StorageProvider, not here. */
  @IsString()
  @MaxLength(500)
  storagePath!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sizeBytes?: number;
}

export class TutorListQueryDto extends PaginationQueryDto {}

/**
 * Response shape.
 *
 * `profileId` is exposed because the portal joins to the profile; internal
 * review columns on documents are not, beyond the status the tutor is entitled
 * to see.
 */
export interface TutorProfileResponse {
  id: string;
  profileId: string;
  agencyId: string | null;
  headline: string | null;
  biography: string | null;
  qualifications: string[];
  languages: string[];
  education: string[];
  hourlyRate: string | null;
  currency: string;
  yearsExperience: number | null;
  introVideoUrl: string | null;
  timezone: string;
  verificationStatus: string;
  isListed: boolean;
  methodology: string | null;
  teachingContext: string | null;
  onboardingStep: number;
  submittedAt: string | null;
}

export interface TutorSubjectResponse {
  id: string;
  subjectId: string;
  subjectName: string | null;
  educationLevelId: string | null;
  levelName: string | null;
}

export interface AvailabilityWindowResponse {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

export interface VerificationStepResponse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  status: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
}

export interface TutorDocumentResponse {
  id: string;
  stepId: string | null;
  label: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
