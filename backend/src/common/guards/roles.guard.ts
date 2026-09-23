import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type AppRole, ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestWithUser } from '../decorators/current-user.decorator';
import { NotAuthorizedError, UnauthenticatedError } from '../exceptions/app.exception';

/**
 * Coarse role check, the application-layer counterpart to the database's
 * is_admin() / has_role() helpers.
 *
 * This does NOT replace row-level tenancy. Holding the `tutor` role says
 * nothing about whether this tutor may read *that* booking; that scoping
 * belongs in the repository layer, where the predicates from the existing RLS
 * policies are reproduced. Treating a role check as sufficient is exactly how
 * removing RLS leaks data.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) throw new UnauthenticatedError();

    // super_admin holds every role implicitly, matching is_admin() in the
    // 20260907090000 migration.
    if (user.roles.includes('super_admin')) return true;

    if (!required.some((role) => user.roles.includes(role))) {
      throw new NotAuthorizedError('Your account does not have access to this area.');
    }
    return true;
  }
}
