import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../database/prisma.service';
export interface AuditContext {
    ip?: string;
    userAgent?: string;
    requestId?: string;
}
export type AuditAction = 'auth.login' | 'auth.login_failed' | 'auth.login_blocked' | 'auth.logout' | 'auth.register' | 'auth.token_refreshed' | 'auth.token_reuse_detected' | 'auth.token_refresh_concurrent' | 'auth.password_reset_requested' | 'auth.password_reset_completed' | 'auth.password_changed' | 'auth.email_verified' | 'auth.email_verification_sent' | 'user.roles_changed' | 'user.permission_changed' | 'user.profile_updated' | 'tutor.verification_submitted' | 'tutor.verification_approved' | 'tutor.verification_rejected' | 'tutor.document_uploaded' | 'tutor.document_removed' | 'tutor.rate_changed' | 'booking.created' | 'booking.accepted' | 'booking.declined' | 'booking.cancelled' | 'booking.class_started' | 'booking.class_ended' | 'payment.created' | 'payment.refunded' | 'payout.requested' | 'payout.approved' | 'payout.rejected' | 'dispute.raised' | 'dispute.resolved' | 'content.moderated' | 'admin.invite_created' | 'admin.invite_revoked' | 'admin.action_requested' | 'admin.action_reviewed' | 'admin.settings_changed' | 'agency.verification_submitted' | 'agency.verification_reviewed' | 'agency.tutor_added' | 'agency.tutor_removed' | 'agency.tutor_managed' | 'agency.payout_requested';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: PinoLogger);
    record(action: AuditAction, options?: {
        actorId?: string | null;
        actorEmail?: string | null;
        entityType?: string;
        entityId?: string | null;
        before?: unknown;
        after?: unknown;
        context?: AuditContext;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
}
export declare function redactObject(value: Record<string, unknown>): Record<string, unknown>;
export declare function redact(value: unknown, depth?: number): unknown;
