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
exports.ProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const base_repository_1 = require("./base.repository");
const SELECT = {
    id: true,
    email: true,
    full_name: true,
    primary_role: true,
    is_active: true,
    must_change_password: true,
};
function toRecord(row) {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        primaryRole: row.primary_role,
        isActive: row.is_active,
        mustChangePassword: row.must_change_password,
    };
}
let ProfileRepository = class ProfileRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async findById(id) {
        const row = await this.prisma.profiles.findUnique({ where: { id }, select: SELECT });
        return row ? toRecord(row) : null;
    }
    async findByEmail(email) {
        const row = await this.prisma.profiles.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: SELECT,
        });
        return row ? toRecord(row) : null;
    }
    async findRoles(userId) {
        const rows = await this.prisma.user_roles.findMany({
            where: { user_id: userId },
            select: { role: true },
        });
        return rows.map((row) => row.role);
    }
};
exports.ProfileRepository = ProfileRepository;
exports.ProfileRepository = ProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileRepository);
//# sourceMappingURL=profile.repository.js.map