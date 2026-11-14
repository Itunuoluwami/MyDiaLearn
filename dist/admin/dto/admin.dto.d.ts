export declare const APP_ROLES: readonly ["student", "parent", "tutor", "agency", "admin", "super_admin"];
export declare const VERIFICATION_STATUSES: readonly ["unverified", "pending", "in_review", "verified", "rejected", "suspended"];
export declare class AdminUsersQueryDto {
    search?: string;
    role?: (typeof APP_ROLES)[number];
    from?: string;
    to?: string;
}
export declare class SuspendUserDto {
    isActive: boolean;
}
export declare class VerificationQueueQueryDto {
    status?: (typeof VERIFICATION_STATUSES)[number] | 'all';
}
export declare class ReviewVerificationDto {
    status: (typeof VERIFICATION_STATUSES)[number];
    reviewerNotes?: string;
}
export declare class RejectTutorDto {
    reason?: string;
}
export declare class SetHourlyRateDto {
    hourlyRate: number;
}
export declare const BOOKING_OVERRIDE_STATUSES: readonly ["pending", "confirmed", "in_progress", "completed", "no_show", "rejected"];
export declare const BOOKING_STATUSES: readonly ["pending", "confirmed", "in_progress", "completed", "no_show", "rejected", "cancelled"];
export declare const PAYMENT_STATUSES: readonly ["pending", "processing", "paid", "failed", "refunded", "partially_refunded"];
export declare const PAYOUT_STATUSES: readonly ["requested", "processing", "paid", "rejected", "cancelled"];
export declare const DISPUTE_STATUSES: readonly ["open", "investigating", "resolved", "dismissed"];
export declare class AdminBookingsQueryDto {
    search?: string;
    status?: (typeof BOOKING_STATUSES)[number] | 'all';
    from?: string;
    to?: string;
}
export declare class OverrideBookingStatusDto {
    status: (typeof BOOKING_OVERRIDE_STATUSES)[number];
}
export declare class CancelBookingRequestDto {
    reason: string;
    refundPercentage?: number;
}
export declare class AdminPaymentsQueryDto {
    status?: string;
    from?: string;
    to?: string;
}
export declare class RefundRequestDto {
    amount: number;
    reason?: string;
}
export declare class AdminPayoutsQueryDto {
    status?: string;
}
export declare class RejectPayoutDto {
    notes?: string;
}
export declare class AdminDisputesQueryDto {
    status?: string;
}
export declare class ResolveDisputeDto {
    status: (typeof DISPUTE_STATUSES)[number];
    notes?: string;
}
export declare class ModerationReviewsQueryDto {
    published?: 'true' | 'false';
}
export declare class SetReviewPublishedDto {
    isPublished: boolean;
}
export declare class ModerationMessagesQueryDto {
    search: string;
}
export declare class SetMessageHiddenDto {
    isHidden: boolean;
    reason?: string;
}
export declare class ReportQueryDto {
    from: string;
    to: string;
}
export declare class AgencyQueueQueryDto {
    status?: string;
}
export declare class AgencyDecisionDto {
    status: 'verified' | 'rejected' | 'suspended';
    reason?: string;
}
export declare class AgencyShareDto {
    revenueSharePercentage: number;
}
