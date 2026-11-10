import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  family_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  revoked_reason: string | null;
}

/**
 * Refresh tokens, stored as SHA-256 hashes.
 *
 * A leaked database must not hand an attacker usable sessions, and the raw
 * token is never needed again after it is issued — so only the hash is kept,
 * exactly as with a password.
 */
@Injectable()
export class RefreshTokenRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    userAgent?: string;
    ip?: string;
  }): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      insert into auth.refresh_tokens (user_id, token_hash, family_id, expires_at, user_agent, ip)
      values (${input.userId}::uuid, ${input.tokenHash}, ${input.familyId}::uuid,
              ${input.expiresAt}, ${input.userAgent ?? null}, ${input.ip ?? null})
      returning id
    `;
    return rows[0]!;
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const rows = await this.prisma.$queryRaw<RefreshTokenRow[]>`
      select id, user_id, family_id, expires_at, revoked_at, revoked_reason
      from auth.refresh_tokens
      where token_hash = ${tokenHash}
      limit 1
    `;
    return rows[0] ?? null;
  }

  async revoke(id: string, reason: string, replacedBy?: string): Promise<void> {
    await this.prisma.$executeRaw`
      update auth.refresh_tokens
      set revoked_at = coalesce(revoked_at, now()),
          revoked_reason = coalesce(revoked_reason, ${reason}),
          replaced_by = coalesce(replaced_by, ${replacedBy ?? null}::uuid)
      where id = ${id}::uuid
    `;
  }

  /**
   * Kills an entire rotation family.
   *
   * Called when a revoked token is presented again, which means it was
   * captured and replayed. The legitimate holder is logged out too — that is
   * the intended outcome, because there is no way to tell which of the two
   * presenters is the real one.
   */
  async revokeFamily(familyId: string, reason: string): Promise<number> {
    return this.prisma.$executeRaw`
      update auth.refresh_tokens
      set revoked_at = now(), revoked_reason = ${reason}
      where family_id = ${familyId}::uuid and revoked_at is null
    `;
  }

  async revokeAllForUser(userId: string, reason: string): Promise<number> {
    return this.prisma.$executeRaw`
      update auth.refresh_tokens
      set revoked_at = now(), revoked_reason = ${reason}
      where user_id = ${userId}::uuid and revoked_at is null
    `;
  }

  /** Housekeeping. Expired rows carry no authority but should not accumulate. */
  async deleteExpired(): Promise<number> {
    return this.prisma.$executeRaw`
      delete from auth.refresh_tokens
      where expires_at < now() - interval '30 days'
    `;
  }
}
