import type { Request } from 'express';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ActionRequestsQueryDto, AuditLogQueryDto, CreateActionRequestDto, CreateInvitationDto, ElevatedRoleRequestDto, RedeemInvitationDto, ReviewActionRequestDto, SetUserPermissionDto } from './governance.dto';
import { GovernanceService } from './governance.service';
type Row = Record<string, unknown>;
export declare class GovernanceController {
    private readonly governance;
    constructor(governance: GovernanceService);
    accounts(user: AuthenticatedUser): Promise<Row[]>;
    invitations(user: AuthenticatedUser): Promise<Row[]>;
    invite(user: AuthenticatedUser, dto: CreateInvitationDto, request: Request): ReturnType<GovernanceService['invite']>;
    revoke(user: AuthenticatedUser, id: string, request: Request): Promise<void>;
    permissionCatalog(user: AuthenticatedUser): Promise<Row[]>;
    userPermissions(user: AuthenticatedUser, id: string): Promise<Row[]>;
    setUserPermission(user: AuthenticatedUser, id: string, key: string, dto: SetUserPermissionDto, request: Request): Promise<void>;
    requestElevatedRole(user: AuthenticatedUser, id: string, dto: ElevatedRoleRequestDto): Promise<{
        requestId: string;
    }>;
    requests(user: AuthenticatedUser, query: ActionRequestsQueryDto): Promise<Row[]>;
    createRequest(user: AuthenticatedUser, dto: CreateActionRequestDto): Promise<{
        requestId: string;
    }>;
    review(user: AuthenticatedUser, id: string, dto: ReviewActionRequestDto, request: Request): Promise<Row>;
    auditLogs(user: AuthenticatedUser, query: AuditLogQueryDto): Promise<Row[]>;
}
export declare class InvitationsController {
    private readonly governance;
    constructor(governance: GovernanceService);
    redeem(user: AuthenticatedUser, dto: RedeemInvitationDto): Promise<void>;
}
export {};
