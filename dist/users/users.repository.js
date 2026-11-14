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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let UsersRepository = class UsersRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async findById(callerId, id) {
        return this.prisma.withUser(callerId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, email, full_name, phone, avatar_url, country_code, timezone,
               preferred_currency, primary_role::text, onboarding_completed,
               is_active, must_change_password, created_at, updated_at
        from public.profiles where id = ${id}::uuid
      `;
            return rows[0] ?? null;
        });
    }
    async updateOwn(userId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.profiles set
          full_name          = coalesce(${input.fullName ?? null}, full_name),
          phone              = coalesce(${input.phone ?? null}, phone),
          country_code       = coalesce(${input.countryCode ?? null}, country_code),
          timezone           = coalesce(${input.timezone ?? null}, timezone),
          preferred_currency = coalesce(${input.preferredCurrency ?? null}, preferred_currency),
          avatar_url         = coalesce(${input.avatarUrl ?? null}, avatar_url),
          onboarding_completed = coalesce(${input.onboardingCompleted ?? null}::boolean, onboarding_completed),
          updated_at         = now()
        where id = ${userId}::uuid
        returning id, email, full_name, phone, avatar_url, country_code, timezone,
                  preferred_currency, primary_role::text, onboarding_completed,
                  is_active, must_change_password, created_at, updated_at
      `;
            return rows[0] ?? null;
        });
    }
    async permissionCatalog(userId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select key, label, category from public.permissions order by category, key
      `);
    }
    async findRoles(callerId, userId) {
        return this.prisma.withUser(callerId, async (tx) => {
            const rows = await tx.$queryRaw `
        select role::text from public.user_roles where user_id = ${userId}::uuid order by role::text
      `;
            return rows.map((r) => r.role);
        });
    }
    async findPermissions(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.my_permissions() as p
      `;
            return rows[0]?.p ?? [];
        });
    }
    async search(callerId, query, filters) {
        const like = filters.q ? `%${filters.q}%` : null;
        return this.prisma.withUser(callerId, async (tx) => {
            const rows = await tx.$queryRaw `
        select p.id, p.email, p.full_name, p.phone, p.avatar_url, p.country_code, p.timezone,
               p.preferred_currency, p.primary_role::text, p.onboarding_completed,
               p.is_active, p.must_change_password, p.created_at, p.updated_at
        from public.profiles p
        where (${like}::text is null or p.full_name ilike ${like} or p.email ilike ${like})
          and (${filters.role ?? null}::text is null
               or exists (select 1 from public.user_roles ur
                          where ur.user_id = p.id and ur.role::text = ${filters.role ?? null}))
          and (${filters.isActive ?? null}::boolean is null or p.is_active = ${filters.isActive ?? null})
        order by p.created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.profiles p
        where (${like}::text is null or p.full_name ilike ${like} or p.email ilike ${like})
          and (${filters.role ?? null}::text is null
               or exists (select 1 from public.user_roles ur
                          where ur.user_id = p.id and ur.role::text = ${filters.role ?? null}))
          and (${filters.isActive ?? null}::boolean is null or p.is_active = ${filters.isActive ?? null})
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async setRoles(adminId, userId, roles) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        select public.admin_set_user_roles(${userId}::uuid, ${roles}::app_role[])
      `;
        });
    }
    async setPermission(adminId, userId, permissionKey, granted) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        select public.admin_set_user_permission(${userId}::uuid, ${permissionKey}, ${granted})
      `;
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map