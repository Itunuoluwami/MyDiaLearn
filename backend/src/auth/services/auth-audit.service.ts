import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { PrismaService } from '../../database/prisma.service';
import type { RequestContext } from '../interfaces/auth.interface';

/**
 * Authentication events recorded to the existing public.audit_logs table.
 *
 * Deliberately not log_audit(): that function resolves the actor from
 * auth.uid(), which is exactly what is unavailable for the events most worth
 * recording — a failed login, a reset requested for an address that may not
 * exist. Writing the row directly lets the actor be explicit, or absent.
 *
 * Auditing must never break authentication. Every write is best-effort: a
 * failure is logged and swallowed, because refusing to sign a user in because
 * the audit insert failed is a worse outcome than a missing audit row.
 */
export type AuthEvent =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.login_blocked'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.token_refreshed'
  | 'auth.token_reuse_detected'
  | 'auth.password_reset_requested'
  | 'auth.password_reset_completed'
  | 'auth.password_changed'
  | 'auth.email_verified'
  | 'auth.email_verification_sent';

@Injectable()
export class AuthAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthAuditService.name);
  }

  async record(
    action: AuthEvent,
    options: {
      actorId?: string | null;
      actorEmail?: string | null;
      context?: RequestContext;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const metadata = {
      ...(options.metadata ?? {}),
      ...(options.context?.requestId ? { requestId: options.context.requestId } : {}),
      ...(options.context?.userAgent ? { userAgent: options.context.userAgent } : {}),
    };

    try {
      await this.prisma.$executeRaw`
        insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, metadata, ip)
        values (
          ${options.actorId ?? null}::uuid,
          ${options.actorEmail ?? null},
          ${action},
          'auth',
          ${options.actorId ?? null}::uuid,
          ${JSON.stringify(metadata)}::jsonb,
          ${options.context?.ip ?? null}
        )
      `;
    } catch (error) {
      this.logger.error({ err: error, action }, 'Failed to write auth audit row');
    }

    // Also emitted to the log stream. audit_logs is the durable record; this is
    // what someone tailing logs during an incident actually sees.
    this.logger.info(
      { action, actorId: options.actorId, ip: options.context?.ip, ...options.metadata },
      action,
    );
  }
}
