import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** The five actions admin_execute_action() knows how to carry out. */
export const REQUEST_ACTIONS = [
  'payment.refund',
  'booking.cancel_with_refund',
  'payout.settle',
  'user_roles.grant_elevated',
  'profile.suspend',
] as const;

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'executed',
  'failed',
] as const;

export class CreateInvitationDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsIn(['admin', 'super_admin'])
  role!: 'admin' | 'super_admin';

  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  permissionKeys!: string[];
}

export class RedeemInvitationDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  otp!: string;
}

/** `granted: null` clears the override so the role grant applies again. */
export class SetUserPermissionDto {
  @ValidateIf((_, value) => value !== null)
  @IsBoolean()
  granted!: boolean | null;
}

export class ElevatedRoleRequestDto {
  @IsIn(['admin', 'super_admin'])
  role!: 'admin' | 'super_admin';

  @IsOptional()
  @IsBoolean()
  revoke?: boolean;
}

export class ActionRequestsQueryDto {
  /** Defaults to pending. */
  @IsOptional()
  @IsIn([...REQUEST_STATUSES, 'all'])
  status?: string;
}

export class CreateActionRequestDto {
  @IsIn(REQUEST_ACTIONS)
  action!: (typeof REQUEST_ACTIONS)[number];

  @IsObject()
  payload!: Record<string, unknown>;
}

export class ReviewActionRequestDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class AuditLogQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  entityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  actorEmail?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
