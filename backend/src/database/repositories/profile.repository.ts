import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';

/**
 * Domain shape, deliberately camelCase.
 *
 * The Prisma models are introspected from the live database, so they carry its
 * snake_case names. Translating at the repository boundary keeps that spelling
 * out of services and controllers, and means a column rename does not ripple
 * through the application.
 */
export interface ProfileRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  primaryRole: string;
  isActive: boolean;
  mustChangePassword: boolean;
}

const SELECT = {
  id: true,
  email: true,
  full_name: true,
  primary_role: true,
  is_active: true,
  must_change_password: true,
} as const;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  primary_role: string;
  is_active: boolean;
  must_change_password: boolean;
};

function toRecord(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    primaryRole: row.primary_role,
    isActive: row.is_active,
    mustChangePassword: row.must_change_password,
  };
}

/**
 * Reference implementation of the repository pattern.
 *
 * Read-only for now: writes to profiles still belong to Supabase until
 * authentication moves in Phase 2, per migration rule 7.
 */
@Injectable()
export class ProfileRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    const row = await this.prisma.profiles.findUnique({ where: { id }, select: SELECT });
    return row ? toRecord(row as ProfileRow) : null;
  }

  async findByEmail(email: string): Promise<ProfileRecord | null> {
    const row = await this.prisma.profiles.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: SELECT,
    });
    return row ? toRecord(row as ProfileRow) : null;
  }

  /** Every role granted to an account, for building access-token claims. */
  async findRoles(userId: string): Promise<string[]> {
    const rows = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
      select: { role: true },
    });
    return rows.map((row: { role: string }) => row.role);
  }
}
