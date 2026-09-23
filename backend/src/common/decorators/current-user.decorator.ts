import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import type { AppRole } from './roles.decorator';

/** The authenticated caller, as resolved from the access token. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: AppRole[];
  permissions: string[];
}

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
  requestId?: string;
};

/**
 * Injects the authenticated caller, so controllers never reach into the raw
 * request object to find out who is calling.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

export const RequestId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<RequestWithUser>().requestId;
});
