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
exports.AgenciesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const request_context_1 = require("../common/audit/request-context");
const tutor_dto_1 = require("../tutors/dto/tutor.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const tutor_dto_2 = require("../tutors/dto/tutor.dto");
const agencies_service_1 = require("./agencies.service");
const agency_dto_1 = require("./dto/agency.dto");
const UUID = new common_1.ParseUUIDPipe({ version: '4' });
let AgenciesController = class AgenciesController {
    agencies;
    constructor(agencies) {
        this.agencies = agencies;
    }
    me(user) {
        return this.agencies.me(user.id);
    }
    update(user, dto) {
        return this.agencies.update(user.id, dto);
    }
    submit(user, request) {
        return this.agencies.submitVerification(user.id, (0, request_context_1.auditContextOf)(request));
    }
    dashboard(user) {
        return this.agencies.dashboard(user.id);
    }
    roster(user) {
        return this.agencies.roster(user.id);
    }
    addTutor(user, dto, request) {
        return this.agencies.addTutor(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async removeTutor(user, tutorId, request) {
        await this.agencies.removeTutor(user.id, tutorId, (0, request_context_1.auditContextOf)(request));
    }
    tutorProfile(user, tutorId) {
        return this.agencies.tutorProfile(user.id, tutorId);
    }
    updateTutorProfile(user, tutorId, dto, request) {
        return this.agencies.updateTutorProfile(user.id, tutorId, dto, (0, request_context_1.auditContextOf)(request));
    }
    tutorSubjects(user, tutorId) {
        return this.agencies.tutorSubjects(user.id, tutorId);
    }
    addTutorSubject(user, tutorId, dto, request) {
        return this.agencies.addTutorSubject(user.id, tutorId, dto.subjectId, dto.educationLevelId, (0, request_context_1.auditContextOf)(request));
    }
    async removeTutorSubject(user, tutorId, id, request) {
        await this.agencies.removeTutorSubject(user.id, tutorId, id, (0, request_context_1.auditContextOf)(request));
    }
    tutorAvailability(user, tutorId) {
        return this.agencies.tutorAvailability(user.id, tutorId);
    }
    addTutorWindow(user, tutorId, dto, request) {
        return this.agencies.addTutorWindow(user.id, tutorId, dto, (0, request_context_1.auditContextOf)(request));
    }
    async setTutorWindowActive(user, tutorId, id, dto, request) {
        await this.agencies.setTutorWindowActive(user.id, tutorId, id, dto.isActive, (0, request_context_1.auditContextOf)(request));
    }
    async deleteTutorWindow(user, tutorId, id, request) {
        await this.agencies.deleteTutorWindow(user.id, tutorId, id, (0, request_context_1.auditContextOf)(request));
    }
    tutorVerification(user, tutorId) {
        return this.agencies.tutorVerification(user.id, tutorId);
    }
    submitTutorVerification(user, tutorId, request) {
        return this.agencies.submitTutorVerification(user.id, tutorId, (0, request_context_1.auditContextOf)(request));
    }
    tutorDocuments(user, tutorId) {
        return this.agencies.tutorDocuments(user.id, tutorId);
    }
    uploadTutorDocument(user, tutorId, file, request) {
        return this.agencies.uploadTutorDocument(user.id, tutorId, file, (0, request_context_1.auditContextOf)(request));
    }
    addTutorDocument(user, tutorId, dto, request) {
        return this.agencies.addTutorDocument(user.id, tutorId, dto, (0, request_context_1.auditContextOf)(request));
    }
    async removeTutorDocument(user, tutorId, documentId, request) {
        await this.agencies.removeTutorDocument(user.id, tutorId, documentId, (0, request_context_1.auditContextOf)(request));
    }
    bookings(user, query) {
        return this.agencies.bookings(user.id, query);
    }
    earnings(user) {
        return this.agencies.earnings(user.id);
    }
    payouts(user) {
        return this.agencies.payouts(user.id);
    }
    requestPayout(user, dto, request) {
        return this.agencies.requestPayout(user.id, dto.amount, (0, request_context_1.auditContextOf)(request));
    }
};
exports.AgenciesController = AgenciesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agency_dto_1.UpdateAgencyDto]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('verification/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('tutors'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "roster", null);
__decorate([
    (0, common_1.Post)('tutors'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agency_dto_1.AddAgencyTutorDto, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "addTutor", null);
__decorate([
    (0, common_1.Delete)('tutors/:tutorId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "removeTutor", null);
__decorate([
    (0, common_1.Get)('tutors/:tutorId/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "tutorProfile", null);
__decorate([
    (0, common_1.Patch)('tutors/:tutorId/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, tutor_dto_2.UpdateTutorProfileDto, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "updateTutorProfile", null);
__decorate([
    (0, common_1.Get)('tutors/:tutorId/subjects'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "tutorSubjects", null);
__decorate([
    (0, common_1.Post)('tutors/:tutorId/subjects'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, tutor_dto_2.AddTutorSubjectDto, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "addTutorSubject", null);
__decorate([
    (0, common_1.Delete)('tutors/:tutorId/subjects/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Param)('id', UUID)),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "removeTutorSubject", null);
__decorate([
    (0, common_1.Get)('tutors/:tutorId/availability'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "tutorAvailability", null);
__decorate([
    (0, common_1.Post)('tutors/:tutorId/availability'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, tutor_dto_2.AddAvailabilityWindowDto, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "addTutorWindow", null);
__decorate([
    (0, common_1.Patch)('tutors/:tutorId/availability/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Param)('id', UUID)),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, tutor_dto_2.SetWindowActiveDto, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "setTutorWindowActive", null);
__decorate([
    (0, common_1.Delete)('tutors/:tutorId/availability/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Param)('id', UUID)),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "deleteTutorWindow", null);
__decorate([
    (0, common_1.Get)('tutors/:tutorId/verification'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "tutorVerification", null);
__decorate([
    (0, common_1.Post)('tutors/:tutorId/verification/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "submitTutorVerification", null);
__decorate([
    (0, common_1.Get)('tutors/:tutorId/documents'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "tutorDocuments", null);
__decorate([
    (0, common_1.Post)('tutors/:tutorId/documents/upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "uploadTutorDocument", null);
__decorate([
    (0, common_1.Post)('tutors/:tutorId/documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, tutor_dto_1.AddTutorDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "addTutorDocument", null);
__decorate([
    (0, common_1.Delete)('tutors/:tutorId/documents/:documentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Param)('documentId', UUID)),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "removeTutorDocument", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agency_dto_1.AgencyBookingsQueryDto]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "bookings", null);
__decorate([
    (0, common_1.Get)('earnings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "earnings", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "payouts", null);
__decorate([
    (0, common_1.Post)('payouts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agency_dto_1.AgencyPayoutDto, Object]),
    __metadata("design:returntype", Promise)
], AgenciesController.prototype, "requestPayout", null);
exports.AgenciesController = AgenciesController = __decorate([
    (0, common_1.Controller)('agencies/me'),
    (0, roles_decorator_1.Roles)('agency'),
    (0, roles_decorator_1.RequirePermission)('agency.manage'),
    __metadata("design:paramtypes", [agencies_service_1.AgenciesService])
], AgenciesController);
//# sourceMappingURL=agencies.controller.js.map