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
exports.TeachingService = void 0;
exports.toLessonNote = toLessonNote;
exports.toAssignment = toAssignment;
exports.toResource = toResource;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../common/exceptions/app.exception");
const storage_interface_1 = require("../integrations/storage/storage.interface");
const notification_dispatch_service_1 = require("../notifications/services/notification-dispatch.service");
const query_dto_1 = require("../shared/query.dto");
const teaching_repository_1 = require("./teaching.repository");
let TeachingService = class TeachingService {
    repository;
    notifications;
    storage;
    constructor(repository, notifications, storage) {
        this.repository = repository;
        this.notifications = notifications;
        this.storage = storage;
    }
    async emailAssignment(assignmentId) {
        try {
            const recipient = await this.repository.assignmentRecipient(assignmentId);
            if (!recipient?.student_email)
                return;
            await this.notifications.dispatchEmail({
                to: recipient.student_email,
                triggerKey: 'assignment.assigned',
                vars: {
                    title: recipient.title,
                    tutor_name: recipient.tutor_name ?? 'Your tutor',
                    due_at: recipient.due_at ? recipient.due_at.toISOString().slice(0, 10) : 'soon',
                },
            });
        }
        catch {
        }
    }
    async lessonNotes(userId, bookingId) {
        const rows = await this.repository.lessonNotesForBooking(userId, bookingId);
        return rows.map(toLessonNote);
    }
    async saveLessonNote(tutorUserId, bookingId, input) {
        const row = await this.repository.upsertLessonNote(tutorUserId, { bookingId, ...input });
        return toLessonNote(row);
    }
    async assignments(userId, query) {
        const { rows, total } = await this.repository.listAssignments(userId, query, {
            studentId: query.studentId,
            status: query.status,
        });
        return (0, query_dto_1.paginate)(rows.map(toAssignment), total, query);
    }
    async assignment(userId, id) {
        const row = await this.repository.findAssignment(userId, id);
        if (!row)
            throw new app_exception_1.NotFoundError('Assignment');
        return toAssignment(row);
    }
    async createAssignment(tutorUserId, input) {
        const row = await this.repository.createAssignment(tutorUserId, input);
        if (row.status === 'assigned')
            await this.emailAssignment(row.id);
        return toAssignment(row);
    }
    async submitAssignment(userId, id, input) {
        if (input.submissionPath &&
            (!input.submissionPath.startsWith(`submissions/${userId}/`) ||
                input.submissionPath.includes('..'))) {
            throw new app_exception_1.NotAuthorizedError('That file does not belong to you.');
        }
        const row = await this.repository.submitAssignment(userId, id, input);
        if (!row)
            throw new app_exception_1.NotFoundError('Assignment');
        return toAssignment(row);
    }
    async reviewAssignment(tutorUserId, id, feedback) {
        const row = await this.repository.reviewAssignment(tutorUserId, id, feedback?.trim() ? feedback.trim() : null);
        if (!row)
            throw new app_exception_1.NotFoundError('Assignment');
        return toAssignment(row);
    }
    async assignDraft(tutorUserId, id) {
        const row = await this.repository.assignDraft(tutorUserId, id);
        if (!row)
            throw new app_exception_1.NotFoundError('Draft assignment');
        await this.emailAssignment(row.id);
        return toAssignment(row);
    }
    async resources(userId, query) {
        const { rows, total } = await this.repository.listResources(userId, query, {
            studentId: query.studentId,
            subjectId: query.subjectId,
        });
        return (0, query_dto_1.paginate)(rows.map(toResource), total, query);
    }
    async createResource(tutorUserId, input) {
        return toResource(await this.repository.createResource(tutorUserId, input));
    }
    async deleteResource(tutorUserId, id) {
        const result = await this.repository.deleteResource(tutorUserId, id);
        if (result === null)
            throw new app_exception_1.NotFoundError('Resource');
        if (!result)
            return;
        try {
            await this.storage.remove('learning-resources', [result]);
        }
        catch {
        }
    }
};
exports.TeachingService = TeachingService;
exports.TeachingService = TeachingService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [teaching_repository_1.TeachingRepository,
        notification_dispatch_service_1.NotificationDispatchService, Object])
], TeachingService);
function toLessonNote(row) {
    return {
        id: row.id,
        bookingId: row.booking_id,
        covered: row.covered,
        understanding: row.understanding,
        improvements: row.improvements,
        nextSteps: row.next_steps,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}
function toAssignment(row) {
    return {
        id: row.id,
        studentId: row.student_id,
        tutorId: row.tutor_id,
        tutorName: row.tutor_name ?? null,
        bookingId: row.booking_id,
        subjectId: row.subject_id,
        subjectName: row.subject_name ?? null,
        studentFirstName: row.student_first_name ?? null,
        studentAvatarUrl: row.student_avatar_url ?? null,
        resourceId: row.resource_id,
        resourceTitle: row.resource_title ?? null,
        title: row.title,
        instructions: row.instructions,
        submissionRequirements: row.submission_requirements,
        dueAt: row.due_at ? row.due_at.toISOString() : null,
        status: row.status,
        submissionText: row.submission_text,
        submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
        feedback: row.feedback,
        reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
    };
}
function toResource(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        resourceType: row.resource_type,
        externalUrl: row.external_url,
        hasFile: row.storage_path !== null,
        subjectId: row.subject_id,
        studentId: row.student_id,
        isShared: row.is_shared,
        tutorId: row.tutor_id,
        tutorName: row.tutor_name ?? null,
        subjectName: row.subject_name ?? null,
        studentFirstName: row.student_first_name ?? null,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=teaching.service.js.map