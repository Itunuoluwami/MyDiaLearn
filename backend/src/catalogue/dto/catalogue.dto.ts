import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

/** Sort keys public_tutor_search() understands. Anything else is rejected. */
export const TUTOR_SORTS = ['top_rated', 'price_low', 'price_high', 'newest'] as const;

export class TutorSearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsUUID('4')
  subjectId?: string;

  @IsOptional()
  @IsUUID('4')
  curriculumId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  country?: string;

  @IsOptional()
  @IsUUID('4')
  educationLevelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /**
   * Constrained to a known set. The value reaches a SQL function argument, so
   * an unvalidated string here would be the one place free text meets the
   * database.
   */
  @IsOptional()
  @IsIn(TUTOR_SORTS)
  sort?: (typeof TUTOR_SORTS)[number];
}

export class SearchSuggestionsQueryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 8;
}

export class TutorReviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}

export class TutorCardsQueryDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  ids!: string[];
}
