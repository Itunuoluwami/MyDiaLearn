"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const node_crypto_1 = require("node:crypto");
const configuration_1 = require("../../config/configuration");
const refresh_token_repository_1 = require("../../database/repositories/refresh-token.repository");
const app_exception_1 = require("../../common/exceptions/app.exception");
const password_service_1 = require("./password.service");
let TokenService = class TokenService {
    static { TokenService_1 = this; }
    jwt;
    passwords;
    refreshTokens;
    config;
    constructor(jwt, passwords, refreshTokens, config) {
        this.jwt = jwt;
        this.passwords = passwords;
        this.refreshTokens = refreshTokens;
        this.config = config;
    }
    async issue(user, context, familyId) {
        const accessToken = await this.signAccessToken(user);
        const decoded = this.jwt.decode(accessToken);
        const expiresAt = decoded?.exp ?? Math.floor(Date.now() / 1000) + 900;
        const family = familyId ?? (0, node_crypto_1.randomUUID)();
        const jti = (0, node_crypto_1.randomUUID)();
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
    async signAccessToken(user) {
        const claims = {
            sub: user.id,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            ...(user.mustChangePassword ? { mcp: true } : {}),
        };
        return this.jwt.signAsync(claims, {
            secret: this.config.secret,
            expiresIn: this.config.accessExpiresIn,
        });
    }
    static GRACE_MS = 120_000;
    async redeemRefreshToken(presented) {
        const hash = this.passwords.hashToken(presented);
        const row = await this.refreshTokens.findByHash(hash);
        if (!row)
            return { kind: 'invalid' };
        if (row.revoked_at) {
            const spentMsAgo = Date.now() - row.revoked_at.getTime();
            if (row.revoked_reason === 'rotated' && spentMsAgo <= TokenService_1.GRACE_MS) {
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
    async revokeToken(presented, reason) {
        const row = await this.refreshTokens.findByHash(this.passwords.hashToken(presented));
        if (row && !row.revoked_at)
            await this.refreshTokens.revoke(row.id, reason);
    }
    async revokeAllForUser(userId, reason) {
        await this.refreshTokens.revokeAllForUser(userId, reason);
    }
    async verifyAccessToken(token) {
        try {
            return await this.jwt.verifyAsync(token, {
                secret: this.config.secret,
            });
        }
        catch {
            throw new app_exception_1.UnauthenticatedError('Invalid or expired access token.');
        }
    }
    refreshExpiry() {
        const spec = this.config.refreshExpiresIn;
        const match = /^(\d+)([smhd])$/.exec(spec.trim());
        if (!match) {
            throw new Error(`JWT_REFRESH_EXPIRES_IN is not a valid duration: "${spec}"`);
        }
        const value = Number(match[1]);
        const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
        return new Date(Date.now() + value * unitMs);
    }
    toRoles(values) {
        return values;
    }
    decodeRefresh(token) {
        return this.jwt.decode(token);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(configuration_1.jwtConfig.KEY)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        password_service_1.PasswordService,
        refresh_token_repository_1.RefreshTokenRepository, Object])
], TokenService);
//# sourceMappingURL=token.service.js.map