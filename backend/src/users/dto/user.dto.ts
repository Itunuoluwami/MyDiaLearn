import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import { APP_ROLES } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../shared/query.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  preferredCurrency?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  avatarUrl?: string;
}

export class SearchUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsIn(APP_ROLES)
  role?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class SetRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsIn(APP_ROLES, { each: true })
  roles!: string[];
}

export class SetPermissionDto {
  @IsString()
  @MaxLength(100)
  permissionKey!: string;

  @Type(() => Boolean)
  @IsBoolean()
  granted!: boolean;
}

/**
 * Response shape.
 *
 * Note what is absent. `must_change_password` is included because the portal
 * needs it to force the change, but nothing about credentials, tokens or
 * verification internals appears. The mapping function is the boundary — a new
 * column added to profiles does not silently start being returned.
 */
export interface UserProfileResponse {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  timezone: string;
  preferredCurrency: string;
  primaryRole: string;
  onboardingCompleted: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface CurrentUserResponse extends UserProfileResponse {
  roles: string[];
  permissions: string[];
}
