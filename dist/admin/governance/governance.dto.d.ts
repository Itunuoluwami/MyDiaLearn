export declare const REQUEST_ACTIONS: readonly ["payment.refund", "booking.cancel_with_refund", "payout.settle", "user_roles.grant_elevated", "profile.suspend"];
export declare const REQUEST_STATUSES: readonly ["pending", "approved", "rejected", "executed", "failed"];
export declare class CreateInvitationDto {
    email: string;
    role: 'admin' | 'super_admin';
    permissionKeys: string[];
}
export declare class RedeemInvitationDto {
    email: string;
    otp: string;
}
export declare class SetUserPermissionDto {
    granted: boolean | null;
}
export declare class ElevatedRoleRequestDto {
    role: 'admin' | 'super_admin';
    revoke?: boolean;
}
export declare class ActionRequestsQueryDto {
    status?: string;
}
export declare class CreateActionRequestDto {
    action: (typeof REQUEST_ACTIONS)[number];
    payload: Record<string, unknown>;
}
export declare class ReviewActionRequestDto {
    approve: boolean;
    notes?: string;
}
export declare class AuditLogQueryDto {
    action?: string;
    entityType?: string;
    actorEmail?: string;
    from?: string;
    to?: string;
}
