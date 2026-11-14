import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { AdminRepository } from './admin.repository';
export declare class AdminService {
    private readonly repository;
    private readonly audit;
    private readonly notifications;
    constructor(repository: AdminRepository, audit: AuditService, notifications: NotificationDispatchService);
    private tellTutor;
    dashboard(adminId: string): Promise<Record<string, unknown> | null>;
    users(adminId: string, query: {
        search?: string;
        role?: string;
        from?: string;
        to?: string;
    }): Promise<Record<string, unknown>[]>;
    requestSuspension(adminId: string, profileId: string, isActive: boolean): Promise<{
        requestId: string;
    }>;
    verificationQueue(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    verificationDetail(adminId: string, tutorId: string): ReturnType<AdminRepository['verificationDetail']>;
    reviewStep(adminId: string, input: {
        tutorId: string;
        stepId: string;
        status: string;
        reviewerNotes?: string | undefined;
    }): Promise<void>;
    reviewDocument(adminId: string, input: {
        documentId: string;
        status: string;
        reviewerNotes?: string | undefined;
    }): Promise<void>;
    approveTutor(adminId: string, tutorId: string, context: AuditContext): Promise<void>;
    rejectTutor(adminId: string, tutorId: string, reason: string | undefined, context: AuditContext): Promise<void>;
    setHourlyRate(adminId: string, tutorId: string, hourlyRate: number, context: AuditContext): Promise<void>;
    bookings(adminId: string, query: {
        search?: string;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<Record<string, unknown>[]>;
    overrideBookingStatus(adminId: string, bookingId: string, status: string): Promise<void>;
    requestCancellation(adminId: string, bookingId: string, input: {
        reason: string;
        refundPercentage?: number | undefined;
    }): Promise<{
        requestId: string;
    }>;
    payments(adminId: string, query: {
        status?: string;
        from?: string;
        to?: string;
    }): Promise<Record<string, unknown>[]>;
    requestRefund(adminId: string, paymentId: string, input: {
        amount: number;
        reason?: string | undefined;
    }): Promise<{
        requestId: string;
    }>;
    payouts(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    requestPayoutSettlement(adminId: string, payoutId: string): Promise<{
        requestId: string;
    }>;
    rejectPayout(adminId: string, payoutId: string, notes: string | undefined): Promise<void>;
    disputes(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    resolveDispute(adminId: string, disputeId: string, input: {
        status: string;
        notes?: string | undefined;
    }, context: AuditContext): Promise<void>;
    private submit;
    reviews(adminId: string, published: boolean | null): Promise<Record<string, unknown>[]>;
    setReviewPublished(adminId: string, id: string, isPublished: boolean): Promise<void>;
    messages(adminId: string, search: string): Promise<Record<string, unknown>[]>;
    setMessageHidden(adminId: string, id: string, input: {
        isHidden: boolean;
        reason?: string | undefined;
    }): Promise<void>;
    report(adminId: string, from: string, to: string): Promise<Record<string, unknown> | null>;
    agencies(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    agency(adminId: string, agencyId: string): Promise<Record<string, unknown>>;
    reviewAgencyStep(adminId: string, input: {
        agencyId: string;
        stepId: string;
        status: string;
        reviewerNotes?: string | undefined;
    }): Promise<void>;
    decideAgency(adminId: string, agencyId: string, input: {
        status: string;
        reason?: string | undefined;
    }, context: AuditContext): Promise<void>;
    setAgencyShare(adminId: string, agencyId: string, share: number, context: AuditContext): Promise<void>;
}
