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
exports.TutorListQueryDto = exports.AddTutorDocumentDto = exports.ReplaceAvailabilityDto = exports.AvailabilityWindowDto = exports.ReplaceTutorSubjectsDto = exports.AddAvailabilityWindowDto = exports.SetWindowActiveDto = exports.AddTutorSubjectDto = exports.TutorSubjectEntryDto = exports.UpdateTutorProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const query_dto_1 = require("../../shared/query.dto");
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
class UpdateTutorProfileDto {
    headline;
    biography;
    qualifications;
    languages;
    education;
    yearsExperience;
    introVideoUrl;
    timezone;
    methodology;
    teachingContext;
    onboardingStep;
    isListed;
}
exports.UpdateTutorProfileDto = UpdateTutorProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "headline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "biography", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(30),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(200, { each: true }),
    __metadata("design:type", Array)
], UpdateTutorProfileDto.prototype, "qualifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(60, { each: true }),
    __metadata("design:type", Array)
], UpdateTutorProfileDto.prototype, "languages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(200, { each: true }),
    __metadata("design:type", Array)
], UpdateTutorProfileDto.prototype, "education", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(70),
    __metadata("design:type", Number)
], UpdateTutorProfileDto.prototype, "yearsExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "introVideoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "methodology", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateTutorProfileDto.prototype, "teachingContext", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdateTutorProfileDto.prototype, "onboardingStep", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTutorProfileDto.prototype, "isListed", void 0);
class TutorSubjectEntryDto {
    subjectId;
    educationLevelId;
}
exports.TutorSubjectEntryDto = TutorSubjectEntryDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], TutorSubjectEntryDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], TutorSubjectEntryDto.prototype, "educationLevelId", void 0);
class AddTutorSubjectDto {
    subjectId;
    educationLevelId;
}
exports.AddTutorSubjectDto = AddTutorSubjectDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AddTutorSubjectDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AddTutorSubjectDto.prototype, "educationLevelId", void 0);
class SetWindowActiveDto {
    isActive;
}
exports.SetWindowActiveDto = SetWindowActiveDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetWindowActiveDto.prototype, "isActive", void 0);
class AddAvailabilityWindowDto {
    dayOfWeek;
    startTime;
    endTime;
}
exports.AddAvailabilityWindowDto = AddAvailabilityWindowDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], AddAvailabilityWindowDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.Matches)(TIME_PATTERN, { message: 'startTime must be HH:MM or HH:MM:SS.' }),
    __metadata("design:type", String)
], AddAvailabilityWindowDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.Matches)(TIME_PATTERN, { message: 'endTime must be HH:MM or HH:MM:SS.' }),
    __metadata("design:type", String)
], AddAvailabilityWindowDto.prototype, "endTime", void 0);
class ReplaceTutorSubjectsDto {
    subjects;
}
exports.ReplaceTutorSubjectsDto = ReplaceTutorSubjectsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(50),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TutorSubjectEntryDto),
    __metadata("design:type", Array)
], ReplaceTutorSubjectsDto.prototype, "subjects", void 0);
class AvailabilityWindowDto {
    dayOfWeek;
    startTime;
    endTime;
    timezone;
    isActive;
}
exports.AvailabilityWindowDto = AvailabilityWindowDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], AvailabilityWindowDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.Matches)(TIME_PATTERN, { message: 'startTime must be HH:MM or HH:MM:SS.' }),
    __metadata("design:type", String)
], AvailabilityWindowDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.Matches)(TIME_PATTERN, { message: 'endTime must be HH:MM or HH:MM:SS.' }),
    __metadata("design:type", String)
], AvailabilityWindowDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], AvailabilityWindowDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AvailabilityWindowDto.prototype, "isActive", void 0);
class ReplaceAvailabilityDto {
    windows;
}
exports.ReplaceAvailabilityDto = ReplaceAvailabilityDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AvailabilityWindowDto),
    __metadata("design:type", Array)
], ReplaceAvailabilityDto.prototype, "windows", void 0);
class AddTutorDocumentDto {
    stepId;
    label;
    storagePath;
    mimeType;
    sizeBytes;
}
exports.AddTutorDocumentDto = AddTutorDocumentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AddTutorDocumentDto.prototype, "stepId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AddTutorDocumentDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AddTutorDocumentDto.prototype, "storagePath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AddTutorDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddTutorDocumentDto.prototype, "sizeBytes", void 0);
class TutorListQueryDto extends query_dto_1.PaginationQueryDto {
}
exports.TutorListQueryDto = TutorListQueryDto;
//# sourceMappingURL=tutor.dto.js.map