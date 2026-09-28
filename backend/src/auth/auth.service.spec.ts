import { Test } from '@nestjs/testing';

import { authConfig } from '../config/configuration';
import { AppException } from '../common/exceptions/app.exception';
import { UserRepository } from '../database/repositories/user.repository';
import { VerificationTokenRepository } from '../database/repositories/verification-token.repository';
import { EmailService } from '../integrations/email/email.service';
import { AuthService } from './auth.service';
import { AuditService } from '../common/audit/audit.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

/**
 * These tests are about the properties that make authentication safe rather
 * than about happy paths: that answers do not enumerate accounts, that failures
 * are recorded, and that a password change invalidates existing sessions.
 */
describe('AuthService', () => {
  const passwords = new PasswordService();
  let service: AuthService;
  // Plain jest.Mock records rather than jest.Mocked<Partial<T>>: the latter
  // types each member as the real method signature, which has no mock helpers.
  let users: Record<string, jest.Mock>;
  let tokens: Record<string, jest.Mock>;
  let audit: Record<string, jest.Mock>;
  let email: Record<string, jest.Mock>;
  let verification: Record<string, jest.Mock>;

  const config = {
    appUrl: 'http://localhost:8080',
    emailVerificationRequired: true,
    emailVerificationTtlHours: 24,
    passwordResetTtlMinutes: 60,
    lockoutThreshold: 10,
    lockoutMinutes: 15,
    cookieSameSite: 'lax' as const,
    cookieSecure: false,
  };

  const verifiedUser = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    encrypted_password: null as string | null,
    email_confirmed_at: new Date(),
    failed_login_count: 0,
    locked_until: null as Date | null,
    last_sign_in_at: null,
    password_changed_at: null,
  };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setPassword: jest.fn(),
      clearMustChangePassword: jest.fn(),
      markEmailConfirmed: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
      recordFailedLogin: jest.fn().mockResolvedValue(1),
      findAuthorization: jest.fn().mockResolvedValue({
        roles: ['parent'],
        permissions: ['bookings.create'],
        primaryRole: 'parent',
        mustChangePassword: false,
        fullName: 'Ada Lovelace',
      }),
    };
    tokens = {
      issue: jest.fn().mockResolvedValue({
        session: { accessToken: 'a', expiresIn: 900, expiresAt: 0, tokenType: 'bearer' },
        refreshToken: 'r',
        refreshExpiresAt: new Date(),
      }),
      revokeAllForUser: jest.fn(),
      redeemRefreshToken: jest.fn(),
      revokeToken: jest.fn(),
    };
    audit = { record: jest.fn() };
    email = {
      sendTemplate: jest.fn().mockResolvedValue({ messageId: 'm1' }),
      send: jest.fn().mockResolvedValue({ messageId: 'm1' }),
      isConfigured: jest.fn().mockReturnValue(true),
    };
    verification = { create: jest.fn(), consume: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: users },
        { provide: VerificationTokenRepository, useValue: verification },
        { provide: PasswordService, useValue: passwords },
        { provide: TokenService, useValue: tokens },
        { provide: AuditService, useValue: audit },
        { provide: EmailService, useValue: email },
        { provide: authConfig.KEY, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('gives the same answer for an unknown account and a wrong password', async () => {
      users.findByEmail.mockResolvedValueOnce(null);
      const unknown = await service
        .login({ email: 'nobody@example.com', password: 'x' }, {})
        .catch((e: AppException) => e);

      users.findByEmail.mockResolvedValueOnce({
        ...verifiedUser,
        encrypted_password: await passwords.hash('the-real-password'),
      });
      const wrong = await service
        .login({ email: 'ada@example.com', password: 'not-it' }, {})
        .catch((e: AppException) => e);

      expect((unknown as AppException).getStatus()).toBe(401);
      expect((wrong as AppException).getStatus()).toBe(401);
      expect((unknown as AppException).message).toEqual((wrong as AppException).message);
    });

    it('answers a locked account exactly like a wrong password', async () => {
      // Saying "locked" confirms the address exists and tells an attacker
      // their guessing is working.
      users.findByEmail.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('right'),
        locked_until: new Date(Date.now() + 600_000),
      });

      const error = await service
        .login({ email: 'ada@example.com', password: 'right' }, {})
        .catch((e: AppException) => e);

      expect((error as AppException).getStatus()).toBe(401);
      expect((error as AppException).message).toContain("doesn't match an account");
      expect(audit.record).toHaveBeenCalledWith('auth.login_blocked', expect.anything());
    });

    it('counts a failed attempt so lockout can engage', async () => {
      users.findByEmail.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('right'),
      });
      await service.login({ email: 'ada@example.com', password: 'wrong' }, {}).catch(() => {});
      expect(users.recordFailedLogin).toHaveBeenCalledWith(verifiedUser.id, 10, 15);
    });

    it('refuses an unverified address, distinctly from bad credentials', async () => {
      users.findByEmail.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('right'),
        email_confirmed_at: null,
      });

      const error = await service
        .login({ email: 'ada@example.com', password: 'right' }, {})
        .catch((e: AppException) => e);

      // Safe to be specific: the password was correct, so the caller already
      // knows the account exists.
      expect((error as AppException).getStatus()).toBe(403);
      expect((error as AppException).message).toContain('verify your email');
    });

    it('issues a session and clears the failure counter on success', async () => {
      users.findByEmail.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('right'),
      });

      await service.login({ email: 'ada@example.com', password: 'right' }, {});

      expect(users.recordSuccessfulLogin).toHaveBeenCalledWith(verifiedUser.id);
      expect(tokens.issue).toHaveBeenCalled();
      expect(audit.record).toHaveBeenCalledWith('auth.login', expect.anything());
    });
  });

  describe('password reset', () => {
    it('succeeds silently for an unknown address', async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(
        service.requestPasswordReset({ email: 'nobody@example.com' }, {}),
      ).resolves.toBeUndefined();
      // No email, no token — but no error either, so the endpoint cannot be
      // used to test whether an address is registered.
      expect(email.sendTemplate).not.toHaveBeenCalled();
      expect(verification.create).not.toHaveBeenCalled();
    });

    it('sends a single-use link for a known address', async () => {
      users.findByEmail.mockResolvedValue({ ...verifiedUser });
      await service.requestPasswordReset({ email: 'ada@example.com' }, {});

      expect(verification.create).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'password_reset' }),
      );
      // The service passes a trigger key and variables; it never composes copy.
      const sent = email.sendTemplate.mock.calls[0][0] as {
        trigger: string;
        vars: Record<string, string>;
      };
      expect(sent.trigger).toBe('account.password_reset');
      expect(sent.vars.reset_url).toContain('/auth/reset-password?token=');
    });

    it('revokes every session when a reset completes', async () => {
      verification.consume.mockResolvedValue({
        id: 'x',
        user_id: verifiedUser.id,
        purpose: 'password_reset',
        expires_at: new Date(),
        consumed_at: new Date(),
      });

      await service.resetPassword({ token: 'a'.repeat(32), password: 'Str0ng!Pass' }, {});

      // A reset is the standard response to a suspected compromise; leaving
      // other sessions alive would defeat the point.
      expect(tokens.revokeAllForUser).toHaveBeenCalledWith(verifiedUser.id, 'password_reset');
    });

    it('rejects a spent or expired token', async () => {
      verification.consume.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'b'.repeat(32), password: 'Str0ng!Pass' }, {}),
      ).rejects.toThrow(/expired/i);
    });
  });

  describe('registration', () => {
    it('hands the trigger the metadata keys it reads', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue({ id: verifiedUser.id });

      await service.register(
        {
          email: 'new@example.com',
          password: 'Str0ng!Pass',
          fullName: 'New Person',
          role: 'tutor',
          timezone: 'Africa/Lagos',
        },
        {},
      );

      // handle_new_user() builds profiles and user_roles from exactly these
      // keys. Renaming one silently stops profiles being created.
      const input = users.create.mock.calls[0][0] as { metadata: Record<string, unknown> };
      expect(input.metadata).toMatchObject({
        full_name: 'New Person',
        role: 'tutor',
        timezone: 'Africa/Lagos',
      });
    });

    it('refuses a duplicate address', async () => {
      users.findByEmail.mockResolvedValue({ ...verifiedUser });
      await expect(
        service.register(
          { email: 'ada@example.com', password: 'Str0ng!Pass', fullName: 'A', role: 'parent' },
          {},
        ),
      ).rejects.toThrow(/already exists/i);
    });
  });

  describe('change password', () => {
    it('requires the current password', async () => {
      users.findById.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('current'),
      });

      await expect(
        service.changePassword(
          verifiedUser.id,
          { currentPassword: 'wrong', newPassword: 'Str0ng!Pass' },
          {},
        ),
      ).rejects.toThrow(/current password is incorrect/i);
      expect(users.setPassword).not.toHaveBeenCalled();
    });

    it('revokes every session once changed', async () => {
      users.findById.mockResolvedValue({
        ...verifiedUser,
        encrypted_password: await passwords.hash('current'),
      });

      await service.changePassword(
        verifiedUser.id,
        { currentPassword: 'current', newPassword: 'Str0ng!Pass' },
        {},
      );

      expect(users.setPassword).toHaveBeenCalled();
      expect(tokens.revokeAllForUser).toHaveBeenCalledWith(
        verifiedUser.id,
        'password_changed',
      );
    });
  });
});
