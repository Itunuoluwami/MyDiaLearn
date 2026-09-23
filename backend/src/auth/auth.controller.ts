import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Inject } from '@nestjs/common';
import type { Request, Response } from 'express';

import { authConfig, type AuthConfig } from '../config/configuration';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import type { AuthSession, AuthUser, RequestContext } from './interfaces/auth.interface';

/** Name of the httpOnly cookie carrying the refresh token. */
const REFRESH_COOKIE = 'dialearn_rt';

/**
 * Authentication endpoints.
 *
 * Token strategy, and why:
 *
 *   - The **access token** is returned in the response body and held in memory
 *     by the frontend adapter. It is short-lived and never written to storage.
 *   - The **refresh token** is set as an httpOnly, SameSite cookie. JavaScript
 *     cannot read it, so an XSS bug cannot steal a long-lived session — which
 *     is exactly what the current localStorage-backed Supabase session is
 *     exposed to.
 *
 * The user-visible behaviour is unchanged: the session still survives a page
 * reload, because the adapter calls /auth/refresh on boot and the browser
 * sends the cookie automatically.
 *
 * Rate limits here are tighter than the global default. These are the endpoints
 * worth grinding against, and the global limit is sized for ordinary traffic.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
  ): Promise<{ requiresVerification: boolean }> {
    return this.auth.register(dto, this.contextOf(request));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSession> {
    const issued = await this.auth.login(dto, this.contextOf(request));
    this.setRefreshCookie(response, issued.refreshToken, issued.refreshExpiresAt);
    return issued.session;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSession> {
    // Cookie first; the body is a fallback for clients that cannot hold one.
    const presented = this.readRefreshCookie(request) ?? dto.refreshToken;
    if (!presented) {
      this.clearRefreshCookie(response);
      throw new (await import('../common/exceptions/app.exception')).UnauthenticatedError(
        'Your session has expired. Please sign in again.',
      );
    }

    try {
      const issued = await this.auth.refresh(presented, this.contextOf(request));
      this.setRefreshCookie(response, issued.refreshToken, issued.refreshExpiresAt);
      return issued.session;
    } catch (error) {
      // A refresh that fails leaves a cookie that will keep failing. Clearing
      // it stops the adapter retrying on every page load.
      this.clearRefreshCookie(response);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() dto: LogoutDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // Public so that signing out always works, even with an expired access
    // token. Presenting a valid refresh cookie is the authority here.
    const presented = this.readRefreshCookie(request);
    const user = (request as Request & { user?: AuthenticatedUser }).user;
    await this.auth.logout(
      presented,
      user?.id,
      dto.allDevices ?? false,
      this.contextOf(request),
    );
    this.clearRefreshCookie(response);
  }

  /** The current account, its roles and its resolved permissions. */
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    return this.auth.currentUser(user.id);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    await this.auth.requestPasswordReset(dto, this.contextOf(request));
    // Always the same answer, so this cannot be used to test whether an
    // address is registered.
    return { status: 'accepted' };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request): Promise<void> {
    await this.auth.resetPassword(dto, this.contextOf(request));
  }

  @Post('password/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.changePassword(user.id, dto, this.contextOf(request));
    // Changing a password revokes every session, including this one.
    this.clearRefreshCookie(response);
  }

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() request: Request): Promise<void> {
    await this.auth.verifyEmail(dto.token, this.contextOf(request));
  }

  @Public()
  @Post('email/resend')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    await this.auth.resendVerification(dto.email, this.contextOf(request));
    return { status: 'accepted' };
  }

  // -------------------------------------------------------------------------

  private contextOf(request: Request): RequestContext {
    const forwarded = request.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ||
      request.ip;
    return {
      ...(ip ? { ip } : {}),
      ...(request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {}),
      ...((request as Request & { requestId?: string }).requestId
        ? { requestId: (request as Request & { requestId?: string }).requestId }
        : {}),
    };
  }

  private setRefreshCookie(response: Response, token: string, expiresAt: Date): void {
    response.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      ...(this.config.cookieDomain ? { domain: this.config.cookieDomain } : {}),
      // Scoped to the refresh and logout paths so it is not attached to every
      // API call — a cookie that travels everywhere is a cookie with a larger
      // blast radius than it needs.
      path: '/',
      expires: expiresAt,
    });
  }

  private readRefreshCookie(request: Request): string | undefined {
    const jar = (request as Request & { cookies?: Record<string, string> }).cookies;
    return jar?.[REFRESH_COOKIE];
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      ...(this.config.cookieDomain ? { domain: this.config.cookieDomain } : {}),
      path: '/',
    });
  }
}
