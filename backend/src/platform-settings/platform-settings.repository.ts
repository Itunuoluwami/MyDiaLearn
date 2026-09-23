import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

export interface PlatformSettingRow {
  key: string;
  value: unknown;
  label: string | null;
  description: string | null;
  group_name: string | null;
  is_public: boolean;
}

@Injectable()
export class PlatformSettingsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(): Promise<PlatformSettingRow[]> {
    return this.prisma.$queryRaw<PlatformSettingRow[]>`
      select key, value, label, description, group_name, is_public
      from public.platform_settings
      order by group_name nulls last, key
    `;
  }

  /** Only settings flagged public. Used by unauthenticated surfaces. */
  async findPublic(): Promise<PlatformSettingRow[]> {
    return this.prisma.$queryRaw<PlatformSettingRow[]>`
      select key, value, label, description, group_name, is_public
      from public.platform_settings
      where is_public
      order by key
    `;
  }

  /** Writes go through an admin, so the caller's claims must be set. */
  async update(
    actorId: string,
    key: string,
    value: unknown,
  ): Promise<PlatformSettingRow | null> {
    return this.prisma.withUser(actorId, async (tx) => {
      const rows = await tx.$queryRaw<PlatformSettingRow[]>`
        update public.platform_settings
        set value = ${JSON.stringify(value)}::jsonb, updated_by = ${actorId}::uuid, updated_at = now()
        where key = ${key}
        returning key, value, label, description, group_name, is_public
      `;
      return rows[0] ?? null;
    });
  }
}
