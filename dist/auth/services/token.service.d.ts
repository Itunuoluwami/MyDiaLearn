import { JwtService } from '@nestjs/jwt';
import { type JwtConfig } from '../../config/configuration';
import { RefreshTokenRepository } from '../../database/repositories/refresh-token.repository';
import type { AppRole } from '../../common/decorators/roles.decorator';
import type { AccessTokenClaims, AuthUser, IssuedTokens, RefreshTokenClaims, RequestContext } from '../interfaces/auth.interface';
import { PasswordService } from './password.service';
export type RefreshOutcome = {
    kind: 'ok';
    userId: string;
    familyId: string;
    rotatedFrom: string;
} | {
    kind: 'invalid';
} | {
    kind: 'reuse';
    userId: string;
    familyId: string;
} | {
    kind: 'concurrent';
    userId: string;
    familyId: string;
};
export declare class TokenService {
    private readonly jwt;
    private readonly passwords;
    private readonly refreshTokens;
    private readonly config;
    constructor(jwt: JwtService, passwords: PasswordService, refreshTokens: RefreshTokenRepository, config: JwtConfig);
    issue(user: AuthUser, context: RequestContext, familyId?: string): Promise<IssuedTokens>;
    private signAccessToken;
    private static readonly GRACE_MS;
    redeemRefreshToken(presented: string): Promise<RefreshOutcome>;
    revokeToken(presented: string, reason: string): Promise<void>;
    revokeAllForUser(userId: string, reason: string): Promise<void>;
    verifyAccessToken(token: string): Promise<AccessTokenClaims>;
    private refreshExpiry;
    toRoles(values: string[]): AppRole[];
    decodeRefresh(token: string): RefreshTokenClaims | null;
}
