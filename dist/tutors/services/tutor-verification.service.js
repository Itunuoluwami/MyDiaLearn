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
exports.TutorVerificationService = void 0;
exports.translateVerificationError = translateVerificationError;
exports.toStepResponse = toStepResponse;
exports.toDocumentResponse = toDocumentResponse;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const storage_interface_1 = require("../../integrations/storage/storage.interface");
const tutor_verification_repository_1 = require("../tutor-verification.repository");
const tutors_repository_1 = require("../tutors.repository");
const DOCUMENTS_BUCKET = 'tutor-documents';
let TutorVerificationService = class TutorVerificationService {
    repository;
    tutors;
    audit;
    storage;
    constructor(repository, tutors, audit, storage) {
        this.repository = repository;
        this.tutors = tutors;
        this.audit = audit;
        this.storage = storage;
    }
    async steps(userId) {
        const tutor = await this.tutors.ensureOwn(userId);
        const rows = await this.repository.steps(userId, tutor.id);
        return rows.map(toStepResponse);
    }
    async documents(userId) {
        const tutor = await this.tutors.ensureOwn(userId);
        const rows = await this.repository.documents(userId, tutor.id);
        return rows.map(toDocumentResponse);
    }
    async addDocument(userId, dto, context) {
        const tutor = await this.tutors.ensureOwn(userId);
        assertOwnedPath(dto.storagePath, tutor.id);
        const row = await this.repository.addDocument(userId, {
            tutorId: tutor.id,
            stepId: dto.stepId,
            label: dto.label,
            storagePath: dto.storagePath,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
        });
        await this.audit.record('tutor.document_uploaded', {
            actorId: userId,
            entityType: 'tutor_document',
            entityId: row.id,
            context,
            metadata: { tutorId: tutor.id, label: dto.label, stepId: dto.stepId ?? null },
        });
        return toDocumentResponse(row);
    }
    async removeDocument(userId, documentId, context) {
        const storagePath = await this.repository.removeDocument(userId, documentId);
        if (!storagePath)
            throw new app_exception_1.NotFoundError('Document');
        try {
            await this.storage.remove(DOCUMENTS_BUCKET, [storagePath]);
        }
        catch {
        }
        await this.audit.record('tutor.document_removed', {
            actorId: userId,
            entityType: 'tutor_document',
            entityId: documentId,
            context,
        });
    }
    async submit(userId, context) {
        const tutor = await this.tutors.ensureOwn(userId);
        let status;
        try {
            status = await this.repository.submit(userId);
        }
        catch (error) {
            throw translateVerificationError(error);
        }
        await this.audit.record('tutor.verification_submitted', {
            actorId: userId,
            entityType: 'tutor',
            entityId: tutor.id,
            context,
            metadata: { status },
        });
        return { status };
    }
};
exports.TutorVerificationService = TutorVerificationService;
exports.TutorVerificationService = TutorVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [tutor_verification_repository_1.TutorVerificationRepository,
        tutors_repository_1.TutorsRepository,
        audit_service_1.AuditService, Object])
], TutorVerificationService);
function assertOwnedPath(storagePath, tutorId) {
    if (!storagePath.startsWith(`${tutorId}/`) || storagePath.includes('..')) {
        throw new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'That document does not belong to your profile.', 403);
    }
}
function translateVerificationError(error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/NOT_A_TUTOR/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'This action is for tutors.', 403);
    }
    if (/INCOMPLETE|MISSING_STEP|REQUIRED/i.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'Please complete every required verification step before submitting.', 400);
    }
    if (/ALREADY_SUBMITTED|IN_REVIEW/i.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'Your verification is already under review.', 409);
    }
    return new app_exception_1.AppException(app_exception_1.ErrorCode.INTERNAL_ERROR, 'We could not submit your verification.', 500);
}
function toStepResponse(row) {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        isRequired: row.is_required,
        sortOrder: row.sort_order,
        status: row.status,
        reviewerNotes: row.reviewer_notes,
        reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    };
}
function toDocumentResponse(row) {
    return {
        id: row.id,
        stepId: row.step_id,
        label: row.label,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        status: row.status,
        reviewerNotes: row.reviewer_notes,
        reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=tutor-verification.service.js.map