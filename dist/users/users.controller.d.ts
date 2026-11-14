import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { SearchUsersQueryDto, SetPermissionDto, SetRolesDto, UpdateProfileDto, type CurrentUserResponse, type UserProfileResponse } from './dto/user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(user: AuthenticatedUser): Promise<CurrentUserResponse>;
    updateMe(user: AuthenticatedUser, dto: UpdateProfileDto, request: Request): Promise<UserProfileResponse>;
    search(user: AuthenticatedUser, query: SearchUsersQueryDto): Promise<Paginated<UserProfileResponse>>;
    permissionCatalog(user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<UserProfileResponse>;
    roles(user: AuthenticatedUser, id: string): Promise<{
        roles: string[];
    }>;
    setRoles(user: AuthenticatedUser, id: string, dto: SetRolesDto, request: Request): Promise<{
        roles: string[];
    }>;
    setPermission(user: AuthenticatedUser, id: string, dto: SetPermissionDto, request: Request): Promise<void>;
}
