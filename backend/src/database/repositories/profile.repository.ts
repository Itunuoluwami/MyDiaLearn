import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';

export interface ProfileRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  primaryRole: string;
  isActive: boolean;
  mustChangePassword: boolean;
}

/**
 * Reference implementation of the repository pattern.
 *
 * Profiles and roles are the first thing Phase 2 needs, so this is the one
 * domain modelled during the foundation phase. It is read-only on purpose:
 * writes to profiles still go through Supabase until authentication moves.
 */
@Injectable()
export class ProfileRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    const row = await this.prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        primaryRole: true,
        isActive: true,
        mustChangePassword: true,
      },
    });
    return row ?? null;
  }

  async findByEmail(email: string): Promise<ProfileRecord | null> {
    const row = await this.prisma.profile.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        fullName: true,
        primaryRole: true,
        isActive: true,
        mustChangePassword: true,
      },
    });
    return row ?? null;
  }

  /** Every role granted to an account, for building the access token claims. */
  async findRoles(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    return rows.map((row) => row.role);
  }
}
