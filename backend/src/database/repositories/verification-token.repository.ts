import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';

export type VerificationPurpose = 'email_verification' | 'password_reset';

export interface VerificationTokenRow {
  id: string;
  user_id: string;
  purpose: VerificationPurpose;
  expires_at: Date;
  consumed_at: Date | null;
}

/**
 * Single-use, short-lived, hashed tokens for email verification and password
 * reset. One table for both: the mechanics are identical, and the only part
 * worth getting right — consume atomically, exactly once — should exist once.
 */
@Injectable()
export class VerificationTokenRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(input: {
    userId: string;
    purpose: VerificationPurpose;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    // Outstanding tokens for the same purpose are invalidated first, so
    // requesting a new reset link immediately retires the previous one.
    await this.prisma.$executeRaw`
      update auth.verification_tokens
      set consumed_at = now()
      where user_id = ${input.userId}::uuid
        and purpose = ${input.purpose}::auth.verification_purpose
        and consumed_at is null
    `;
    await this.prisma.$executeRaw`
      insert into auth.verification_tokens (user_id, purpose, token_hash, expires_at)
      values (${input.userId}::uuid, ${input.purpose}::auth.verification_purpose,
              ${input.tokenHash}, ${input.expiresAt})
    `;
  }

  /**
   * Consumes a token if and only if it is unused and unexpired.
   *
   * The check and the write are one statement so two concurrent requests
   * cannot both succeed — a reset link that works twice is a reset link an
   * attacker can replay.
   */
  async consume(
    tokenHash: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationTokenRow | null> {
    const rows = await this.prisma.$queryRaw<VerificationTokenRow[]>`
      update auth.verification_tokens
      set consumed_at = now()
      where token_hash = ${tokenHash}
        and purpose = ${purpose}::auth.verification_purpose
        and consumed_at is null
        and expires_at > now()
      returning id, user_id, purpose, expires_at, consumed_at
    `;
    return rows[0] ?? null;
  }
}
