import { Injectable } from '@nestjs/common';

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
}

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(callerId: string, id: string): Promise<ProfileRow | null> {
    return this.prisma.withUser(callerId, async (tx) => {
      const rows = await tx.$queryRaw<ProfileRow[]>`
        select id, email, full_name, phone, avatar_url, country_code, timezone,
               preferred_currency, primary_role::text, onboarding_completed,
               is_active, must_change_password, created_at, updated_at
        from public.profiles where id = ${id}::uuid
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * Partial update of the caller's own profile.
   *
   * COALESCE on every column so an omitted field is left alone rather than
   * nulled — a PATCH that silently blanks a phone number because the client
   * did not send one is a data-loss bug, not a convenience.
   *
   * The profiles_update RLS policy restricts this to the owner, and column
   * grants prevent a user touching role or verification columns at all.
   */
  async updateOwn(userId: string, input: UpdateProfileInput): Promise<ProfileRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<ProfileRow[]>`
        update public.profiles set
          full_name          = coalesce(${input.fullName ?? null}, full_name),
          phone              = coalesce(${input.phone ?? null}, phone),
          country_code       = coalesce(${input.countryCode ?? null}, country_code),
          timezone           = coalesce(${input.timezone ?? null}, timezone),
          preferred_currency = coalesce(${input.preferredCurrency ?? null}, preferred_currency),
          avatar_url         = coalesce(${input.avatarUrl ?? null}, avatar_url),
          updated_at         = now()
        where id = ${userId}::uuid
        returning id, email, full_name, phone, avatar_url, country_code, timezone,
                  preferred_currency, primary_role::text, onboarding_completed,
                  is_active, must_change_password, created_at, updated_at
      `;
      return rows[0] ?? null;
    });
  }

  async findRoles(callerId: string, userId: string): Promise<string[]> {
    return this.prisma.withUser(callerId, async (tx) => {
      const rows = await tx.$queryRaw<{ role: string }[]>`
        select role::text from public.user_roles where user_id = ${userId}::uuid order by role::text
      `;
      return rows.map((r) => r.role);
    });
  }

  /** The caller's effective permissions, via my_permissions(). */
  async findPermissions(userId: string): Promise<string[]> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ p: string[] | null }[]>`
        select public.my_permissions() as p
      `;
      return rows[0]?.p ?? [];
    });
  }

  /** Admin directory. RLS restricts this to admins. */
  async search(
    callerId: string,
    query: PaginationQueryDto,
    filters: {
      q?: string | undefined;
      role?: string | undefined;
      isActive?: boolean | undefined;
    },
  ): Promise<{ rows: ProfileRow[]; total: number }> {
    const like = filters.q ? `%${filters.q}%` : null;
    return this.prisma.withUser(callerId, async (tx) => {
      const rows = await tx.$queryRaw<ProfileRow[]>`
        select p.id, p.email, p.full_name, p.phone, p.avatar_url, p.country_code, p.timezone,
               p.preferred_currency, p.primary_role::text, p.onboarding_completed,
               p.is_active, p.must_change_password, p.created_at, p.updated_at
        from public.profiles p
        where (${like}::text is null or p.full_name ilike ${like} or p.email ilike ${like})
          and (${filters.role ?? null}::text is null
               or exists (select 1 from public.user_roles ur
                          where ur.user_id = p.id and ur.role::text = ${filters.role ?? null}))
          and (${filters.isActive ?? null}::boolean is null or p.is_active = ${filters.isActive ?? null})
        order by p.created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.profiles p
        where (${like}::text is null or p.full_name ilike ${like} or p.email ilike ${like})
          and (${filters.role ?? null}::text is null
               or exists (select 1 from public.user_roles ur
                          where ur.user_id = p.id and ur.role::text = ${filters.role ?? null}))
          and (${filters.isActive ?? null}::boolean is null or p.is_active = ${filters.isActive ?? null})
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  /** Role assignment, via admin_set_user_roles(). Super-admin gated there. */
  async setRoles(adminId: string, userId: string, roles: string[]): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        select public.admin_set_user_roles(${userId}::uuid, ${roles}::app_role[])
      `;
    });
  }

  async setPermission(
    adminId: string,
    userId: string,
    permissionKey: string,
    granted: boolean,
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        select public.admin_set_user_permission(${userId}::uuid, ${permissionKey}, ${granted})
      `;
    });
  }
}
