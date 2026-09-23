import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { jwtConfig, type JwtConfig } from '../../config/configuration';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AppRole } from '../decorators/roles.decorator';
import type { AuthenticatedUser, RequestWithUser } from '../decorators/current-user.decorator';
import { UnauthenticatedError } from '../exceptions/app.exception';

interface AccessTokenClaims {
  sub: string;
  email: string;
  roles?: AppRole[];
  permissions?: string[];
}

/**
 * Bound globally in AppModule, so the API denies by default.
 *
 * Token issuance is Phase 2 — this guard only verifies and unpacks. That
 * ordering is intentional: the security posture is in place before the first
 * real endpoint exists, rather than being retrofitted once routes are already
 * answering.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly config: JwtConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthenticatedError();

    try {
      const claims = await this.jwtService.verifyAsync<AccessTokenClaims>(token, {
        secret: this.config.secret,
      });

      const user: AuthenticatedUser = {
        id: claims.sub,
        email: claims.email,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
      };
      request.user = user;
      return true;
    } catch {
      // Deliberately opaque: distinguishing "expired" from "malformed" from
      // "wrong signature" tells an attacker which knob to turn.
      throw new UnauthenticatedError('Invalid or expired access token.');
    }
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const header = request.headers.authorization;
    if (!header) return undefined;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' ? value : undefined;
  }
}
