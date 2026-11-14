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
exports.TutorsService = void 0;
exports.toResponse = toResponse;
exports.toSubjectResponse = toSubjectResponse;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const tutors_repository_1 = require("./tutors.repository");
let TutorsService = class TutorsService {
    repository;
    audit;
    constructor(repository, audit) {
        this.repository = repository;
        this.audit = audit;
    }
    async me(userId) {
        return toResponse(await this.repository.ensureOwn(userId));
    }
    async updateMe(userId, dto, context) {
        await this.repository.ensureOwn(userId);
        const updated = await this.repository.updateOwn(userId, dto);
        if (!updated)
            throw new app_exception_1.NotFoundError('Tutor profile');
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            entityType: 'tutor',
            entityId: updated.id,
            context,
            metadata: { fields: Object.keys(dto), scope: 'tutor_profile' },
        });
        return toResponse(updated);
    }
    async subjects(userId) {
        const tutor = await this.repository.ensureOwn(userId);
        const rows = await this.repository.listSubjects(userId, tutor.id);
        return rows.map(toSubjectResponse);
    }
    async replaceSubjects(userId, entries, context) {
        const tutor = await this.repository.ensureOwn(userId);
        const rows = await this.repository.replaceSubjects(userId, tutor.id, entries);
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            entityType: 'tutor',
            entityId: tutor.id,
            context,
            metadata: { scope: 'tutor_subjects', count: rows.length },
        });
        return rows.map(toSubjectResponse);
    }
    async addSubject(userId, subjectId, educationLevelId, context) {
        const tutor = await this.repository.ensureOwn(userId);
        const row = await this.repository.addSubject(userId, tutor.id, subjectId, educationLevelId);
        await this.audit.record('user.profile_updated', {
            actorId: userId,
            entityType: 'tutor',
            entityId: tutor.id,
            context,
            metadata: { scope: 'tutor_subject_added', subjectId },
        });
        return toSubjectResponse(row);
    }
    async removeSubject(userId, id) {
        const ok = await this.repository.removeSubject(userId, id);
        if (!ok)
            throw new app_exception_1.NotFoundError('Tutor subject');
    }
    async dashboard(userId) {
        return this.repository.dashboardSummary(userId);
    }
    async students(userId, query) {
        return this.repository.students(userId, query);
    }
    async reviews(userId, query) {
        return this.repository.reviews(userId, query);
    }
    async ratingSummary(userId) {
        return this.repository.ratingSummary(userId);
    }
    async ratingCategories(userId) {
        return this.repository.ratingCategories(userId);
    }
};
exports.TutorsService = TutorsService;
exports.TutorsService = TutorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tutors_repository_1.TutorsRepository,
        audit_service_1.AuditService])
], TutorsService);
function toResponse(row) {
    return {
        id: row.id,
        profileId: row.profile_id,
        agencyId: row.agency_id,
        headline: row.headline,
        biography: row.biography,
        qualifications: row.qualifications ?? [],
        languages: row.languages ?? [],
        education: row.education ?? [],
        hourlyRate: row.hourly_rate === null ? null : String(row.hourly_rate),
        currency: row.currency,
        yearsExperience: row.years_experience,
        introVideoUrl: row.intro_video_url,
        timezone: row.timezone,
        verificationStatus: row.verification_status,
        isListed: row.is_listed,
        methodology: row.methodology,
        teachingContext: row.teaching_context,
        onboardingStep: row.onboarding_step,
        submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    };
}
function toSubjectResponse(row) {
    return {
        id: row.id,
        subjectId: row.subject_id,
        subjectName: row.subject_name,
        educationLevelId: row.education_level_id,
        levelName: row.level_name,
    };
}
//# sourceMappingURL=tutors.service.js.map