import type { Request } from 'express';

import type { AuditContext } from './audit.service';

/**
 * Builds audit context from a request.
 *
 * Shared so every controller records the same fields the same way, and so the
 * x-forwarded-for handling — take the first hop, not the whole chain — exists
 * once rather than in each domain.
 */
export function auditContextOf(request: Request): AuditContext {
  const forwarded = request.headers['x-forwarded-for'];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || request.ip;

  return {
    ...(ip ? { ip } : {}),
    ...(request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {}),
    ...((request as Request & { requestId?: string }).requestId
      ? { requestId: (request as Request & { requestId?: string }).requestId }
      : {}),
  };
}
