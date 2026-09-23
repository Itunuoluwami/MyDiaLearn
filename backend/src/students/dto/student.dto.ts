import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

export class CreateStudentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gender?: string;

  @IsOptional()
  @IsUUID('4')
  curriculumId?: string;

  @IsOptional()
  @IsUUID('4')
  educationLevelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  schoolName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  learningGoals?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialNeeds?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  avatarUrl?: string;

  /**
   * Autonomy flags. Default false everywhere, so a newly added learner can do
   * nothing until a parent decides otherwise — the safe default for a child
   * account.
   */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  canSelfLogin?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  canBookLessons?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  canMessageTutors?: boolean;
}

/**
 * Update accepts the same fields, all optional.
 *
 * `parentId` is absent from both: ownership comes from the caller, never from
 * the request. Accepting it would invite an attempt to attach a child to
 * someone else's account.
 */
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

export class ListStudentsQueryDto extends PaginationQueryDto {}

export interface StudentResponse {
  id: string;
  profileId: string | null;
  parentId: string | null;
  firstName: string;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  curriculumId: string | null;
  educationLevelId: string | null;
  schoolName: string | null;
  learningGoals: string | null;
  specialNeeds: string | null;
  timezone: string;
  avatarUrl: string | null;
  canSelfLogin: boolean;
  canBookLessons: boolean;
  canMessageTutors: boolean;
  isActive: boolean;
  createdAt: string;
}
