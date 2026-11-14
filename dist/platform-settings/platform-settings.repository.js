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
exports.PlatformSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let PlatformSettingsRepository = class PlatformSettingsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async findAll() {
        return this.prisma.$queryRaw `
      select key, value, label, description, group_name, is_public
      from public.platform_settings
      order by group_name nulls last, key
    `;
    }
    async findPublic() {
        return this.prisma.$queryRaw `
      select key, value, label, description, group_name, is_public
      from public.platform_settings
      where is_public
      order by key
    `;
    }
    async update(actorId, key, value) {
        return this.prisma.withUser(actorId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.platform_settings
        set value = ${JSON.stringify(value)}::jsonb, updated_by = ${actorId}::uuid, updated_at = now()
        where key = ${key}
        returning key, value, label, description, group_name, is_public
      `;
            return rows[0] ?? null;
        });
    }
};
exports.PlatformSettingsRepository = PlatformSettingsRepository;
exports.PlatformSettingsRepository = PlatformSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformSettingsRepository);
//# sourceMappingURL=platform-settings.repository.js.map