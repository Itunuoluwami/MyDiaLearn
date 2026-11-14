import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdminBookingsQueryDto, AgencyDecisionDto, AgencyQueueQueryDto, AgencyShareDto, AdminDisputesQueryDto, AdminPaymentsQueryDto, AdminPayoutsQueryDto, AdminUsersQueryDto, CancelBookingRequestDto, ModerationMessagesQueryDto, ModerationReviewsQueryDto, OverrideBookingStatusDto, RefundRequestDto, RejectPayoutDto, ResolveDisputeDto, RejectTutorDto, ReportQueryDto, ReviewVerificationDto, SetMessageHiddenDto, SetReviewPublishedDto, SetHourlyRateDto, SuspendUserDto, VerificationQueueQueryDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    dashboard(user: AuthenticatedUser): Promise<Record<string, unknown> | null>;
    users(user: AuthenticatedUser, query: AdminUsersQueryDto): Promise<Record<string, unknown>[]>;
    suspend(user: AuthenticatedUser, id: string, dto: SuspendUserDto): Promise<{
        requestId: string;
    }>;
    verificationQueue(user: AuthenticatedUser, query: VerificationQueueQueryDto): Promise<Record<string, unknown>[]>;
    verificationDetail(user: AuthenticatedUser, tutorId: string): ReturnType<AdminService['verificationDetail']>;
    reviewStep(user: AuthenticatedUser, tutorId: string, stepId: string, dto: ReviewVerificationDto): Promise<void>;
    reviewDocument(user: AuthenticatedUser, documentId: string, dto: ReviewVerificationDto): Promise<void>;
    approve(user: AuthenticatedUser, tutorId: string, request: Request): Promise<void>;
    reject(user: AuthenticatedUser, tutorId: string, dto: RejectTutorDto, request: Request): Promise<void>;
    setHourlyRate(user: AuthenticatedUser, tutorId: string, dto: SetHourlyRateDto, request: Request): Promise<void>;
    bookings(user: AuthenticatedUser, query: AdminBookingsQueryDto): Promise<Record<string, unknown>[]>;
    overrideBookingStatus(user: AuthenticatedUser, id: string, dto: OverrideBookingStatusDto): Promise<void>;
    requestCancellation(user: AuthenticatedUser, id: string, dto: CancelBookingRequestDto): Promise<{
        requestId: string;
    }>;
    payments(user: AuthenticatedUser, query: AdminPaymentsQueryDto): Promise<Record<string, unknown>[]>;
    requestRefund(user: AuthenticatedUser, id: string, dto: RefundRequestDto): Promise<{
        requestId: string;
    }>;
    payouts(user: AuthenticatedUser, query: AdminPayoutsQueryDto): Promise<Record<string, unknown>[]>;
    requestSettlement(user: AuthenticatedUser, id: string): Promise<{
        requestId: string;
    }>;
    rejectPayout(user: AuthenticatedUser, id: string, dto: RejectPayoutDto): Promise<void>;
    disputes(user: AuthenticatedUser, query: AdminDisputesQueryDto): Promise<Record<string, unknown>[]>;
    resolveDispute(user: AuthenticatedUser, id: string, dto: ResolveDisputeDto, request: Request): Promise<void>;
    reviews(user: AuthenticatedUser, query: ModerationReviewsQueryDto): Promise<Record<string, unknown>[]>;
    setReviewPublished(user: AuthenticatedUser, id: string, dto: SetReviewPublishedDto): Promise<void>;
    messages(user: AuthenticatedUser, query: ModerationMessagesQueryDto): Promise<Record<string, unknown>[]>;
    setMessageHidden(user: AuthenticatedUser, id: string, dto: SetMessageHiddenDto): Promise<void>;
    report(user: AuthenticatedUser, query: ReportQueryDto): Promise<Record<string, unknown> | null>;
    agencies(user: AuthenticatedUser, query: AgencyQueueQueryDto): Promise<Record<string, unknown>[]>;
    agency(user: AuthenticatedUser, id: string): Promise<Record<string, unknown>>;
    reviewAgencyStep(user: AuthenticatedUser, agencyId: string, stepId: string, dto: ReviewVerificationDto): Promise<void>;
    decideAgency(user: AuthenticatedUser, id: string, dto: AgencyDecisionDto, request: Request): Promise<void>;
    setAgencyShare(user: AuthenticatedUser, id: string, dto: AgencyShareDto, request: Request): Promise<void>;
}
