import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { type AuthConfig } from '../../config/configuration';
import { EmailService } from '../../integrations/email/email.service';
import { PaymentProcessingService } from '../../payments/services/payment-processing.service';
import { GovernanceRepository } from './governance.repository';
type Row = Record<string, unknown>;
export declare class GovernanceService {
    private readonly repository;
    private readonly email;
    private readonly audit;
    private readonly payments;
    private readonly config;
    private readonly logger;
    constructor(repository: GovernanceRepository, email: EmailService, audit: AuditService, payments: PaymentProcessingService, config: AuthConfig);
    adminAccounts(adminId: string): Promise<Row[]>;
    invitations(adminId: string): Promise<Row[]>;
    invite(adminId: string, input: {
        email: string;
        role: 'admin' | 'super_admin';
        permissionKeys: string[];
    }, context: AuditContext): Promise<{
        invitationId: string;
        emailed: boolean;
        expiresAt: string;
        otp?: string;
    }>;
    revokeInvitation(adminId: string, invitationId: string, context: AuditContext): Promise<void>;
    redeemInvitation(userId: string, email: string, otp: string): Promise<void>;
    permissionCatalog(adminId: string): Promise<Row[]>;
    userPermissions(adminId: string, userId: string): Promise<Row[]>;
    setUserPermission(adminId: string, userId: string, key: string, granted: boolean | null, context: AuditContext): Promise<void>;
    requestAction(adminId: string, action: string, payload: Record<string, unknown>): Promise<{
        requestId: string;
    }>;
    actionRequests(adminId: string, status: string): Promise<Row[]>;
    reviewAction(adminId: string, requestId: string, input: {
        approve: boolean;
        notes?: string | undefined;
    }, context: AuditContext): Promise<Row>;
    auditLogs(adminId: string, query: {
        action?: string | undefined;
        entityType?: string | undefined;
        actorEmail?: string | undefined;
        from?: string | undefined;
        to?: string | undefined;
    }): Promise<Row[]>;
    private call;
}
export {};
