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
exports.TutorsController = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../common/audit/request-context");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const tutor_dto_1 = require("./dto/tutor.dto");
const tutor_availability_service_1 = require("./services/tutor-availability.service");
const tutor_verification_service_1 = require("./services/tutor-verification.service");
const tutors_service_1 = require("./tutors.service");
let TutorsController = class TutorsController {
    tutors;
    availability;
    verification;
    constructor(tutors, availability, verification) {
        this.tutors = tutors;
        this.availability = availability;
        this.verification = verification;
    }
    me(user) {
        return this.tutors.me(user.id);
    }
    updateMe(user, dto, request) {
        return this.tutors.updateMe(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    dashboard(user) {
        return this.tutors.dashboard(user.id);
    }
    subjects(user) {
        return this.tutors.subjects(user.id);
    }
    addSubject(user, dto, request) {
        return this.tutors.addSubject(user.id, dto.subjectId, dto.educationLevelId, (0, request_context_1.auditContextOf)(request));
    }
    async removeSubject(user, id) {
        await this.tutors.removeSubject(user.id, id);
    }
    replaceSubjects(user, dto, request) {
        return this.tutors.replaceSubjects(user.id, dto.subjects, (0, request_context_1.auditContextOf)(request));
    }
    availabilityOwn(user) {
        return this.availability.listOwn(user.id);
    }
    addWindow(user, dto) {
        return this.availability.addWindow(user.id, dto);
    }
    async setWindowActive(user, id, dto) {
        await this.availability.setWindowActive(user.id, id, dto.isActive);
    }
    async deleteWindow(user, id) {
        await this.availability.deleteWindow(user.id, id);
    }
    replaceAvailability(user, dto) {
        return this.availability.replaceOwn(user.id, dto.windows);
    }
    verificationSteps(user) {
        return this.verification.steps(user.id);
    }
    documents(user) {
        return this.verification.documents(user.id);
    }
    addDocument(user, dto, request) {
        return this.verification.addDocument(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async removeDocument(user, id, request) {
        await this.verification.removeDocument(user.id, id, (0, request_context_1.auditContextOf)(request));
    }
    submitVerification(user, request) {
        return this.verification.submit(user.id, (0, request_context_1.auditContextOf)(request));
    }
    students(user, query) {
        return this.tutors.students(user.id, query);
    }
    reviews(user, query) {
        return this.tutors.reviews(user.id, query);
    }
    ratingSummary(user) {
        return this.tutors.ratingSummary(user.id);
    }
    ratingCategories(user) {
        return this.tutors.ratingCategories(user.id);
    }
    availabilityFor(id) {
        return this.availability.listPublic(id);
    }
};
exports.TutorsController = TutorsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.UpdateTutorProfileDto, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('me/dashboard'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('me/subjects'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "subjects", null);
__decorate([
    (0, common_1.Post)('me/subjects'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.AddTutorSubjectDto, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "addSubject", null);
__decorate([
    (0, common_1.Delete)('me/subjects/:id'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "removeSubject", null);
__decorate([
    (0, common_1.Put)('me/subjects'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.ReplaceTutorSubjectsDto, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "replaceSubjects", null);
__decorate([
    (0, common_1.Get)('me/availability'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "availabilityOwn", null);
__decorate([
    (0, common_1.Post)('me/availability/window'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.AddAvailabilityWindowDto]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "addWindow", null);
__decorate([
    (0, common_1.Patch)('me/availability/:id'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, tutor_dto_1.SetWindowActiveDto]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "setWindowActive", null);
__decorate([
    (0, common_1.Delete)('me/availability/:id'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "deleteWindow", null);
__decorate([
    (0, common_1.Put)('me/availability'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.ReplaceAvailabilityDto]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "replaceAvailability", null);
__decorate([
    (0, common_1.Get)('me/verification'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "verificationSteps", null);
__decorate([
    (0, common_1.Get)('me/documents'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "documents", null);
__decorate([
    (0, common_1.Post)('me/documents'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.AddTutorDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Delete)('me/documents/:id'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "removeDocument", null);
__decorate([
    (0, common_1.Post)('me/verification/submit'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "submitVerification", null);
__decorate([
    (0, common_1.Get)('me/students'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.TutorListQueryDto]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "students", null);
__decorate([
    (0, common_1.Get)('me/reviews'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tutor_dto_1.TutorListQueryDto]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "reviews", null);
__decorate([
    (0, common_1.Get)('me/ratings/summary'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "ratingSummary", null);
__decorate([
    (0, common_1.Get)('me/ratings/categories'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "ratingCategories", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "availabilityFor", null);
exports.TutorsController = TutorsController = __decorate([
    (0, common_1.Controller)('tutors'),
    __metadata("design:paramtypes", [tutors_service_1.TutorsService,
        tutor_availability_service_1.TutorAvailabilityService,
        tutor_verification_service_1.TutorVerificationService])
], TutorsController);
//# sourceMappingURL=tutors.controller.js.map