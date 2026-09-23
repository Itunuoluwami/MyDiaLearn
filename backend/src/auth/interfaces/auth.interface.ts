import type { AppRole } from '../../common/decorators/roles.decorator';

/**
 * Claims carried by an access token.
 *
 * Roles and permissions are embedded so authorization needs no database round
 * trip. The cost is staleness: a grant or revocation only takes effect when the
 * access token next refreshes, which is why access tokens are short-lived.
 */
export interface AccessTokenClaims {
  sub: string;
  email: string;
  roles: AppRole[];
  permissions: string[];
  /** Forced password change, mirroring profiles.must_change_password. */
  mcp?: boolean;
  iat?: number;
  exp?: number;
}

/** Refresh tokens carry no authority of their own beyond identifying a family. */
export interface RefreshTokenClaims {
  sub: string;
  /** Rotation family. Reusing a revoked member kills the whole family. */
  fam: string;
  jti: string;
  iat?: number;
  exp?: number;
}

/**
 * What the frontend receives. Deliberately shaped like a Supabase session so
 * the auth adapter can present one interface to the existing UI.
 */
export interface AuthSession {
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  /** Absolute expiry, epoch seconds — what the adapter schedules against. */
  expiresAt: number;
  tokenType: 'bearer';
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  roles: AppRole[];
  permissions: string[];
  primaryRole: AppRole | null;
  mustChangePassword: boolean;
}

/** Request context recorded against sensitive events. */
export interface RequestContext {
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export interface IssuedTokens {
  session: AuthSession;
  refreshToken: string;
  refreshExpiresAt: Date;
}
