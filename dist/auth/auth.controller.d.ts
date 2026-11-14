import type { Request, Response } from 'express';
import { type AuthConfig } from '../config/configuration';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, LogoutDto, RefreshDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import type { AuthSession, AuthUser } from './interfaces/auth.interface';
export declare class AuthController {
    private readonly auth;
    private readonly config;
    constructor(auth: AuthService, config: AuthConfig);
    register(dto: RegisterDto, request: Request): Promise<{
        requiresVerification: boolean;
    }>;
    login(dto: LoginDto, request: Request, response: Response): Promise<AuthSession>;
    refresh(dto: RefreshDto, request: Request, response: Response): Promise<AuthSession>;
    logout(dto: LogoutDto, request: Request, response: Response): Promise<void>;
    me(user: AuthenticatedUser): Promise<AuthUser>;
    forgotPassword(dto: ForgotPasswordDto, request: Request): Promise<{
        status: string;
    }>;
    resetPassword(dto: ResetPasswordDto, request: Request): Promise<void>;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto, request: Request, response: Response): Promise<void>;
    verifyEmail(dto: VerifyEmailDto, request: Request): Promise<void>;
    resendVerification(dto: ResendVerificationDto, request: Request): Promise<{
        status: string;
    }>;
    private contextOf;
    private setRefreshCookie;
    private readRefreshCookie;
    private clearRefreshCookie;
}
