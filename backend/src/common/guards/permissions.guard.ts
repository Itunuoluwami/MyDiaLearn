import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/roles.decorator';
import type { RequestWithUser } from '../decorators/current-user.decorator';
import { NotAuthorizedError, UnauthenticatedError } from '../exceptions/app.exception';

/**
 * Fine-grained permission check, mirroring has_permission() and the resolved
 * set returned by my_permissions().
 *
 * Permissions are read from the token rather than queried per request. That
 * keeps the hot path free of a database round trip, at the cost of a grant or
 * revocation not taking effect until the access token refreshes — which is why
 * access tokens are short-lived by default.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) throw new UnauthenticatedError();

    if (user.roles.includes('super_admin')) return true;

    const missing = required.filter((permission) => !user.permissions.includes(permission));
    if (missing.length) {
      throw new NotAuthorizedError(
        'You do not have permission to perform this action.',
        // Naming the missing key is safe and makes support tractable; it
        // reveals nothing the caller could not learn by trying.
        { required: missing },
      );
    }
    return true;
  }
}
