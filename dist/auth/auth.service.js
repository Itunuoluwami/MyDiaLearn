"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../config/configuration");
const app_exception_1 = require("../common/exceptions/app.exception");
const user_repository_1 = require("../database/repositories/user.repository");
const verification_token_repository_1 = require("../database/repositories/verification-token.repository");
const email_service_1 = require("../integrations/email/email.service");
const audit_service_1 = require("../common/audit/audit.service");
const password_service_1 = require("./services/password.service");
const token_service_1 = require("./services/token.service");
let AuthService = class AuthService {
    users;
    verificationTokens;
    passwords;
    tokens;
    audit;
    email;
    config;
    constructor(users, verificationTokens, passwords, tokens, audit, email, config) {
        this.users = users;
        this.verificationTokens = verificationTokens;
        this.passwords = passwords;
        this.tokens = tokens;
        this.audit = audit;
        this.email = email;
        this.config = config;
    }
    async register(dto, context) {
        const existing = await this.users.findByEmail(dto.email);
        if (existing) {
            throw new app_exception_1.ConflictError('An account with this email already exists.');
        }
        const passwordHash = await this.passwords.hash(dto.password);
        const requiresVerification = this.config.emailVerificationRequired;
        const created = await this.users.create({
            email: dto.email,
            passwordHash,
            emailConfirmed: !requiresVerification,
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
    async login(dto, context) {
        const user = await this.users.findByEmail(dto.email);
        if (!user) {
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
            throw this.invalidCredentials();
        }
        const ok = await this.passwords.verify(user.encrypted_password, dto.password);
        if (!ok) {
            const count = await this.users.recordFailedLogin(user.id, this.config.lockoutThreshold, this.config.lockoutMinutes);
            await this.audit.record('auth.login_failed', {
                actorId: user.id,
                actorEmail: user.email,
                context,
                metadata: { reason: 'bad_password', failedCount: count },
            });
            throw this.invalidCredentials();
        }
        if (this.config.emailVerificationRequired && !user.email_confirmed_at) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'Please verify your email address before signing in.', 403, { reason: 'email_not_verified' });
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
    async refresh(presented, context) {
        const outcome = await this.tokens.redeemRefreshToken(presented);
        if (outcome.kind === 'concurrent') {
            await this.audit.record('auth.token_refresh_concurrent', {
                actorId: outcome.userId,
                context,
                metadata: { familyId: outcome.familyId },
            });
        }
        if (outcome.kind === 'reuse') {
            await this.audit.record('auth.token_reuse_detected', {
                actorId: outcome.userId,
                context,
                metadata: { familyId: outcome.familyId },
            });
            throw new app_exception_1.UnauthenticatedError('Your session has expired. Please sign in again.');
        }
        if (outcome.kind === 'invalid') {
            throw new app_exception_1.UnauthenticatedError('Your session has expired. Please sign in again.');
        }
        const user = await this.users.findById(outcome.userId);
        if (!user)
            throw new app_exception_1.UnauthenticatedError('Your session has expired. Please sign in again.');
        const authUser = await this.buildAuthUser(user);
        const issued = await this.tokens.issue(authUser, context, outcome.familyId);
        await this.audit.record('auth.token_refreshed', {
            actorId: user.id,
            context,
            metadata: { familyId: outcome.familyId },
        });
        return issued;
    }
    async logout(presented, userId, allDevices, context) {
        if (allDevices && userId) {
            await this.tokens.revokeAllForUser(userId, 'logout_all');
        }
        else if (presented) {
            await this.tokens.revokeToken(presented, 'logout');
        }
        await this.audit.record('auth.logout', {
            actorId: userId ?? null,
            context,
            metadata: { allDevices },
        });
    }
    async currentUser(userId) {
        const user = await this.users.findById(userId);
        if (!user)
            throw new app_exception_1.UnauthenticatedError();
        return this.buildAuthUser(user);
    }
    async requestPasswordReset(dto, context) {
        const user = await this.users.findByEmail(dto.email);
        await this.audit.record('auth.password_reset_requested', {
            actorId: user?.id ?? null,
            actorEmail: dto.email,
            context,
            metadata: { accountExists: Boolean(user) },
        });
        if (!user)
            return;
        const token = this.passwords.createToken();
        const expiresAt = new Date(Date.now() + this.config.passwordResetTtlMinutes * 60_000);
        await this.verificationTokens.create({
            userId: user.id,
            purpose: 'password_reset',
            tokenHash: this.passwords.hashToken(token),
            expiresAt,
        });
        await this.email.sendTemplate({
            trigger: 'account.password_reset',
            to: dto.email,
            vars: {
                reset_url: `${this.config.appUrl}/auth/reset-password?token=${token}`,
                expiry_minutes: this.config.passwordResetTtlMinutes,
            },
        });
    }
    async provisionAccount(input, invite, context) {
        const email = input.email.trim().toLowerCase();
        if (await this.users.findByEmail(email)) {
            throw new app_exception_1.ConflictError('An account with this email already exists.');
        }
        const created = await this.users.create({
            email,
            passwordHash: await this.passwords.hash(this.passwords.createToken()),
            emailConfirmed: false,
            metadata: {
                full_name: input.fullName,
                first_name: null,
                last_name: null,
                phone: null,
                country_code: null,
                timezone: input.timezone ?? 'UTC',
                role: input.role,
            },
        });
        const token = this.passwords.createToken();
        const expiryHours = this.config.emailVerificationTtlHours;
        await this.verificationTokens.create({
            userId: created.id,
            purpose: 'password_reset',
            tokenHash: this.passwords.hashToken(token),
            expiresAt: new Date(Date.now() + expiryHours * 3_600_000),
        });
        const sent = await this.email.sendTemplate({
            trigger: 'agency.tutor_invite',
            to: email,
            vars: {
                agency_name: invite.agencyName,
                set_password_url: `${this.config.appUrl}/auth/reset-password?token=${token}`,
                expiry_hours: expiryHours,
            },
        });
        await this.audit.record('auth.register', {
            actorId: invite.actorId,
            actorEmail: null,
            entityType: 'profile',
            entityId: created.id,
            context,
            metadata: { role: input.role, provisionedBy: 'agency' },
        });
        return { userId: created.id, emailed: sent !== null };
    }
    async resetPassword(dto, context) {
        const record = await this.verificationTokens.consume(this.passwords.hashToken(dto.token), 'password_reset');
        if (!record) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'This reset link has expired. Please request a new one.', 400);
        }
        await this.users.setPassword(record.user_id, await this.passwords.hash(dto.password));
        await this.users.markEmailConfirmed(record.user_id);
        await this.tokens.revokeAllForUser(record.user_id, 'password_reset');
        await this.audit.record('auth.password_reset_completed', {
            actorId: record.user_id,
            context,
        });
    }
    async changePassword(userId, dto, context) {
        const user = await this.users.findById(userId);
        if (!user)
            throw new app_exception_1.UnauthenticatedError();
        const ok = await this.passwords.verify(user.encrypted_password, dto.currentPassword);
        if (!ok) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'Your current password is incorrect.', 400);
        }
        await this.users.setPassword(userId, await this.passwords.hash(dto.newPassword));
        await this.users.clearMustChangePassword(userId);
        await this.tokens.revokeAllForUser(userId, 'password_changed');
        await this.audit.record('auth.password_changed', { actorId: userId, context });
    }
    async verifyEmail(token, context) {
        const record = await this.verificationTokens.consume(this.passwords.hashToken(token), 'email_verification');
        if (!record) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'This verification link has expired. Please request a new one.', 400);
        }
        await this.users.markEmailConfirmed(record.user_id);
        await this.audit.record('auth.email_verified', { actorId: record.user_id, context });
    }
    async resendVerification(email, context) {
        const user = await this.users.findByEmail(email);
        if (!user || user.email_confirmed_at)
            return;
        await this.sendVerificationEmail(user.id, email, context);
    }
    async sendVerificationEmail(userId, email, context) {
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
    async buildAuthUser(user) {
        const authz = await this.users.findAuthorization(user.id);
        return {
            id: user.id,
            email: user.email ?? '',
            emailVerified: Boolean(user.email_confirmed_at),
            fullName: authz.fullName,
            roles: authz.roles,
            permissions: authz.permissions,
            primaryRole: authz.primaryRole ?? null,
            mustChangePassword: authz.mustChangePassword,
        };
    }
    invalidCredentials() {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.UNAUTHENTICATED, "That email and password combination doesn't match an account.", 401);
    }
    sessionOf(issued) {
        return issued.session;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Inject)(configuration_1.authConfig.KEY)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        verification_token_repository_1.VerificationTokenRepository,
        password_service_1.PasswordService,
        token_service_1.TokenService,
        audit_service_1.AuditService,
        email_service_1.EmailService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map