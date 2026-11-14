import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export interface ProfileRow {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    country_code: string | null;
    timezone: string;
    preferred_currency: string;
    primary_role: string;
    onboarding_completed: boolean;
    is_active: boolean;
    must_change_password: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface UpdateProfileInput {
    fullName?: string | undefined;
    phone?: string | undefined;
    countryCode?: string | undefined;
    timezone?: string | undefined;
    preferredCurrency?: string | undefined;
    avatarUrl?: string | undefined;
    onboardingCompleted?: boolean | undefined;
}
export declare class UsersRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(callerId: string, id: string): Promise<ProfileRow | null>;
    updateOwn(userId: string, input: UpdateProfileInput): Promise<ProfileRow | null>;
    permissionCatalog(userId: string): Promise<Record<string, unknown>[]>;
    findRoles(callerId: string, userId: string): Promise<string[]>;
    findPermissions(userId: string): Promise<string[]>;
    search(callerId: string, query: PaginationQueryDto, filters: {
        q?: string | undefined;
        role?: string | undefined;
        isActive?: boolean | undefined;
    }): Promise<{
        rows: ProfileRow[];
        total: number;
    }>;
    setRoles(adminId: string, userId: string, roles: string[]): Promise<void>;
    setPermission(adminId: string, userId: string, permissionKey: string, granted: boolean): Promise<void>;
}
