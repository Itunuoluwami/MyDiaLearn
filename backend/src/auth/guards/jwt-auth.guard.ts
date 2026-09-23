import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UnauthenticatedError } from '../../common/exceptions/app.exception';

/**
 * Bound globally in AppModule, so the API denies by default and every
 * unauthenticated route has to say so with @Public().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      // Deliberately one message for expired, malformed and wrong-signature
      // alike. Distinguishing them tells an attacker which knob to turn.
      throw new UnauthenticatedError('Invalid or expired access token.');
    }
    return user;
  }
}
