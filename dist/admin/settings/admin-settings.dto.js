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
exports.UpdateTemplateDto = exports.TemplateDto = exports.UpdateSettingValueDto = exports.UpsertPlatformSettingsDto = exports.PlatformSettingDto = exports.PlatformSettingsQueryDto = exports.CreateCommissionRuleDto = exports.TierDto = exports.CreateCurriculumDto = exports.CreateSubjectDto = exports.SetActiveDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AUDIENCES = ['student', 'parent', 'tutor', 'agency', 'admin', 'super_admin'];
class SetActiveDto {
    isActive;
}
exports.SetActiveDto = SetActiveDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetActiveDto.prototype, "isActive", void 0);
class CreateSubjectDto {
    name;
    slug;
    category;
    sortOrder;
}
exports.CreateSubjectDto = CreateSubjectDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubjectDto.prototype, "sortOrder", void 0);
class CreateCurriculumDto {
    name;
    code;
    countryCode;
    sortOrder;
}
exports.CreateCurriculumDto = CreateCurriculumDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateCurriculumDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateCurriculumDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2),
    __metadata("design:type", String)
], CreateCurriculumDto.prototype, "countryCode", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCurriculumDto.prototype, "sortOrder", void 0);
class TierDto {
    min;
    max;
    percentage;
}
exports.TierDto = TierDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TierDto.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Object)
], TierDto.prototype, "max", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TierDto.prototype, "percentage", void 0);
class CreateCommissionRuleDto {
    name;
    model;
    percentage;
    fixedAmount;
    platformFeePercentage;
    appliesTo;
    tutorId;
    agencyId;
    tiers;
    priority;
}
exports.CreateCommissionRuleDto = CreateCommissionRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['percentage', 'fixed', 'tiered']),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "percentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "fixedAmount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "platformFeePercentage", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['tutor', 'agency', 'parent', 'student', 'admin']),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "appliesTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "tutorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "agencyId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TierDto),
    __metadata("design:type", Array)
], CreateCommissionRuleDto.prototype, "tiers", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "priority", void 0);
class PlatformSettingsQueryDto {
    scope;
}
exports.PlatformSettingsQueryDto = PlatformSettingsQueryDto;
__decorate([
    (0, class_validator_1.IsIn)(['payments', 'general']),
    __metadata("design:type", String)
], PlatformSettingsQueryDto.prototype, "scope", void 0);
class PlatformSettingDto {
    key;
    value;
    label;
    description;
    groupName;
}
exports.PlatformSettingDto = PlatformSettingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9_.-]+$/i),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], PlatformSettingDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Object)
], PlatformSettingDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PlatformSettingDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], PlatformSettingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], PlatformSettingDto.prototype, "groupName", void 0);
class UpsertPlatformSettingsDto {
    settings;
}
exports.UpsertPlatformSettingsDto = UpsertPlatformSettingsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlatformSettingDto),
    __metadata("design:type", Array)
], UpsertPlatformSettingsDto.prototype, "settings", void 0);
class UpdateSettingValueDto {
    value;
}
exports.UpdateSettingValueDto = UpdateSettingValueDto;
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Object)
], UpdateSettingValueDto.prototype, "value", void 0);
class TemplateDto {
    triggerKey;
    channel;
    audience;
    subject;
    body;
}
exports.TemplateDto = TemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9_.]+$/),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], TemplateDto.prototype, "triggerKey", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['in_app', 'email', 'sms', 'push']),
    __metadata("design:type", String)
], TemplateDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AUDIENCES),
    __metadata("design:type", String)
], TemplateDto.prototype, "audience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], TemplateDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], TemplateDto.prototype, "body", void 0);
class UpdateTemplateDto {
    triggerKey;
    channel;
    audience;
    subject;
    body;
    isActive;
}
exports.UpdateTemplateDto = UpdateTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9_.]+$/),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "triggerKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['in_app', 'email', 'sms', 'push']),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AUDIENCES),
    __metadata("design:type", Object)
], UpdateTemplateDto.prototype, "audience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", Object)
], UpdateTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTemplateDto.prototype, "isActive", void 0);
//# sourceMappingURL=admin-settings.dto.js.map