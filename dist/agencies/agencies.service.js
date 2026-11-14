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
exports.AgenciesService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const database_errors_1 = require("../common/exceptions/database-errors");
const tutor_availability_service_1 = require("../tutors/services/tutor-availability.service");
const tutor_verification_service_1 = require("../tutors/services/tutor-verification.service");
const files_service_1 = require("../files/files.service");
const tutors_service_1 = require("../tutors/tutors.service");
const agencies_repository_1 = require("./agencies.repository");
let AgenciesService = class AgenciesService {
    repository;
    auth;
    tutors;
    availability;
    verification;
    files;
    audit;
    constructor(repository, auth, tutors, availability, verification, files, audit) {
        this.repository = repository;
        this.auth = auth;
        this.tutors = tutors;
        this.availability = availability;
        this.verification = verification;
        this.files = files;
        this.audit = audit;
    }
    async ownAgency(ownerId) {
        const agency = await this.repository.findOrCreateOwn(ownerId);
        if (!agency)
            throw new app_exception_1.NotFoundError('Agency');
        return agency;
    }
    async me(ownerId) {
        const agency = await this.ownAgency(ownerId);
        const steps = await this.repository.verificationSteps(ownerId, agency.id);
        return { ...toAgency(agency), verificationSteps: steps };
    }
    async update(ownerId, dto) {
        await this.ownAgency(ownerId);
        const row = await this.repository.update(ownerId, {
            ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
            ...(dto.registrationNumber !== undefined
                ? { registrationNumber: dto.registrationNumber?.trim() || null }
                : {}),
            ...(dto.countryCode !== undefined
                ? { countryCode: dto.countryCode?.trim().toUpperCase() || null }
                : {}),
            ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail || null } : {}),
            ...(dto.contactPhone !== undefined
                ? { contactPhone: dto.contactPhone?.trim() || null }
                : {}),
            ...(dto.website !== undefined ? { website: dto.website || null } : {}),
            ...(dto.about !== undefined ? { about: dto.about?.trim() || null } : {}),
        });
        if (!row)
            throw new app_exception_1.NotFoundError('Agency');
        return toAgency(row);
    }
    async submitVerification(ownerId, context) {
        const agency = await this.ownAgency(ownerId);
        const status = await this.call(() => this.repository.submitVerification(ownerId));
        await this.audit.record('agency.verification_submitted', {
            actorId: ownerId,
            entityType: 'agency',
            entityId: agency.id,
            context,
            metadata: { status },
        });
        return { status };
    }
    async dashboard(ownerId) {
        const agency = await this.ownAgency(ownerId);
        const [counts, earnings] = await Promise.all([
            this.repository.dashboard(ownerId, agency.id),
            this.repository.earnings(ownerId),
        ]);
        return {
            agency: toAgency(agency),
            counts,
            earnings: earnings ? toEarnings(earnings) : null,
        };
    }
    async roster(ownerId) {
        await this.ownAgency(ownerId);
        const rows = await this.repository.roster(ownerId);
        return rows.map((r) => ({
            tutorId: r['tutor_id'],
            fullName: r['full_name'],
            email: r['email'],
            headline: r['headline'],
            verificationStatus: r['verification_status'],
            isListed: r['is_listed'],
            onboardingStep: r['onboarding_step'],
            submittedAt: r['submitted_at'] ?? null,
            lessonsCompleted: Number(r['lessons_completed'] ?? 0),
            grossAmount: String(r['gross_amount'] ?? '0'),
            tutorEarnings: String(r['tutor_earnings'] ?? '0'),
            agencyEarnings: String(r['agency_earnings'] ?? '0'),
            tutorPaidOut: String(r['tutor_paid_out'] ?? '0'),
            currency: r['currency'],
        }));
    }
    async addTutor(ownerId, input, context) {
        const agency = await this.ownAgency(ownerId);
        const account = await this.auth.provisionAccount({
            email: input.email,
            fullName: input.fullName.trim(),
            role: 'tutor',
            timezone: input.timezone,
        }, { agencyName: agency.name, actorId: ownerId }, context);
        const tutorId = await this.call(() => this.repository.ensureTutorRecord(account.userId));
        await this.call(() => this.repository.attachTutor(ownerId, tutorId));
        await this.audit.record('agency.tutor_added', {
            actorId: ownerId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
            metadata: { agencyId: agency.id, emailed: account.emailed },
        });
        return { tutorId, emailed: account.emailed };
    }
    async removeTutor(ownerId, tutorId, context) {
        if (!(await this.repository.detachTutor(ownerId, tutorId)))
            throw new app_exception_1.NotFoundError('Tutor');
        await this.audit.record('agency.tutor_removed', {
            actorId: ownerId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
        });
    }
    async asTutor(ownerId, tutorId, operation) {
        const profileId = await this.repository.ownedTutorProfile(ownerId, tutorId);
        if (!profileId)
            throw new app_exception_1.NotFoundError('Tutor');
        return operation(profileId);
    }
    async managed(ownerId, tutorId, what, context, operation) {
        const result = await this.asTutor(ownerId, tutorId, operation);
        await this.audit.record('agency.tutor_managed', {
            actorId: ownerId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
            metadata: { what },
        });
        return result;
    }
    tutorProfile(ownerId, tutorId) {
        return this.asTutor(ownerId, tutorId, (pid) => this.tutors.me(pid));
    }
    updateTutorProfile(ownerId, tutorId, dto, context) {
        return this.managed(ownerId, tutorId, 'profile', context, (pid) => this.tutors.updateMe(pid, dto, context));
    }
    tutorSubjects(ownerId, tutorId) {
        return this.asTutor(ownerId, tutorId, (pid) => this.tutors.subjects(pid));
    }
    addTutorSubject(ownerId, tutorId, subjectId, educationLevelId, context) {
        return this.managed(ownerId, tutorId, 'subject_added', context, (pid) => this.tutors.addSubject(pid, subjectId, educationLevelId, context));
    }
    removeTutorSubject(ownerId, tutorId, id, context) {
        return this.managed(ownerId, tutorId, 'subject_removed', context, (pid) => this.tutors.removeSubject(pid, id));
    }
    tutorAvailability(ownerId, tutorId) {
        return this.asTutor(ownerId, tutorId, (pid) => this.availability.listOwn(pid));
    }
    addTutorWindow(ownerId, tutorId, input, context) {
        return this.managed(ownerId, tutorId, 'availability_added', context, (pid) => this.availability.addWindow(pid, input));
    }
    setTutorWindowActive(ownerId, tutorId, id, isActive, context) {
        return this.managed(ownerId, tutorId, 'availability_toggled', context, (pid) => this.availability.setWindowActive(pid, id, isActive));
    }
    deleteTutorWindow(ownerId, tutorId, id, context) {
        return this.managed(ownerId, tutorId, 'availability_removed', context, (pid) => this.availability.deleteWindow(pid, id));
    }
    tutorVerification(ownerId, tutorId) {
        return this.asTutor(ownerId, tutorId, (pid) => this.verification.steps(pid));
    }
    submitTutorVerification(ownerId, tutorId, context) {
        return this.managed(ownerId, tutorId, 'verification_submitted', context, (pid) => this.verification.submit(pid, context));
    }
    tutorDocuments(ownerId, tutorId) {
        return this.asTutor(ownerId, tutorId, (pid) => this.verification.documents(pid));
    }
    uploadTutorDocument(ownerId, tutorId, file, context) {
        return this.managed(ownerId, tutorId, 'document_uploaded', context, (pid) => this.files.upload(pid, 'tutor-document', file));
    }
    addTutorDocument(ownerId, tutorId, dto, context) {
        return this.managed(ownerId, tutorId, 'document_added', context, (pid) => this.verification.addDocument(pid, dto, context));
    }
    removeTutorDocument(ownerId, tutorId, documentId, context) {
        return this.managed(ownerId, tutorId, 'document_removed', context, (pid) => this.verification.removeDocument(pid, documentId, context));
    }
    async bookings(ownerId, query) {
        await this.ownAgency(ownerId);
        return this.repository.bookings(ownerId, {
            status: query.status && query.status !== 'all' ? query.status : null,
            from: query.from ? new Date(query.from) : null,
            to: query.to ? new Date(query.to) : null,
        });
    }
    async earnings(ownerId) {
        await this.ownAgency(ownerId);
        const row = await this.repository.earnings(ownerId);
        return row ? toEarnings(row) : null;
    }
    async payouts(ownerId) {
        await this.ownAgency(ownerId);
        return this.repository.payouts(ownerId);
    }
    async requestPayout(ownerId, amount, context) {
        const agency = await this.ownAgency(ownerId);
        const id = await this.call(() => this.repository.requestPayout(ownerId, amount));
        await this.audit.record('agency.payout_requested', {
            actorId: ownerId,
            entityType: 'payout',
            entityId: id,
            context,
            metadata: { agencyId: agency.id, amount: amount.toFixed(2) },
        });
        return { id };
    }
    async call(operation) {
        try {
            return await operation();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/INSUFFICIENT_BALANCE/.test(message)) {
                throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'That is more than your available balance.', 400);
            }
            if (/AGENCY_LINK_FORBIDDEN|NOT_AN_AGENCY/.test(message)) {
                throw new app_exception_1.NotAuthorizedError('That tutor is not part of your agency.');
            }
            throw (0, database_errors_1.translateDatabaseError)(error, 'We could not complete that for your agency.');
        }
    }
};
exports.AgenciesService = AgenciesService;
exports.AgenciesService = AgenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agencies_repository_1.AgenciesRepository,
        auth_service_1.AuthService,
        tutors_service_1.TutorsService,
        tutor_availability_service_1.TutorAvailabilityService,
        tutor_verification_service_1.TutorVerificationService,
        files_service_1.FilesService,
        audit_service_1.AuditService])
], AgenciesService);
function toAgency(row) {
    return {
        id: row.id,
        name: row.name,
        registrationNumber: row.registration_number,
        countryCode: row.country_code,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        website: row.website,
        about: row.about,
        logoUrl: row.logo_url,
        verificationStatus: row.verification_status,
        isActive: row.is_active,
        revenueSharePercentage: String(row.revenue_share_percentage),
        submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
    };
}
function toEarnings(row) {
    const str = (v) => String(v ?? '0');
    return {
        currency: row['currency'],
        grossRevenue: str(row['gross_revenue']),
        agencyEarnings: str(row['agency_earnings']),
        pendingEarnings: str(row['pending_earnings']),
        paidOut: str(row['paid_out']),
        pendingPayouts: str(row['pending_payouts']),
        availableBalance: str(row['available_balance']),
        revenueSharePercentage: str(row['revenue_share_percentage']),
        minimumPayout: str(row['minimum_payout']),
        nextPayoutDate: row['next_payout_date'] ?? null,
        scheduleLabel: row['schedule_label'] ?? null,
    };
}
//# sourceMappingURL=agencies.service.js.map