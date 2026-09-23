import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * These mirror src/lib/auth-validation.ts on the frontend, which is the only
 * real input validation the application has today. The rules are reproduced
 * rather than relaxed: a backend that accepts a weaker password than the form
 * offers would quietly lower the policy for anyone calling the API directly.
 */

const PASSWORD_RULES: [RegExp, string][] = [
  [/[A-Z]/, 'Password must include an uppercase letter.'],
  [/[a-z]/, 'Password must include a lowercase letter.'],
  [/\d/, 'Password must include a number.'],
  [/[^A-Za-z0-9]/, 'Password must include a special character.'],
];

export function passwordDecorators(): PropertyDecorator[] {
  return [
    IsString(),
    MinLength(8, { message: 'Password must contain at least 8 characters.' }),
    // 72 bytes is bcrypt's input limit. argon2 has no such cap, but the
    // frontend enforces 72 and the two must agree.
    MaxLength(72, { message: 'Passwords can be at most 72 characters.' }),
    ...PASSWORD_RULES.map(([pattern, message]) => Matches(pattern, { message })),
  ];
}

function Password(): PropertyDecorator {
  const decorators = passwordDecorators();
  return (target, key) => decorators.forEach((d) => d(target, key));
}

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  // Deliberately NOT subject to the password policy. An account created before
  // a policy change still has to be able to sign in.
  @IsString()
  @MinLength(1, { message: 'Please enter your password.' })
  password!: string;
}

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @Password()
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

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

  /**
   * Self-service signup roles only. `admin` and `super_admin` are absent by
   * design, and handle_new_user() downgrades them to `student` even if they
   * somehow arrive — two independent guards on privilege escalation.
   */
  @IsIn(['parent', 'student', 'tutor', 'agency'], { message: 'Please choose a valid role.' })
  role!: 'parent' | 'student' | 'tutor' | 'agency';
}

export class RefreshDto {
  /** Optional: the cookie is the primary carrier. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(16)
  token!: string;

  @Password()
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @Password()
  newPassword!: string;
}

export class VerifyEmailDto {
  @IsString()
  @MinLength(16)
  token!: string;
}

export class ResendVerificationDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;
}

export class LogoutDto {
  /** Revoke every session for this account, not just the current one. */
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}
