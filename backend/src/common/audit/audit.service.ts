import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { PrismaService } from '../../database/prisma.service';

/**
 * Context carried with every audited action.
 */
export interface AuditContext {
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Sensitive operations, named consistently as `<domain>.<verb>`.
 *
 * The list is a union rather than a free string so that a typo produces a
 * compile error instead of an event nobody can search for later.
 */
export type AuditAction =
  // Authentication
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
  | 'auth.email_verification_sent'
  // Roles and permissions
  | 'user.roles_changed'
  | 'user.permission_changed'
  | 'user.profile_updated'
  // Tutor verification
  | 'tutor.verification_submitted'
  | 'tutor.verification_approved'
  | 'tutor.verification_rejected'
  | 'tutor.document_uploaded'
  | 'tutor.document_removed'
  | 'tutor.rate_changed'
  // Bookings
  | 'booking.created'
  | 'booking.accepted'
  | 'booking.declined'
  | 'booking.cancelled'
  | 'booking.class_started'
  | 'booking.class_ended'
  // Money
  | 'payment.created'
  | 'payment.refunded'
  | 'payout.requested'
  | 'payout.approved'
  | 'payout.rejected'
  // Disputes and moderation
  | 'dispute.raised'
  | 'dispute.resolved'
  | 'content.moderated'
  // Administration
  | 'admin.invite_created'
  | 'admin.invite_revoked'
  | 'admin.action_requested'
  | 'admin.action_reviewed'
  | 'admin.settings_changed';

/**
 * Durable record of sensitive operations, written to public.audit_logs.
 *
 * Written directly rather than through the database's log_audit(), which
 * resolves the actor from auth.uid(). That is unavailable for exactly the
 * events most worth recording — a failed login, an action taken on behalf of
 * someone else — so the actor is passed explicitly here.
 *
 * **Auditing never breaks the operation it records.** Every write is
 * best-effort: a failure is logged and swallowed, because refusing a booking
 * because its audit row could not be written is the worse outcome.
 *
 * Callers pass only identifiers and outcomes. Passwords, tokens, payment
 * secrets and card details must never reach `metadata`; `redact()` is provided
 * for the cases where a caller has a wider object to hand.
 */
@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuditService.name);
  }

  async record(
    action: AuditAction,
    options: {
      actorId?: string | null;
      actorEmail?: string | null;
      entityType?: string;
      entityId?: string | null;
      before?: unknown;
      after?: unknown;
      context?: AuditContext;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const metadata = {
      ...redactObject(options.metadata ?? {}),
      ...(options.context?.requestId ? { requestId: options.context.requestId } : {}),
      ...(options.context?.userAgent ? { userAgent: options.context.userAgent } : {}),
    };

    try {
      await this.prisma.$executeRaw`
        insert into public.audit_logs
          (actor_id, actor_email, action, entity_type, entity_id, before, after, metadata, ip)
        values (
          ${options.actorId ?? null}::uuid,
          ${options.actorEmail ?? null},
          ${action},
          ${options.entityType ?? action.split('.')[0]},
          ${options.entityId ?? null}::uuid,
          ${options.before === undefined ? null : JSON.stringify(redact(options.before))}::jsonb,
          ${options.after === undefined ? null : JSON.stringify(redact(options.after))}::jsonb,
          ${JSON.stringify(metadata)}::jsonb,
          ${options.context?.ip ?? null}
        )
      `;
    } catch (error) {
      this.logger.error({ err: error, action }, 'Failed to write audit row');
    }

    this.logger.info(
      {
        action,
        actorId: options.actorId,
        entityId: options.entityId,
        ip: options.context?.ip,
      },
      action,
    );
  }
}

/** Keys whose values must never reach the audit log, at any depth. */
const FORBIDDEN = [
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'otp',
  'secret',
  'apikey',
  'authorization',
  'cookie',
  'encrypted_password',
  'token_hash',
  'card',
  'cardnumber',
  'cvv',
  'pan',
  'iban',
  'account_number',
];

/**
 * Strips credentials before anything is persisted.
 *
 * A belt-and-braces measure: callers are expected to pass identifiers and
 * outcomes, not whole request bodies. But audit rows are long-lived and widely
 * readable, so a leaked secret there is worse than in a log line that rotates.
 */
export function redactObject(value: Record<string, unknown>): Record<string, unknown> {
  return redact(value) as Record<string, unknown>;
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = FORBIDDEN.includes(key.toLowerCase().replace(/[_-]/g, ''))
      ? '[redacted]'
      : redact(val, depth + 1);
  }
  return out;
}
