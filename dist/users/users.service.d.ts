import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { CurrentUserResponse, UpdateProfileDto, UserProfileResponse } from './dto/user.dto';
import { UsersRepository, type ProfileRow } from './users.repository';
export declare class UsersService {
    private readonly repository;
    private readonly audit;
    constructor(repository: UsersRepository, audit: AuditService);
    me(userId: string): Promise<CurrentUserResponse>;
    permissionCatalog(userId: string): Promise<Record<string, unknown>[]>;
    findOne(callerId: string, id: string): Promise<UserProfileResponse>;
    updateOwn(userId: string, dto: UpdateProfileDto, context: AuditContext): Promise<UserProfileResponse>;
    search(callerId: string, query: PaginationQueryDto & {
        q?: string;
        role?: string;
        isActive?: boolean;
    }): Promise<Paginated<UserProfileResponse>>;
    setRoles(adminId: string, userId: string, roles: string[], context: AuditContext): Promise<{
        roles: string[];
    }>;
    setPermission(adminId: string, userId: string, permissionKey: string, granted: boolean, context: AuditContext): Promise<void>;
    roles(callerId: string, userId: string): Promise<string[]>;
}
export declare function toResponse(row: ProfileRow): UserProfileResponse;
