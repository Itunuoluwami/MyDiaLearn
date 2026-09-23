import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotFoundError } from '../common/exceptions/app.exception';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type {
  CurrentUserResponse,
  UpdateProfileDto,
  UserProfileResponse,
} from './dto/user.dto';
import { UsersRepository, type ProfileRow } from './users.repository';

/**
 * Profiles, roles and permissions.
 *
 * This is the module that closes the gap keeping Supabase the default auth
 * provider: with it, `use-auth` can populate `profile` from the API rather than
 * reading Supabase for an account that only exists in DiaLearn's database.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  /** The caller's own profile, roles and effective permissions. */
  async me(userId: string): Promise<CurrentUserResponse> {
    const [profile, roles, permissions] = await Promise.all([
      this.repository.findById(userId, userId),
      this.repository.findRoles(userId, userId),
      this.repository.findPermissions(userId),
    ]);
    if (!profile) throw new NotFoundError('Profile');
    return { ...toResponse(profile), roles, permissions };
  }

  async findOne(callerId: string, id: string): Promise<UserProfileResponse> {
    const profile = await this.repository.findById(callerId, id);
    // RLS decides visibility, so an invisible profile is indistinguishable
    // from a missing one — which is the correct answer to give.
    if (!profile) throw new NotFoundError('Profile');
    return toResponse(profile);
  }

  async updateOwn(
    userId: string,
    dto: UpdateProfileDto,
    context: AuditContext,
  ): Promise<UserProfileResponse> {
    const before = await this.repository.findById(userId, userId);
    if (!before) throw new NotFoundError('Profile');

    const updated = await this.repository.updateOwn(userId, dto);
    if (!updated) throw new NotFoundError('Profile');

    await this.audit.record('user.profile_updated', {
      actorId: userId,
      actorEmail: updated.email,
      entityType: 'profile',
      entityId: userId,
      context,
      // Field names only. The values are the user's own PII and add nothing
      // to an audit trail that already identifies who changed what and when.
      metadata: { fields: Object.keys(dto) },
    });

    return toResponse(updated);
  }

  async search(
    callerId: string,
    query: PaginationQueryDto & { q?: string; role?: string; isActive?: boolean },
  ): Promise<Paginated<UserProfileResponse>> {
    const { rows, total } = await this.repository.search(callerId, query, {
      q: query.q,
      role: query.role,
      isActive: query.isActive,
    });
    return paginate(rows.map(toResponse), total, query);
  }

  async setRoles(
    adminId: string,
    userId: string,
    roles: string[],
    context: AuditContext,
  ): Promise<{ roles: string[] }> {
    const before = await this.repository.findRoles(adminId, userId);
    await this.repository.setRoles(adminId, userId, roles);
    const after = await this.repository.findRoles(adminId, userId);

    // A role change is one of the five maker-checker actions and among the
    // most security-relevant events in the system, so both sides are recorded.
    await this.audit.record('user.roles_changed', {
      actorId: adminId,
      entityType: 'profile',
      entityId: userId,
      before: { roles: before },
      after: { roles: after },
      context,
    });

    return { roles: after };
  }

  async setPermission(
    adminId: string,
    userId: string,
    permissionKey: string,
    granted: boolean,
    context: AuditContext,
  ): Promise<void> {
    await this.repository.setPermission(adminId, userId, permissionKey, granted);
    await this.audit.record('user.permission_changed', {
      actorId: adminId,
      entityType: 'profile',
      entityId: userId,
      context,
      metadata: { permissionKey, granted },
    });
  }

  async roles(callerId: string, userId: string): Promise<string[]> {
    return this.repository.findRoles(callerId, userId);
  }
}

export function toResponse(row: ProfileRow): UserProfileResponse {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    countryCode: row.country_code,
    timezone: row.timezone,
    preferredCurrency: row.preferred_currency,
    primaryRole: row.primary_role,
    onboardingCompleted: row.onboarding_completed,
    isActive: row.is_active,
    mustChangePassword: row.must_change_password,
    createdAt: row.created_at.toISOString(),
  };
}
