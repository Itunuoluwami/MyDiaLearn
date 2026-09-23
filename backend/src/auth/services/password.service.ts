import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing and token minting.
 *
 * argon2id, at the OWASP-recommended parameters the library defaults to
 * (m=19456 KiB, t=2, p=1). Chosen over bcrypt because it is memory-hard, which
 * is what makes GPU cracking expensive rather than merely slow.
 */
@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    return hash(plain);
  }

  /**
   * Never throws. A malformed stored hash — a truncated column, a row written
   * by something else — would otherwise surface as a 500 on the login path and
   * tell an attacker the address exists.
   */
  async verify(storedHash: string | null, plain: string): Promise<boolean> {
    if (!storedHash) return false;
    try {
      return await verify(storedHash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Burns roughly the cost of a real verification.
   *
   * Called when no account matches, so that a missing address and a wrong
   * password take comparable time. Without it, login latency alone enumerates
   * registered emails.
   */
  async dummyVerify(): Promise<void> {
    await verify(
      '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$8kDMtKRrfPnSMTtWDNQb7ZcBDh1Tp5Rot1YNu+jVkEA',
      'not-a-real-password',
    ).catch(() => false);
  }

  /** URL-safe random token. 32 bytes, so guessing is not a strategy. */
  createToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Storage form for a bearer-style token.
   *
   * SHA-256 rather than argon2: these are already high-entropy random values,
   * so there is nothing to slow down a dictionary attack against, and refresh
   * happens often enough that a memory-hard hash would be a real cost.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Constant-time comparison, for anything compared outside the database. */
  safeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
