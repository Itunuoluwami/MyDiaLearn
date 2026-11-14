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
exports.StudentsService = void 0;
exports.toResponse = toResponse;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const query_dto_1 = require("../shared/query.dto");
const students_repository_1 = require("./students.repository");
let StudentsService = class StudentsService {
    repository;
    audit;
    constructor(repository, audit) {
        this.repository = repository;
        this.audit = audit;
    }
    async list(userId, query) {
        const { rows, total } = await this.repository.list(userId, query);
        return (0, query_dto_1.paginate)(rows.map(toResponse), total, query);
    }
    async me(userId, roles) {
        const row = await this.repository.findOrCreateOwn(userId, roles.includes('student'));
        if (!row)
            throw new app_exception_1.NotFoundError('Student');
        return toResponse(row);
    }
    async findOne(userId, id) {
        const row = await this.repository.findById(userId, id);
        if (!row)
            throw new app_exception_1.NotFoundError('Student');
        return toResponse(row);
    }
    async create(parentUserId, dto, context) {
        const row = await this.repository.create(parentUserId, dto);
        await this.audit.record('user.profile_updated', {
            actorId: parentUserId,
            entityType: 'student',
            entityId: row.id,
            context,
            metadata: {
                scope: 'student_created',
                canSelfLogin: row.can_self_login,
                canBookLessons: row.can_book_lessons,
                canMessageTutors: row.can_message_tutors,
            },
        });
        return toResponse(row);
    }
    async update(userId, id, dto, context) {
        const row = await this.repository.update(userId, id, dto);
        if (!row)
            throw new app_exception_1.NotFoundError('Student');
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            entityType: 'student',
            entityId: id,
            context,
            metadata: { scope: 'student_updated', fields: Object.keys(dto) },
        });
        return toResponse(row);
    }
    async deactivate(userId, id, context) {
        const ok = await this.repository.deactivate(userId, id);
        if (!ok)
            throw new app_exception_1.NotFoundError('Student');
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            entityType: 'student',
            entityId: id,
            context,
            metadata: { scope: 'student_deactivated' },
        });
    }
    async progress(userId, studentId) {
        return this.repository.progress(userId, studentId);
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [students_repository_1.StudentsRepository,
        audit_service_1.AuditService])
], StudentsService);
function toResponse(row) {
    return {
        id: row.id,
        profileId: row.profile_id,
        parentId: row.parent_id,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : null,
        gender: row.gender,
        curriculumId: row.curriculum_id,
        curriculumName: row.curriculum_name ?? null,
        educationLevelId: row.education_level_id,
        educationLevelName: row.education_level_name ?? null,
        schoolName: row.school_name,
        learningGoals: row.learning_goals,
        specialNeeds: row.special_needs,
        timezone: row.timezone,
        avatarUrl: row.avatar_url,
        canSelfLogin: row.can_self_login,
        canBookLessons: row.can_book_lessons,
        canMessageTutors: row.can_message_tutors,
        isActive: row.is_active,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=students.service.js.map