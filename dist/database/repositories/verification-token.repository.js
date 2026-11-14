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
exports.VerificationTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const base_repository_1 = require("./base.repository");
let VerificationTokenRepository = class VerificationTokenRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async create(input) {
        await this.prisma.$executeRaw `
      update auth.verification_tokens
      set consumed_at = now()
      where user_id = ${input.userId}::uuid
        and purpose = ${input.purpose}::auth.verification_purpose
        and consumed_at is null
    `;
        await this.prisma.$executeRaw `
      insert into auth.verification_tokens (user_id, purpose, token_hash, expires_at)
      values (${input.userId}::uuid, ${input.purpose}::auth.verification_purpose,
              ${input.tokenHash}, ${input.expiresAt})
    `;
    }
    async consume(tokenHash, purpose) {
        const rows = await this.prisma.$queryRaw `
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
};
exports.VerificationTokenRepository = VerificationTokenRepository;
exports.VerificationTokenRepository = VerificationTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VerificationTokenRepository);
//# sourceMappingURL=verification-token.repository.js.map