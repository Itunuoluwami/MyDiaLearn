import { Inject, Injectable } from '@nestjs/common';

import { authConfig, type AuthConfig } from '../config/configuration';
import {
  AppException,
  ConflictError,
  ErrorCode,
  UnauthenticatedError,
} from '../common/exceptions/app.exception';
import { UserRepository, type AuthUserRow } from '../database/repositories/user.repository';
import { VerificationTokenRepository } from '../database/repositories/verification-token.repository';
import { EmailService } from '../integrations/email/email.service';
import type { AppRole } from '../common/decorators/roles.decorator';
import type {
  AuthSession,
  AuthUser,
  IssuedTokens,
  RequestContext,
} from './interfaces/auth.interface';
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuditService } from '../common/audit/audit.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

/**
 * Authentication, previously GoTrue's job.
 *
 * Two principles run through this file:
 *
 * 1. **Answers must not enumerate accounts.** A wrong password, an unknown
 *    address and a locked account are indistinguishable to the caller. The
 *    difference is recorded in the audit log, where it belongs.
 * 2. **Existing behaviour is the specification.** Signup writes auth.users and
 *    lets the on_auth_user_created trigger build profiles and user_roles, so
 *    the rule that nobody can self-grant an admin role keeps living in
 *    handle_new_user() rather than being restated here.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationTokens: VerificationTokenRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
    private readonly email: EmailService,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  async register(
    dto: RegisterDto,
    context: RequestContext,
  ): Promise<{ requiresVerification: boolean }> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      // The signup form already tells the user when an address is taken, and
      // hiding it here would only produce a worse experience without hiding
      // anything — the form's own "try signing in" path reveals it anyway.
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const requiresVerification = this.config.emailVerificationRequired;

    const created = await this.users.create({
      email: dto.email,
      passwordHash,
      emailConfirmed: !requiresVerification,
      // Keys chosen to match what handle_new_user() reads. Changing them
      // silently stops profiles being created.
      metadata: {
        full_name: dto.fullName,
        first_name: dto.firstName ?? null,
        last_name: dto.lastName ?? null,
        phone: dto.phone ?? null,
        country_code: dto.countryCode ?? null,
        timezone: dto.timezone ?? 'UTC',
        role: dto.role,
      },
    });

    await this.audit.record('auth.register', {
      actorId: created.id,
      actorEmail: dto.email,
      context,
      metadata: { role: dto.role, requiresVerification },
    });

    if (requiresVerification) {
      await this.sendVerificationEmail(created.id, dto.email, context);
    }

    return { requiresVerification };
  }

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------

  async login(dto: LoginDto, context: RequestContext): Promise<IssuedTokens> {
    const user = await this.users.findByEmail(dto.email);

    if (!user) {
      // Spend comparable time to a real verification so latency does not
      // distinguish a missing account from a wrong password.
      await this.passwords.dummyVerify();
      await this.audit.record('auth.login_failed', {
        actorEmail: dto.email,
        context,
        metadata: { reason: 'no_such_account' },
      });
      throw this.invalidCredentials();
    }

    if (user.locked_until && user.locked_until.getTime() > Date.now()) {
      await this.audit.record('auth.login_blocked', {
        actorId: user.id,
        actorEmail: user.email,
        context,
        metadata: { lockedUntil: user.locked_until.toISOString() },
      });
      // Same answer as a wrong password. Saying "locked" confirms the address
      // exists and tells an attacker their guessing is working.
      throw this.invalidCredentials();
    }

    const ok = await this.passwords.verify(user.encrypted_password, dto.password);
    if (!ok) {
      const count = await this.users.recordFailedLogin(
        user.id,
        this.config.lockoutThreshold,
        this.config.lockoutMinutes,
      );
      await this.audit.record('auth.login_failed', {
        actorId: user.id,
        actorEmail: user.email,
        context,
        metadata: { reason: 'bad_password', failedCount: count },
      });
      throw this.invalidCredentials();
    }

    if (this.config.emailVerificationRequired && !user.email_confirmed_at) {
      // Distinct from invalid credentials on purpose: the password was right,
      // so nothing is leaked that the caller does not already know.
      throw new AppException(
        ErrorCode.NOT_AUTHORIZED,
        'Please verify your email address before signing in.',
        403,
        { reason: 'email_not_verified' },
      );
    }

    await this.users.recordSuccessfulLogin(user.id);
    const authUser = await this.buildAuthUser(user);
    const issued = await this.tokens.issue(authUser, context);

    await this.audit.record('auth.login', {
      actorId: user.id,
      actorEmail: user.email,
      context,
    });

    return issued;
  }

  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------

  async refresh(presented: string, context: RequestContext): Promise<IssuedTokens> {
    const outcome = await this.tokens.redeemRefreshToken(presented);

    if (outcome.kind === 'reuse') {
      await this.audit.record('auth.token_reuse_detected', {
        actorId: outcome.userId,
        context,
        metadata: { familyId: outcome.familyId },
      });
      throw new UnauthenticatedError('Your session has expired. Please sign in again.');
    }

    if (outcome.kind === 'invalid') {
      throw new UnauthenticatedError('Your session has expired. Please sign in again.');
    }

    const user = await this.users.findById(outcome.userId);
    if (!user)
      throw new UnauthenticatedError('Your session has expired. Please sign in again.');

    // Claims are rebuilt from the database on every refresh, so a role or
    // permission change takes effect within one access-token lifetime rather
    // than persisting for the life of the session.
    const authUser = await this.buildAuthUser(user);
    const issued = await this.tokens.issue(authUser, context, outcome.familyId);

    await this.audit.record('auth.token_refreshed', {
      actorId: user.id,
      context,
      metadata: { familyId: outcome.familyId },
    });

    return issued;
  }

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------

  async logout(
    presented: string | undefined,
    userId: string | undefined,
    allDevices: boolean,
    context: RequestContext,
  ): Promise<void> {
    if (allDevices && userId) {
      await this.tokens.revokeAllForUser(userId, 'logout_all');
    } else if (presented) {
      await this.tokens.revokeToken(presented, 'logout');
    }

    await this.audit.record('auth.logout', {
      actorId: userId ?? null,
      context,
      metadata: { allDevices },
    });
  }

  // -------------------------------------------------------------------------
  // Current user
  // -------------------------------------------------------------------------

  async currentUser(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthenticatedError();
    return this.buildAuthUser(user);
  }

  // -------------------------------------------------------------------------
  // Password reset
  // -------------------------------------------------------------------------

  async requestPasswordReset(dto: ForgotPasswordDto, context: RequestContext): Promise<void> {
    const user = await this.users.findByEmail(dto.email);

    await this.audit.record('auth.password_reset_requested', {
      actorId: user?.id ?? null,
      actorEmail: dto.email,
      context,
      metadata: { accountExists: Boolean(user) },
    });

    // Returns successfully either way. The existing forgot-password screen
    // already shows the same confirmation regardless, precisely so that it
    // cannot be used to test whether an address is registered.
    if (!user) return;

    const token = this.passwords.createToken();
    const expiresAt = new Date(Date.now() + this.config.passwordResetTtlMinutes * 60_000);

    await this.verificationTokens.create({
      userId: user.id,
      purpose: 'password_reset',
      tokenHash: this.passwords.hashToken(token),
      expiresAt,
    });

    // Trigger key and variables only. Wording and layout belong to the email
    // module; this service does not compose messages.
    await this.email.sendTemplate({
      trigger: 'account.password_reset',
      to: dto.email,
      vars: {
        reset_url: `${this.config.appUrl}/auth/reset-password?token=${token}`,
        expiry_minutes: this.config.passwordResetTtlMinutes,
      },
    });
  }

  async resetPassword(dto: ResetPasswordDto, context: RequestContext): Promise<void> {
    const record = await this.verificationTokens.consume(
      this.passwords.hashToken(dto.token),
      'password_reset',
    );
    if (!record) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        'This reset link has expired. Please request a new one.',
        400,
      );
    }

    await this.users.setPassword(record.user_id, await this.passwords.hash(dto.password));
    // Every existing session dies. A password reset is the standard response to
    // a suspected compromise, so leaving other sessions alive would defeat it.
    await this.tokens.revokeAllForUser(record.user_id, 'password_reset');

    await this.audit.record('auth.password_reset_completed', {
      actorId: record.user_id,
      context,
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    context: RequestContext,
  ): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthenticatedError();

    const ok = await this.passwords.verify(user.encrypted_password, dto.currentPassword);
    if (!ok) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        'Your current password is incorrect.',
        400,
      );
    }

    await this.users.setPassword(userId, await this.passwords.hash(dto.newPassword));
    await this.tokens.revokeAllForUser(userId, 'password_changed');

    await this.audit.record('auth.password_changed', { actorId: userId, context });
  }

  // -------------------------------------------------------------------------
  // Email verification
  // -------------------------------------------------------------------------

  async verifyEmail(token: string, context: RequestContext): Promise<void> {
    const record = await this.verificationTokens.consume(
      this.passwords.hashToken(token),
      'email_verification',
    );
    if (!record) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        'This verification link has expired. Please request a new one.',
        400,
      );
    }

    await this.users.markEmailConfirmed(record.user_id);
    await this.audit.record('auth.email_verified', { actorId: record.user_id, context });
  }

  async resendVerification(email: string, context: RequestContext): Promise<void> {
    const user = await this.users.findByEmail(email);
    // Silent when the address is unknown or already verified, for the same
    // enumeration reason as password reset.
    if (!user || user.email_confirmed_at) return;
    await this.sendVerificationEmail(user.id, email, context);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private async sendVerificationEmail(
    userId: string,
    email: string,
    context: RequestContext,
  ): Promise<void> {
    const token = this.passwords.createToken();
    const expiresAt = new Date(Date.now() + this.config.emailVerificationTtlHours * 3_600_000);

    await this.verificationTokens.create({
      userId,
      purpose: 'email_verification',
      tokenHash: this.passwords.hashToken(token),
      expiresAt,
    });

    await this.email.sendTemplate({
      trigger: 'account.email_verification',
      to: email,
      vars: {
        verification_url: `${this.config.appUrl}/auth?verify=${token}`,
        expiry_hours: this.config.emailVerificationTtlHours,
      },
    });

    await this.audit.record('auth.email_verification_sent', {
      actorId: userId,
      actorEmail: email,
      context,
    });
  }

  private async buildAuthUser(user: AuthUserRow): Promise<AuthUser> {
    const authz = await this.users.findAuthorization(user.id);
    return {
      id: user.id,
      email: user.email ?? '',
      emailVerified: Boolean(user.email_confirmed_at),
      fullName: authz.fullName,
      roles: authz.roles as AppRole[],
      permissions: authz.permissions,
      primaryRole: (authz.primaryRole as AppRole | null) ?? null,
      mustChangePassword: authz.mustChangePassword,
    };
  }

  /** One answer for every failed sign-in, whatever the real cause. */
  private invalidCredentials(): AppException {
    return new AppException(
      ErrorCode.UNAUTHENTICATED,
      "That email and password combination doesn't match an account.",
      401,
    );
  }

  sessionOf(issued: IssuedTokens): AuthSession {
    return issued.session;
  }
}
