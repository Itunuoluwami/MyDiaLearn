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
exports.UsersService = void 0;
exports.toResponse = toResponse;
const common_1 = require("@nestjs/common");
const admin_errors_1 = require("../admin/admin-errors");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const query_dto_1 = require("../shared/query.dto");
const users_repository_1 = require("./users.repository");
let UsersService = class UsersService {
    repository;
    audit;
    constructor(repository, audit) {
        this.repository = repository;
        this.audit = audit;
    }
    async me(userId) {
        const [profile, roles, permissions] = await Promise.all([
            this.repository.findById(userId, userId),
            this.repository.findRoles(userId, userId),
            this.repository.findPermissions(userId),
        ]);
        if (!profile)
            throw new app_exception_1.NotFoundError('Profile');
        return { ...toResponse(profile), roles, permissions };
    }
    permissionCatalog(userId) {
        return this.repository.permissionCatalog(userId);
    }
    async findOne(callerId, id) {
        const profile = await this.repository.findById(callerId, id);
        if (!profile)
            throw new app_exception_1.NotFoundError('Profile');
        return toResponse(profile);
    }
    async updateOwn(userId, dto, context) {
        const before = await this.repository.findById(userId, userId);
        if (!before)
            throw new app_exception_1.NotFoundError('Profile');
        const updated = await this.repository.updateOwn(userId, dto);
        if (!updated)
            throw new app_exception_1.NotFoundError('Profile');
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            actorEmail: updated.email,
            entityType: 'profile',
            entityId: userId,
            context,
            metadata: { fields: Object.keys(dto) },
        });
        return toResponse(updated);
    }
    async search(callerId, query) {
        const { rows, total } = await this.repository.search(callerId, query, {
            q: query.q,
            role: query.role,
            isActive: query.isActive,
        });
        return (0, query_dto_1.paginate)(rows.map(toResponse), total, query);
    }
    async setRoles(adminId, userId, roles, context) {
        const before = await this.repository.findRoles(adminId, userId);
        try {
            await this.repository.setRoles(adminId, userId, roles);
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not change those roles.');
        }
        const after = await this.repository.findRoles(adminId, userId);
        await this.audit.record('user.roles_changed', {
            actorId: adminId,
            entityType: 'profile',
            entityId: userId,
            before: { roles: before },
            after: { roles: after },
            context,
        });
        return { roles: after };
    }
    async setPermission(adminId, userId, permissionKey, granted, context) {
        try {
            await this.repository.setPermission(adminId, userId, permissionKey, granted);
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not change that permission.');
        }
        await this.audit.record('user.permission_changed', {
            actorId: adminId,
            entityType: 'profile',
            entityId: userId,
            context,
            metadata: { permissionKey, granted },
        });
    }
    async roles(callerId, userId) {
        return this.repository.findRoles(callerId, userId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        audit_service_1.AuditService])
], UsersService);
function toResponse(row) {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        countryCode: row.country_code,
        timezone: row.timezone,
        preferredCurrency: row.preferred_currency,
        primaryRole: row.primary_role,
        onboardingCompleted: row.onboarding_completed,
        isActive: row.is_active,
        mustChangePassword: row.must_change_password,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=users.service.js.map