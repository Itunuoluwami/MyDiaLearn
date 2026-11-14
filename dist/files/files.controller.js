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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const files_service_1 = require("./files.service");
const uuid = new common_1.ParseUUIDPipe({ version: '4' });
let FilesController = class FilesController {
    files;
    constructor(files) {
        this.files = files;
    }
    uploadTutorDocument(user, file) {
        return this.files.upload(user.id, 'tutor-document', file);
    }
    uploadLearningResource(user, file) {
        return this.files.upload(user.id, 'learning-resource', file);
    }
    uploadSubmission(user, file) {
        return this.files.upload(user.id, 'submission', file);
    }
    tutorDocumentUrl(user, id) {
        return this.files.tutorDocumentUrl(user.id, id);
    }
    learningResourceUrl(user, id) {
        return this.files.learningResourceUrl(user.id, id);
    }
    submissionUrl(user, assignmentId) {
        return this.files.submissionUrl(user.id, assignmentId);
    }
    async download(token, response) {
        const file = await this.files.resolve(token);
        const disposition = file.inline ? 'inline' : 'attachment';
        response.setHeader('Content-Type', file.contentType);
        response.setHeader('Content-Disposition', `${disposition}; filename="${file.downloadName}"; filename*=UTF-8''${encodeURIComponent(file.downloadName)}`);
        if (file.contentType !== 'application/pdf') {
            response.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; sandbox");
        }
        response.setHeader('Cache-Control', 'private, no-store');
        response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        response.sendFile(file.absolutePath, { dotfiles: 'deny' });
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('tutor-documents'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadTutorDocument", null);
__decorate([
    (0, common_1.Post)('learning-resources'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadLearningResource", null);
__decorate([
    (0, common_1.Post)('submissions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadSubmission", null);
__decorate([
    (0, common_1.Get)('tutor-documents/:id/url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', uuid)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "tutorDocumentUrl", null);
__decorate([
    (0, common_1.Get)('learning-resources/:id/url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', uuid)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "learningResourceUrl", null);
__decorate([
    (0, common_1.Get)('submissions/:assignmentId/url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('assignmentId', uuid)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "submissionUrl", null);
__decorate([
    (0, common_1.Get)('signed/:token'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "download", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map