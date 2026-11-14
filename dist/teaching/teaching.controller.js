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
exports.TeachingController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const teaching_dto_1 = require("./dto/teaching.dto");
const teaching_service_1 = require("./teaching.service");
let TeachingController = class TeachingController {
    teaching;
    constructor(teaching) {
        this.teaching = teaching;
    }
    lessonNotes(user, bookingId) {
        return this.teaching.lessonNotes(user.id, bookingId);
    }
    saveLessonNote(user, bookingId, dto) {
        return this.teaching.saveLessonNote(user.id, bookingId, dto);
    }
    assignments(user, query) {
        return this.teaching.assignments(user.id, query);
    }
    createAssignment(user, dto) {
        return this.teaching.createAssignment(user.id, dto);
    }
    assignment(user, id) {
        return this.teaching.assignment(user.id, id);
    }
    submit(user, id, dto) {
        return this.teaching.submitAssignment(user.id, id, dto);
    }
    assign(user, id) {
        return this.teaching.assignDraft(user.id, id);
    }
    review(user, id, dto) {
        return this.teaching.reviewAssignment(user.id, id, dto.feedback);
    }
    resources(user, query) {
        return this.teaching.resources(user.id, query);
    }
    createResource(user, dto) {
        return this.teaching.createResource(user.id, dto);
    }
    async deleteResource(user, id) {
        await this.teaching.deleteResource(user.id, id);
    }
};
exports.TeachingController = TeachingController;
__decorate([
    (0, common_1.Get)('bookings/:bookingId/lesson-notes'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "lessonNotes", null);
__decorate([
    (0, common_1.Put)('bookings/:bookingId/lesson-notes'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, teaching_dto_1.UpsertLessonNoteDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "saveLessonNote", null);
__decorate([
    (0, common_1.Get)('assignments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, teaching_dto_1.ListAssignmentsQueryDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "assignments", null);
__decorate([
    (0, common_1.Post)('assignments'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, teaching_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('assignments/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "assignment", null);
__decorate([
    (0, common_1.Post)('assignments/:id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, teaching_dto_1.SubmitAssignmentDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('assignments/:id/assign'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('assignments/:id/review'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, teaching_dto_1.ReviewAssignmentDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "review", null);
__decorate([
    (0, common_1.Get)('learning-resources'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, teaching_dto_1.ListResourcesQueryDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "resources", null);
__decorate([
    (0, common_1.Post)('learning-resources'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, teaching_dto_1.CreateResourceDto]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "createResource", null);
__decorate([
    (0, common_1.Delete)('learning-resources/:id'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeachingController.prototype, "deleteResource", null);
exports.TeachingController = TeachingController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [teaching_service_1.TeachingService])
], TeachingController);
//# sourceMappingURL=teaching.controller.js.map