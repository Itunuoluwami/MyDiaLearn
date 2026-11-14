import { type AuthConfig } from '../config/configuration';
import { UserRepository } from '../database/repositories/user.repository';
import { VerificationTokenRepository } from '../database/repositories/verification-token.repository';
import { EmailService } from '../integrations/email/email.service';
import type { AuthSession, AuthUser, IssuedTokens, RequestContext } from './interfaces/auth.interface';
import type { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { AuditService } from '../common/audit/audit.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
export declare class AuthService {
    private readonly users;
    private readonly verificationTokens;
    private readonly passwords;
    private readonly tokens;
    private readonly audit;
    private readonly email;
    private readonly config;
    constructor(users: UserRepository, verificationTokens: VerificationTokenRepository, passwords: PasswordService, tokens: TokenService, audit: AuditService, email: EmailService, config: AuthConfig);
    register(dto: RegisterDto, context: RequestContext): Promise<{
        requiresVerification: boolean;
    }>;
    login(dto: LoginDto, context: RequestContext): Promise<IssuedTokens>;
    refresh(presented: string, context: RequestContext): Promise<IssuedTokens>;
    logout(presented: string | undefined, userId: string | undefined, allDevices: boolean, context: RequestContext): Promise<void>;
    currentUser(userId: string): Promise<AuthUser>;
    requestPasswordReset(dto: ForgotPasswordDto, context: RequestContext): Promise<void>;
    provisionAccount(input: {
        email: string;
        fullName: string;
        role: 'tutor';
        timezone?: string | undefined;
    }, invite: {
        agencyName: string;
        actorId: string;
    }, context: RequestContext): Promise<{
        userId: string;
        emailed: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto, context: RequestContext): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto, context: RequestContext): Promise<void>;
    verifyEmail(token: string, context: RequestContext): Promise<void>;
    resendVerification(email: string, context: RequestContext): Promise<void>;
    private sendVerificationEmail;
    private buildAuthUser;
    private invalidCredentials;
    sessionOf(issued: IssuedTokens): AuthSession;
}
