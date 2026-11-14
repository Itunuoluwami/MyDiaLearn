import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';
type Row = Record<string, unknown>;
export declare class GovernanceRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    adminAccounts(adminId: string): Promise<Row[]>;
    invitations(adminId: string): Promise<Row[]>;
    createInvitation(adminId: string, input: {
        email: string;
        role: string;
        permissionKeys: string[];
    }): Promise<{
        invitation_id: string;
        otp: string;
        expires_at: Date;
    }>;
    revokeInvitation(adminId: string, invitationId: string): Promise<void>;
    redeemInvitation(userId: string, email: string, otp: string): Promise<void>;
    permissionCatalog(adminId: string): Promise<Row[]>;
    userPermissions(adminId: string, userId: string): Promise<Row[]>;
    setUserPermission(adminId: string, userId: string, key: string, granted: boolean | null): Promise<void>;
    requestAction(adminId: string, action: string, payload: object): Promise<string>;
    actionRequests(adminId: string, status: string): Promise<Row[]>;
    reviewAction(adminId: string, requestId: string, approve: boolean, notes: string | null): Promise<Row>;
    auditLogs(adminId: string, filters: {
        action: string | null;
        entityType: string | null;
        actorEmail: string | null;
        from: Date | null;
        to: Date | null;
    }): Promise<Row[]>;
}
export {};
