import { PaginationQueryDto } from '../../shared/query.dto';
export declare class UpdateProfileDto {
    fullName?: string;
    phone?: string;
    countryCode?: string;
    timezone?: string;
    preferredCurrency?: string;
    avatarUrl?: string;
    onboardingCompleted?: boolean;
}
export declare class SearchUsersQueryDto extends PaginationQueryDto {
    q?: string;
    role?: string;
    isActive?: boolean;
}
export declare class SetRolesDto {
    roles: string[];
}
export declare class SetPermissionDto {
    permissionKey: string;
    granted: boolean;
}
export interface UserProfileResponse {
    id: string;
    email: string | null;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    countryCode: string | null;
    timezone: string;
    preferredCurrency: string;
    primaryRole: string;
    onboardingCompleted: boolean;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: string;
}
export interface CurrentUserResponse extends UserProfileResponse {
    roles: string[];
    permissions: string[];
}
