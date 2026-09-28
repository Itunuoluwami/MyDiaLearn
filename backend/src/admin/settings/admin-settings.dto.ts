import { Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** notification_templates.audience is an app_role. */
const AUDIENCES = ['student', 'parent', 'tutor', 'agency', 'admin', 'super_admin'];

export class SetActiveDto {
  @IsBoolean()
  isActive!: boolean;
}

export class CreateSubjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class CreateCurriculumDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(120)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class TierDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  percentage!: number;
}

/** Mirrors the commission_model and commission_rules.applies_to enums. */
export class CreateCommissionRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsIn(['percentage', 'fixed', 'tiered'])
  model!: 'percentage' | 'fixed' | 'tiered';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  percentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedAmount?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  platformFeePercentage!: number;

  @IsIn(['tutor', 'agency', 'parent', 'student', 'admin'])
  appliesTo!: string;

  @IsOptional()
  @IsUUID('4')
  tutorId?: string;

  @IsOptional()
  @IsUUID('4')
  agencyId?: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TierDto)
  tiers!: TierDto[];

  @Type(() => Number)
  @IsInt()
  priority!: number;
}

export class PlatformSettingsQueryDto {
  /** "payments" for the pricing keys, "general" for everything else. */
  @IsIn(['payments', 'general'])
  scope!: 'payments' | 'general';
}

/** `value` is any JSON value; the table column is jsonb. */
export class PlatformSettingDto {
  @IsString()
  @Matches(/^[a-z0-9_.-]+$/i)
  @MaxLength(120)
  key!: string;

  /** Any JSON value (string, number, boolean, object); stored as jsonb. */
  @Allow()
  value!: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  groupName?: string;
}

export class UpsertPlatformSettingsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PlatformSettingDto)
  settings!: PlatformSettingDto[];
}

export class UpdateSettingValueDto {
  @Allow()
  value!: unknown;
}

export class TemplateDto {
  @IsString()
  @Matches(/^[a-z0-9_.]+$/)
  @MaxLength(120)
  triggerKey!: string;

  @IsIn(['in_app', 'email', 'sms', 'push'])
  channel!: string;

  @IsOptional()
  @IsIn(AUDIENCES)
  audience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subject?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_.]+$/)
  @MaxLength(120)
  triggerKey?: string;

  @IsOptional()
  @IsIn(['in_app', 'email', 'sms', 'push'])
  channel?: string;

  @IsOptional()
  @IsIn(AUDIENCES)
  audience?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subject?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
