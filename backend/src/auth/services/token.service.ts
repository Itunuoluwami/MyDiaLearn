import { Inject, Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

import { jwtConfig, type JwtConfig } from '../../config/configuration';
import { RefreshTokenRepository } from '../../database/repositories/refresh-token.repository';
import { UnauthenticatedError } from '../../common/exceptions/app.exception';
import type { AppRole } from '../../common/decorators/roles.decorator';
import type {
  AccessTokenClaims,
  AuthUser,
  IssuedTokens,
  RefreshTokenClaims,
  RequestContext,
} from '../interfaces/auth.interface';
import { PasswordService } from './password.service';

/** Outcome of presenting a refresh token. */
export type RefreshOutcome =
  | { kind: 'ok'; userId: string; familyId: string; rotatedFrom: string }
  | { kind: 'invalid' }
  | { kind: 'reuse'; userId: string; familyId: string }
  /** A spent token replayed inside the rotation grace window. See below. */
  | { kind: 'concurrent'; userId: string; familyId: string };

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
    private readonly refreshTokens: RefreshTokenRepository,
    @Inject(jwtConfig.KEY) private readonly config: JwtConfig,
  ) {}

  /**
   * Issues an access/refresh pair.
   *
   * `familyId` continues an existing rotation chain; omitting it starts a new
   * one, which is what a fresh login does.
   */
  async issue(
    user: AuthUser,
    context: RequestContext,
    familyId?: string,
  ): Promise<IssuedTokens> {
    const accessToken = await this.signAccessToken(user);
    const decoded = this.jwt.decode<AccessTokenClaims>(accessToken);
    const expiresAt = decoded?.exp ?? Math.floor(Date.now() / 1000) + 900;

    const family = familyId ?? randomUUID();
    const jti = randomUUID();
    const refreshToken = this.passwords.createToken();
    const refreshExpiresAt = this.refreshExpiry();

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.passwords.hashToken(refreshToken),
      familyId: family,
      expiresAt: refreshExpiresAt,
      ...(context.userAgent !== undefined && { userAgent: context.userAgent }),
      ...(context.ip !== undefined && { ip: context.ip }),
    });

    void jti;

    return {
      session: {
        accessToken,
        expiresIn: Math.max(0, expiresAt - Math.floor(Date.now() / 1000)),
        expiresAt,
        tokenType: 'bearer',
        user,
      },
      refreshToken,
      refreshExpiresAt,
    };
  }

  private async signAccessToken(user: AuthUser): Promise<string> {
    const claims: AccessTokenClaims = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      ...(user.mustChangePassword ? { mcp: true } : {}),
    };
    return this.jwt.signAsync(claims, {
      secret: this.config.secret,
      expiresIn: this.config.accessExpiresIn,
    } as JwtSignOptions);
  }

  /**
   * Validates a presented refresh token and, on success, revokes it.
   *
   * Four outcomes matter and are distinguished for the caller:
   *  - `ok`         the token was live; it is now spent and a new one may be issued
   *  - `concurrent` a token this rotation chain spent moments ago (see below)
   *  - `reuse`      the token was already revoked, which means it was replayed
   *  - `invalid`    unknown or expired
   *
   * `reuse` is the interesting one. A refresh token is single-use, so seeing
   * one twice means a copy exists somewhere it should not. There is no way to
   * tell the attacker from the legitimate holder, so the whole family dies.
   *
   * That rule is right for a replay minutes or days later and wrong for one
   * milliseconds later, because rotation has an unavoidable race: the client
   * sends the old cookie, the server rotates, and the replacement `Set-Cookie`
   * is still in flight. Anything that starts a second refresh in that window —
   * a second browser tab, or a full page navigation that tears down the first
   * document before its response lands — presents the token that was just
   * spent. Treating that as theft logs the user out at random, which is what
   * it did.
   *
   * So a token revoked as `rotated` within GRACE_MS is reported as
   * `concurrent`: the family survives and the caller may mint a fresh token in
   * it. The window is deliberately small, and it only forgives the single most
   * recent rotation. A replay after it, or of any token revoked for another
   * reason, still kills the family.
   */
  private static readonly GRACE_MS = 20_000;
  async redeemRefreshToken(presented: string): Promise<RefreshOutcome> {
    const hash = this.passwords.hashToken(presented);
    const row = await this.refreshTokens.findByHash(hash);

    if (!row) return { kind: 'invalid' };

    if (row.revoked_at) {
      const spentMsAgo = Date.now() - row.revoked_at.getTime();
      if (row.revoked_reason === 'rotated' && spentMsAgo <= TokenService.GRACE_MS) {
        return { kind: 'concurrent', userId: row.user_id, familyId: row.family_id };
      }
      await this.refreshTokens.revokeFamily(row.family_id, 'reuse_detected');
      return { kind: 'reuse', userId: row.user_id, familyId: row.family_id };
    }

    if (row.expires_at.getTime() <= Date.now()) {
      await this.refreshTokens.revoke(row.id, 'expired');
      return { kind: 'invalid' };
    }

    await this.refreshTokens.revoke(row.id, 'rotated');
    return { kind: 'ok', userId: row.user_id, familyId: row.family_id, rotatedFrom: row.id };
  }

  async revokeToken(presented: string, reason: string): Promise<void> {
    const row = await this.refreshTokens.findByHash(this.passwords.hashToken(presented));
    if (row && !row.revoked_at) await this.refreshTokens.revoke(row.id, reason);
  }

  async revokeAllForUser(userId: string, reason: string): Promise<void> {
    await this.refreshTokens.revokeAllForUser(userId, reason);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    try {
      return await this.jwt.verifyAsync<AccessTokenClaims>(token, {
        secret: this.config.secret,
      });
    } catch {
      throw new UnauthenticatedError('Invalid or expired access token.');
    }
  }

  /** Refresh lifetime, parsed from the configured duration string. */
  private refreshExpiry(): Date {
    const spec = this.config.refreshExpiresIn;
    const match = /^(\d+)([smhd])$/.exec(spec.trim());
    if (!match) {
      // A malformed duration must not silently become an eternal session.
      throw new Error(`JWT_REFRESH_EXPIRES_IN is not a valid duration: "${spec}"`);
    }
    const value = Number(match[1]);
    const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as 's'];
    return new Date(Date.now() + value * unitMs);
  }

  toRoles(values: string[]): AppRole[] {
    return values as AppRole[];
  }

  decodeRefresh(token: string): RefreshTokenClaims | null {
    return this.jwt.decode<RefreshTokenClaims>(token);
  }
}
