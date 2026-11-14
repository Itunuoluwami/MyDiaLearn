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
exports.AdminSettingsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const admin_errors_1 = require("../admin-errors");
const admin_settings_repository_1 = require("./admin-settings.repository");
let AdminSettingsService = class AdminSettingsService {
    repository;
    audit;
    constructor(repository, audit) {
        this.repository = repository;
        this.audit = audit;
    }
    subjects(adminId) {
        return this.repository.subjects(adminId);
    }
    async createSubject(adminId, dto) {
        await this.run(() => this.repository.createSubject(adminId, {
            name: dto.name.trim(),
            slug: dto.slug,
            category: dto.category?.trim() || null,
            sortOrder: dto.sortOrder,
        }));
    }
    async setSubjectActive(adminId, id, isActive) {
        if (!(await this.repository.setSubjectActive(adminId, id, isActive))) {
            throw new app_exception_1.NotFoundError('Subject');
        }
    }
    async deleteSubject(adminId, id) {
        const found = await this.run(() => this.repository.deleteSubject(adminId, id));
        if (!found)
            throw new app_exception_1.NotFoundError('Subject');
    }
    curricula(adminId) {
        return this.repository.curricula(adminId);
    }
    async createCurriculum(adminId, dto) {
        await this.run(() => this.repository.createCurriculum(adminId, {
            name: dto.name.trim(),
            code: dto.code,
            countryCode: dto.countryCode?.trim().toUpperCase() || null,
            sortOrder: dto.sortOrder,
        }));
    }
    async setCurriculumActive(adminId, id, isActive) {
        if (!(await this.repository.setCurriculumActive(adminId, id, isActive))) {
            throw new app_exception_1.NotFoundError('Curriculum');
        }
    }
    commissionRules(adminId) {
        return this.repository.commissionRules(adminId);
    }
    commissionTargets(adminId) {
        return this.repository.commissionTargets(adminId);
    }
    async createCommissionRule(adminId, dto, context) {
        const id = await this.run(() => this.repository.createCommissionRule(adminId, {
            name: dto.name.trim(),
            model: dto.model,
            percentage: dto.percentage ?? null,
            fixedAmount: dto.fixedAmount ?? null,
            platformFeePercentage: dto.platformFeePercentage,
            appliesTo: dto.appliesTo,
            tutorId: dto.tutorId ?? null,
            agencyId: dto.agencyId ?? null,
            tiers: dto.model === 'tiered' ? dto.tiers : [],
            priority: dto.priority,
        }));
        await this.audit.record('admin.settings_changed', {
            actorId: adminId,
            entityType: 'commission_rule',
            entityId: id,
            context,
            metadata: {
                scope: 'commission_rule_created',
                model: dto.model,
                percentage: dto.percentage ?? null,
                fixedAmount: dto.fixedAmount ?? null,
                platformFeePercentage: dto.platformFeePercentage,
            },
        });
    }
    async setCommissionRuleActive(adminId, id, isActive, context) {
        if (!(await this.repository.setCommissionRuleActive(adminId, id, isActive))) {
            throw new app_exception_1.NotFoundError('Commission rule');
        }
        await this.audit.record('admin.settings_changed', {
            actorId: adminId,
            entityType: 'commission_rule',
            entityId: id,
            context,
            metadata: { scope: 'commission_rule_toggled', isActive },
        });
    }
    platformSettings(adminId, scope) {
        return this.repository.platformSettings(adminId, scope);
    }
    async upsertSettings(adminId, settings) {
        await this.run(() => this.repository.upsertSettings(adminId, settings.map((s) => ({
            key: s.key,
            value: s.value,
            label: s.label ?? null,
            description: s.description ?? null,
            groupName: s.groupName ?? null,
        }))));
    }
    async updateSettingValue(adminId, key, value) {
        if (!(await this.run(() => this.repository.updateSettingValue(adminId, key, value)))) {
            throw new app_exception_1.NotFoundError('Setting');
        }
    }
    templates(adminId) {
        return this.repository.templates(adminId);
    }
    async createTemplate(adminId, dto, context) {
        await this.run(() => this.repository.createTemplate(adminId, {
            triggerKey: dto.triggerKey,
            channel: dto.channel,
            audience: dto.audience || null,
            subject: dto.subject || null,
            body: dto.body,
        }));
        await this.audit.record('admin.settings_changed', {
            actorId: adminId,
            entityType: 'notification_template',
            context,
            metadata: {
                scope: 'template_created',
                triggerKey: dto.triggerKey,
                channel: dto.channel,
            },
        });
    }
    async updateTemplate(adminId, id, dto, context) {
        const found = await this.run(() => this.repository.updateTemplate(adminId, id, {
            triggerKey: dto.triggerKey,
            channel: dto.channel,
            ...(dto.audience !== undefined ? { audience: dto.audience || null } : {}),
            ...(dto.subject !== undefined ? { subject: dto.subject || null } : {}),
            body: dto.body,
            isActive: dto.isActive,
        }));
        if (!found)
            throw new app_exception_1.NotFoundError('Template');
        await this.audit.record('admin.settings_changed', {
            actorId: adminId,
            entityType: 'notification_template',
            entityId: id,
            context,
            metadata: { scope: 'template_updated', fields: Object.keys(dto) },
        });
    }
    async run(operation) {
        try {
            return await operation();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/23505|duplicate key/i.test(message)) {
                throw (0, admin_errors_1.translateAdminError)(new Error('ALREADY_EXISTS'), 'That already exists.');
            }
            if (/23503|foreign key/i.test(message)) {
                throw (0, admin_errors_1.translateAdminError)(new Error('IN_USE'), 'That is still in use.');
            }
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not save that setting.');
        }
    }
};
exports.AdminSettingsService = AdminSettingsService;
exports.AdminSettingsService = AdminSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_settings_repository_1.AdminSettingsRepository,
        audit_service_1.AuditService])
], AdminSettingsService);
//# sourceMappingURL=admin-settings.service.js.map