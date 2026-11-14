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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const base_repository_1 = require("./base.repository");
let UserRepository = class UserRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async findByEmail(email) {
        const rows = await this.prisma.$queryRaw `
      select id, email, encrypted_password, email_confirmed_at,
             failed_login_count, locked_until, last_sign_in_at, password_changed_at
      from auth.users
      where lower(email) = lower(${email})
      limit 1
    `;
        return rows[0] ?? null;
    }
    async findById(id) {
        const rows = await this.prisma.$queryRaw `
      select id, email, encrypted_password, email_confirmed_at,
             failed_login_count, locked_until, last_sign_in_at, password_changed_at
      from auth.users
      where id = ${id}::uuid
      limit 1
    `;
        return rows[0] ?? null;
    }
    async create(input) {
        const rows = await this.prisma.$queryRaw `
      insert into auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
      values (
        ${input.email},
        ${input.passwordHash},
        ${JSON.stringify(input.metadata)}::jsonb,
        ${input.emailConfirmed ? new Date() : null}
      )
      returning id
    `;
        return rows[0];
    }
    async setPassword(userId, passwordHash) {
        await this.prisma.$executeRaw `
      update auth.users
      set encrypted_password = ${passwordHash},
          password_changed_at = now(),
          updated_at = now(),
          failed_login_count = 0,
          locked_until = null
      where id = ${userId}::uuid
    `;
    }
    async clearMustChangePassword(userId) {
        await this.prisma.$executeRaw `
      update public.profiles set must_change_password = false, updated_at = now()
      where id = ${userId}::uuid and must_change_password
    `;
    }
    async markEmailConfirmed(userId) {
        await this.prisma.$executeRaw `
      update auth.users
      set email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
      where id = ${userId}::uuid
    `;
    }
    async recordSuccessfulLogin(userId) {
        await this.prisma.$executeRaw `
      update auth.users
      set last_sign_in_at = now(), failed_login_count = 0, locked_until = null
      where id = ${userId}::uuid
    `;
    }
    async recordFailedLogin(userId, threshold, lockMinutes) {
        const rows = await this.prisma.$queryRaw `
      update auth.users
      set failed_login_count = failed_login_count + 1,
          locked_until = case
            when failed_login_count + 1 >= ${threshold}
            then now() + make_interval(mins => ${lockMinutes})
            else locked_until
          end
      where id = ${userId}::uuid
      returning failed_login_count
    `;
        return rows[0]?.failed_login_count ?? 0;
    }
    async findAuthorization(userId) {
        const claims = JSON.stringify({ sub: userId, role: 'authenticated' });
        const [, rows] = await this.prisma.$transaction([
            this.prisma.$executeRaw `select set_config('request.jwt.claims', ${claims}, true)`,
            this.prisma.$queryRaw `
        select
          (select array_agg(ur.role::text order by ur.role::text)
             from public.user_roles ur where ur.user_id = ${userId}::uuid) as roles,
          public.my_permissions() as permissions,
          p.primary_role::text as primary_role,
          p.must_change_password,
          p.full_name
        from public.profiles p
        where p.id = ${userId}::uuid
      `,
        ]);
        const row = rows[0];
        return {
            roles: row?.roles ?? [],
            permissions: row?.permissions ?? [],
            primaryRole: row?.primary_role ?? null,
            mustChangePassword: row?.must_change_password ?? false,
            fullName: row?.full_name ?? null,
        };
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map