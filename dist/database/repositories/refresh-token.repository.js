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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const base_repository_1 = require("./base.repository");
let RefreshTokenRepository = class RefreshTokenRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async create(input) {
        const rows = await this.prisma.$queryRaw `
      insert into auth.refresh_tokens (user_id, token_hash, family_id, expires_at, user_agent, ip)
      values (${input.userId}::uuid, ${input.tokenHash}, ${input.familyId}::uuid,
              ${input.expiresAt}, ${input.userAgent ?? null}, ${input.ip ?? null})
      returning id
    `;
        return rows[0];
    }
    async findByHash(tokenHash) {
        const rows = await this.prisma.$queryRaw `
      select id, user_id, family_id, expires_at, revoked_at, revoked_reason
      from auth.refresh_tokens
      where token_hash = ${tokenHash}
      limit 1
    `;
        return rows[0] ?? null;
    }
    async revoke(id, reason, replacedBy) {
        await this.prisma.$executeRaw `
      update auth.refresh_tokens
      set revoked_at = coalesce(revoked_at, now()),
          revoked_reason = coalesce(revoked_reason, ${reason}),
          replaced_by = coalesce(replaced_by, ${replacedBy ?? null}::uuid)
      where id = ${id}::uuid
    `;
    }
    async revokeFamily(familyId, reason) {
        return this.prisma.$executeRaw `
      update auth.refresh_tokens
      set revoked_at = now(), revoked_reason = ${reason}
      where family_id = ${familyId}::uuid and revoked_at is null
    `;
    }
    async revokeAllForUser(userId, reason) {
        return this.prisma.$executeRaw `
      update auth.refresh_tokens
      set revoked_at = now(), revoked_reason = ${reason}
      where user_id = ${userId}::uuid and revoked_at is null
    `;
    }
    async deleteExpired() {
        return this.prisma.$executeRaw `
      delete from auth.refresh_tokens
      where expires_at < now() - interval '30 days'
    `;
    }
};
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.RefreshTokenRepository = RefreshTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefreshTokenRepository);
//# sourceMappingURL=refresh-token.repository.js.map