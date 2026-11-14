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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSettingsController = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../../common/audit/request-context");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_settings_dto_1 = require("./admin-settings.dto");
const admin_settings_service_1 = require("./admin-settings.service");
const UUID = new common_1.ParseUUIDPipe({ version: '4' });
let AdminSettingsController = class AdminSettingsController {
    settings;
    constructor(settings) {
        this.settings = settings;
    }
    subjects(user) {
        return this.settings.subjects(user.id);
    }
    async createSubject(user, dto) {
        await this.settings.createSubject(user.id, dto);
    }
    async setSubjectActive(user, id, dto) {
        await this.settings.setSubjectActive(user.id, id, dto.isActive);
    }
    async deleteSubject(user, id) {
        await this.settings.deleteSubject(user.id, id);
    }
    curricula(user) {
        return this.settings.curricula(user.id);
    }
    async createCurriculum(user, dto) {
        await this.settings.createCurriculum(user.id, dto);
    }
    async setCurriculumActive(user, id, dto) {
        await this.settings.setCurriculumActive(user.id, id, dto.isActive);
    }
    commissionRules(user) {
        return this.settings.commissionRules(user.id);
    }
    commissionTargets(user) {
        return this.settings.commissionTargets(user.id);
    }
    async createCommissionRule(user, dto, request) {
        await this.settings.createCommissionRule(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async setCommissionRuleActive(user, id, dto, request) {
        await this.settings.setCommissionRuleActive(user.id, id, dto.isActive, (0, request_context_1.auditContextOf)(request));
    }
    platformSettings(user, query) {
        return this.settings.platformSettings(user.id, query.scope);
    }
    async upsertSettings(user, dto) {
        await this.settings.upsertSettings(user.id, dto.settings);
    }
    async createSetting(user, dto) {
        await this.settings.upsertSettings(user.id, [dto]);
    }
    async updateSettingValue(user, key, dto) {
        await this.settings.updateSettingValue(user.id, key, dto.value);
    }
    templates(user) {
        return this.settings.templates(user.id);
    }
    async createTemplate(user, dto, request) {
        await this.settings.createTemplate(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async updateTemplate(user, id, dto, request) {
        await this.settings.updateTemplate(user.id, id, dto, (0, request_context_1.auditContextOf)(request));
    }
};
exports.AdminSettingsController = AdminSettingsController;
__decorate([
    (0, common_1.Get)('subjects'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "subjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Patch)('subjects/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_settings_dto_1.SetActiveDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "setSubjectActive", null);
__decorate([
    (0, common_1.Delete)('subjects/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "deleteSubject", null);
__decorate([
    (0, common_1.Get)('curricula'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "curricula", null);
__decorate([
    (0, common_1.Post)('curricula'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.CreateCurriculumDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "createCurriculum", null);
__decorate([
    (0, common_1.Patch)('curricula/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_settings_dto_1.SetActiveDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "setCurriculumActive", null);
__decorate([
    (0, common_1.Get)('commission-rules'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "commissionRules", null);
__decorate([
    (0, common_1.Get)('commission-targets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "commissionTargets", null);
__decorate([
    (0, common_1.Post)('commission-rules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.CreateCommissionRuleDto, Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "createCommissionRule", null);
__decorate([
    (0, common_1.Patch)('commission-rules/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_settings_dto_1.SetActiveDto, Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "setCommissionRuleActive", null);
__decorate([
    (0, common_1.Get)('platform'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.PlatformSettingsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "platformSettings", null);
__decorate([
    (0, common_1.Put)('platform'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.UpsertPlatformSettingsDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "upsertSettings", null);
__decorate([
    (0, common_1.Post)('platform'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.PlatformSettingDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "createSetting", null);
__decorate([
    (0, common_1.Patch)('platform/:key'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_settings_dto_1.UpdateSettingValueDto]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "updateSettingValue", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "templates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_settings_dto_1.TemplateDto, Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)('templates/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_settings_dto_1.UpdateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "updateTemplate", null);
exports.AdminSettingsController = AdminSettingsController = __decorate([
    (0, common_1.Controller)('admin/settings'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, roles_decorator_1.RequirePermission)('admin.settings'),
    __metadata("design:paramtypes", [admin_settings_service_1.AdminSettingsService])
], AdminSettingsController);
//# sourceMappingURL=admin-settings.controller.js.map