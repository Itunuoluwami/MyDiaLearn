import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

export const ASSIGNMENT_STATUSES = ['draft', 'assigned', 'submitted', 'reviewed'] as const;
export const RESOURCE_TYPES = ['pdf', 'video', 'link', 'document', 'image', 'other'] as const;

// --- Lesson notes ------------------------------------------------------------

export class UpsertLessonNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  covered?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  understanding?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  improvements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  nextSteps?: string;
}

// --- Assignments -------------------------------------------------------------

export class CreateAssignmentDto {
  @IsUUID('4')
  studentId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsUUID('4')
  bookingId?: string;

  @IsOptional()
  @IsUUID('4')
  subjectId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  instructions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  submissionRequirements?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsUUID('4')
  resourceId?: string;
}

export class SubmitAssignmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  submissionText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  submissionPath?: string;
}

export class ReviewAssignmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  feedback!: string;
}

export class ListAssignmentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @IsOptional()
  @IsIn(ASSIGNMENT_STATUSES)
  status?: (typeof ASSIGNMENT_STATUSES)[number];
}

// --- Learning resources ------------------------------------------------------

export class CreateResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsIn(RESOURCE_TYPES)
  resourceType!: (typeof RESOURCE_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /** One of storagePath (uploaded) or externalUrl (linked). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  storagePath?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  externalUrl?: string;

  @IsOptional()
  @IsUUID('4')
  subjectId?: string;

  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sizeBytes?: number;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}

export class ListResourcesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @IsOptional()
  @IsUUID('4')
  subjectId?: string;
}

// --- Response shapes ---------------------------------------------------------

export interface LessonNoteResponse {
  id: string;
  bookingId: string;
  covered: string | null;
  understanding: string | null;
  improvements: string | null;
  nextSteps: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentResponse {
  id: string;
  studentId: string;
  tutorId: string;
  /** Filled on list responses only. */
  tutorName: string | null;
  bookingId: string | null;
  subjectId: string | null;
  subjectName: string | null;
  title: string;
  instructions: string | null;
  submissionRequirements: string | null;
  dueAt: string | null;
  status: string;
  submissionText: string | null;
  submittedAt: string | null;
  feedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

/**
 * Resource response.
 *
 * storage_path is not exposed — it is an internal key, and downloading goes
 * through a separate signed-URL call once the files module is wired to a real
 * storage provider. externalUrl is safe to return; it is a link the tutor
 * supplied.
 */
export interface ResourceResponse {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  externalUrl: string | null;
  hasFile: boolean;
  subjectId: string | null;
  studentId: string | null;
  isShared: boolean;
  tutorId: string;
  /** Filled on list responses only. */
  tutorName: string | null;
  createdAt: string;
}
