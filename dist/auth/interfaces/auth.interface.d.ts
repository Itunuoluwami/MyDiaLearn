import type { AppRole } from '../../common/decorators/roles.decorator';
export interface AccessTokenClaims {
    sub: string;
    email: string;
    roles: AppRole[];
    permissions: string[];
    mcp?: boolean;
    iat?: number;
    exp?: number;
}
export interface RefreshTokenClaims {
    sub: string;
    fam: string;
    jti: string;
    iat?: number;
    exp?: number;
}
export interface AuthSession {
    accessToken: string;
    expiresIn: number;
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
