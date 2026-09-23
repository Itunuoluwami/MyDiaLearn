import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';

export interface AuthUserRow {
  id: string;
  email: string | null;
  encrypted_password: string | null;
  email_confirmed_at: Date | null;
  failed_login_count: number;
  locked_until: Date | null;
  last_sign_in_at: Date | null;
  password_changed_at: Date | null;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  /**
   * Read by the handle_new_user() trigger to build the profile and role rows.
   * Keys must match what it looks for: full_name, phone, country_code,
   * timezone, role.
   */
  metadata: Record<string, unknown>;
  emailConfirmed: boolean;
}

/**
 * Accounts in auth.users.
 *
 * Inserting here fires the on_auth_user_created trigger, which calls
 * handle_new_user() to create the matching profiles and user_roles rows. That
 * is deliberate rather than incidental: signup behaviour — including the rule
 * that nobody can grant themselves an admin role at registration — stays
 * exactly where it already lived and does not have to be reimplemented.
 */
@Injectable()
export class UserRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<AuthUserRow | null> {
    const rows = await this.prisma.$queryRaw<AuthUserRow[]>`
      select id, email, encrypted_password, email_confirmed_at,
             failed_login_count, locked_until, last_sign_in_at, password_changed_at
      from auth.users
      where lower(email) = lower(${email})
      limit 1
    `;
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<AuthUserRow | null> {
    const rows = await this.prisma.$queryRaw<AuthUserRow[]>`
      select id, email, encrypted_password, email_confirmed_at,
             failed_login_count, locked_until, last_sign_in_at, password_changed_at
      from auth.users
      where id = ${id}::uuid
      limit 1
    `;
    return rows[0] ?? null;
  }

  async create(input: CreateUserInput): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      insert into auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
      values (
        ${input.email},
        ${input.passwordHash},
        ${JSON.stringify(input.metadata)}::jsonb,
        ${input.emailConfirmed ? new Date() : null}
      )
      returning id
    `;
    return rows[0]!;
  }

  async setPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.$executeRaw`
      update auth.users
      set encrypted_password = ${passwordHash},
          password_changed_at = now(),
          updated_at = now(),
          failed_login_count = 0,
          locked_until = null
      where id = ${userId}::uuid
    `;
  }

  async markEmailConfirmed(userId: string): Promise<void> {
    await this.prisma.$executeRaw`
      update auth.users
      set email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
      where id = ${userId}::uuid
    `;
  }

  async recordSuccessfulLogin(userId: string): Promise<void> {
    await this.prisma.$executeRaw`
      update auth.users
      set last_sign_in_at = now(), failed_login_count = 0, locked_until = null
      where id = ${userId}::uuid
    `;
  }

  /**
   * Counts a failed attempt and locks the account once the threshold is
   * reached. Returns the new count so the caller can audit it — but the caller
   * must not tell the user, since "your account is locked" confirms the
   * address exists.
   */
  async recordFailedLogin(
    userId: string,
    threshold: number,
    lockMinutes: number,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ failed_login_count: number }[]>`
      update auth.users
      set failed_login_count = failed_login_count + 1,
          locked_until = case
            when failed_login_count + 1 >= ${threshold}
            then now() + make_interval(mins => ${lockMinutes})
            else locked_until
          end
      where id = ${userId}::uuid
      returning failed_login_count
    `;
    return rows[0]?.failed_login_count ?? 0;
  }

  /**
   * Roles and resolved permissions, for building token claims.
   *
   * Calls the existing my_permissions() rather than reimplementing it. That
   * function already encodes the whole rule — role grants, per-user overrides,
   * explicit denials beating grants, and super_admin implicitly holding every
   * permission — and a second copy in TypeScript would drift from it without
   * anyone noticing. Migration rule 10 applies: the existing behaviour is the
   * specification.
   *
   * my_permissions() reads auth.uid(), so the caller has to be established
   * first. SET LOCAL request.jwt.claims does that for the transaction only,
   * which is the same mechanism the compatibility layer gives the 123 RLS
   * policies.
   */
  async findAuthorization(userId: string): Promise<{
    roles: string[];
    permissions: string[];
    primaryRole: string | null;
    mustChangePassword: boolean;
    fullName: string | null;
  }> {
    const claims = JSON.stringify({ sub: userId, role: 'authenticated' });

    const [, rows] = await this.prisma.$transaction([
      this.prisma.$executeRaw`select set_config('request.jwt.claims', ${claims}, true)`,
      this.prisma.$queryRaw<
        {
          roles: string[] | null;
          permissions: string[] | null;
          primary_role: string | null;
          must_change_password: boolean | null;
          full_name: string | null;
        }[]
      >`
        select
          (select array_agg(ur.role::text order by ur.role::text)
             from public.user_roles ur where ur.user_id = ${userId}::uuid) as roles,
          public.my_permissions() as permissions,
          p.primary_role::text as primary_role,
          p.must_change_password,
          p.full_name
        from public.profiles p
        where p.id = ${userId}::uuid
      `,
    ]);

    const row = rows[0];
    return {
      roles: row?.roles ?? [],
      permissions: row?.permissions ?? [],
      primaryRole: row?.primary_role ?? null,
      mustChangePassword: row?.must_change_password ?? false,
      fullName: row?.full_name ?? null,
    };
  }
}
