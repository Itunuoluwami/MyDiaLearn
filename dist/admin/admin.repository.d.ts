import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
export interface AdminUserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    primary_role: string;
    is_active: boolean;
    onboarding_completed: boolean;
    created_at: Date;
    roles: string[] | null;
}
export interface VerificationQueueRow {
    id: string;
    profile_id: string;
    headline: string | null;
    verification_status: string;
    is_listed: boolean;
    submitted_at: Date | null;
    years_experience: number | null;
    hourly_rate: string | null;
    currency: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    agency_name: string | null;
}
export declare class AdminRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    dashboardSummary(adminId: string): Promise<Record<string, unknown> | null>;
    listUsers(adminId: string, filters: {
        search?: string;
        role?: string;
        from?: Date;
        to?: Date;
    }): Promise<AdminUserRow[]>;
    requestAction(adminId: string, action: string, payload: object): Promise<string>;
    verificationQueue(adminId: string, status: string): Promise<VerificationQueueRow[]>;
    verificationDetail(adminId: string, tutorId: string): Promise<{
        steps: Record<string, unknown>[];
        progress: Record<string, unknown>[];
        documents: Record<string, unknown>[];
    }>;
    verificationRecipient(tutorId: string, stepId?: string): Promise<{
        tutor_user_id: string;
        tutor_email: string | null;
        step_name: string | null;
    } | null>;
    reviewStep(adminId: string, input: {
        tutorId: string;
        stepId: string;
        status: string;
        reviewerNotes: string | null;
    }): Promise<void>;
    reviewDocument(adminId: string, input: {
        documentId: string;
        status: string;
        reviewerNotes: string | null;
    }): Promise<boolean>;
    setTutorVerification(adminId: string, tutorId: string, outcome: 'verified' | 'rejected'): Promise<boolean>;
    setHourlyRate(adminId: string, tutorId: string, hourlyRate: number): Promise<{
        previous: string | null;
        currency: string;
    } | null>;
    listBookings(adminId: string, filters: {
        search?: string;
        status?: string;
        from?: Date;
        to?: Date;
    }): Promise<Record<string, unknown>[]>;
    setBookingStatus(adminId: string, bookingId: string, status: string): Promise<boolean>;
    listPayments(adminId: string, filters: {
        status?: string;
        from?: Date;
        to?: Date;
    }): Promise<Record<string, unknown>[]>;
    listPayouts(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    rejectPayout(adminId: string, payoutId: string, notes: string | null): Promise<void>;
    listDisputes(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    resolveDispute(adminId: string, input: {
        disputeId: string;
        status: string;
        notes: string | null;
    }): Promise<void>;
    listReviews(adminId: string, published: boolean | null): Promise<Record<string, unknown>[]>;
    setReviewPublished(adminId: string, id: string, isPublished: boolean): Promise<boolean>;
    searchMessages(adminId: string, search: string): Promise<Record<string, unknown>[]>;
    setMessageHidden(adminId: string, id: string, isHidden: boolean, reason: string | null): Promise<boolean>;
    reportSummary(adminId: string, from: Date, to: Date): Promise<Record<string, unknown> | null>;
    listAgencies(adminId: string, status: string): Promise<Record<string, unknown>[]>;
    agencyDetail(adminId: string, agencyId: string): Promise<{
        agency: Record<string, unknown> | null;
        steps: Record<string, unknown>[];
        tutors: Record<string, unknown>[];
    }>;
    reviewAgencyStep(adminId: string, input: {
        agencyId: string;
        stepId: string;
        status: string;
        reviewerNotes: string | null;
    }): Promise<void>;
    setAgencyStatus(adminId: string, agencyId: string, status: string): Promise<boolean>;
    setAgencyShare(adminId: string, agencyId: string, share: number): Promise<{
        previous: string;
    } | null>;
}
