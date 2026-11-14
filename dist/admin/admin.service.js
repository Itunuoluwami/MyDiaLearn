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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit/audit.service");
const notification_dispatch_service_1 = require("../notifications/services/notification-dispatch.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const admin_errors_1 = require("./admin-errors");
const admin_repository_1 = require("./admin.repository");
let AdminService = class AdminService {
    repository;
    audit;
    notifications;
    constructor(repository, audit, notifications) {
        this.repository = repository;
        this.audit = audit;
        this.notifications = notifications;
    }
    async tellTutor(adminId, tutorId, triggerKey, vars = {}, stepId) {
        try {
            const recipient = await this.repository.verificationRecipient(tutorId, stepId);
            if (!recipient)
                return;
            await this.notifications.dispatch({
                actorId: adminId,
                userId: recipient.tutor_user_id,
                ...(recipient.tutor_email ? { email: recipient.tutor_email } : {}),
                triggerKey,
                vars: { step_name: recipient.step_name ?? 'verification', ...vars },
                link: '/tutor/verification',
            });
        }
        catch {
        }
    }
    async dashboard(adminId) {
        return this.repository.dashboardSummary(adminId);
    }
    async users(adminId, query) {
        const rows = await this.repository.listUsers(adminId, {
            ...(query.search?.trim() ? { search: query.search.trim() } : {}),
            ...(query.role ? { role: query.role } : {}),
            ...(query.from ? { from: new Date(query.from) } : {}),
            ...(query.to ? { to: new Date(query.to) } : {}),
        });
        return rows.map((row) => ({
            id: row.id,
            fullName: row.full_name,
            email: row.email,
            primaryRole: row.primary_role,
            isActive: row.is_active,
            onboardingCompleted: row.onboarding_completed,
            createdAt: row.created_at.toISOString(),
            roles: row.roles ?? [],
        }));
    }
    async requestSuspension(adminId, profileId, isActive) {
        return this.submit(adminId, 'profile.suspend', {
            profile_id: profileId,
            is_active: isActive,
        });
    }
    async verificationQueue(adminId, status) {
        const rows = await this.repository.verificationQueue(adminId, status);
        return rows.map((row) => ({
            id: row.id,
            profileId: row.profile_id,
            headline: row.headline,
            verificationStatus: row.verification_status,
            isListed: row.is_listed,
            submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
            yearsExperience: row.years_experience,
            hourlyRate: row.hourly_rate === null ? null : String(row.hourly_rate),
            currency: row.currency,
            fullName: row.full_name,
            email: row.email,
            avatarUrl: row.avatar_url,
            agencyName: row.agency_name,
        }));
    }
    async verificationDetail(adminId, tutorId) {
        return this.repository.verificationDetail(adminId, tutorId);
    }
    async reviewStep(adminId, input) {
        try {
            await this.repository.reviewStep(adminId, {
                tutorId: input.tutorId,
                stepId: input.stepId,
                status: input.status,
                reviewerNotes: input.reviewerNotes?.trim() || null,
            });
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not save that review.');
        }
        await this.tellTutor(adminId, input.tutorId, 'tutor.verification_updated', { status: input.status }, input.stepId);
    }
    async reviewDocument(adminId, input) {
        const found = await this.repository.reviewDocument(adminId, {
            documentId: input.documentId,
            status: input.status,
            reviewerNotes: input.reviewerNotes?.trim() || null,
        });
        if (!found)
            throw new app_exception_1.NotFoundError('Document');
    }
    async approveTutor(adminId, tutorId, context) {
        if (!(await this.repository.setTutorVerification(adminId, tutorId, 'verified'))) {
            throw new app_exception_1.NotFoundError('Tutor');
        }
        await this.audit.record('tutor.verification_approved', {
            actorId: adminId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
        });
        await this.tellTutor(adminId, tutorId, 'tutor.verification_approved');
    }
    async rejectTutor(adminId, tutorId, reason, context) {
        if (!(await this.repository.setTutorVerification(adminId, tutorId, 'rejected'))) {
            throw new app_exception_1.NotFoundError('Tutor');
        }
        await this.audit.record('tutor.verification_rejected', {
            actorId: adminId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
            metadata: { hasReason: Boolean(reason?.trim()) },
        });
        await this.tellTutor(adminId, tutorId, 'tutor.verification_rejected');
    }
    async setHourlyRate(adminId, tutorId, hourlyRate, context) {
        let result;
        try {
            result = await this.repository.setHourlyRate(adminId, tutorId, hourlyRate);
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not change that rate.');
        }
        if (!result)
            throw new app_exception_1.NotFoundError('Tutor');
        await this.audit.record('tutor.rate_changed', {
            actorId: adminId,
            entityType: 'tutor',
            entityId: tutorId,
            context,
            metadata: {
                from: result.previous === null ? null : String(result.previous),
                to: hourlyRate.toFixed(2),
                currency: result.currency,
            },
        });
    }
    async bookings(adminId, query) {
        return this.repository.listBookings(adminId, {
            ...(query.search?.trim() ? { search: query.search.trim() } : {}),
            ...(query.status && query.status !== 'all' ? { status: query.status } : {}),
            ...(query.from ? { from: new Date(query.from) } : {}),
            ...(query.to ? { to: new Date(query.to) } : {}),
        });
    }
    async overrideBookingStatus(adminId, bookingId, status) {
        let found;
        try {
            found = await this.repository.setBookingStatus(adminId, bookingId, status);
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not change that booking.');
        }
        if (!found)
            throw new app_exception_1.NotFoundError('Booking');
    }
    async requestCancellation(adminId, bookingId, input) {
        return this.submit(adminId, 'booking.cancel_with_refund', {
            booking_id: bookingId,
            reason: input.reason,
            refund_percentage: input.refundPercentage ?? null,
        });
    }
    async payments(adminId, query) {
        return this.repository.listPayments(adminId, {
            ...(query.status ? { status: query.status } : {}),
            ...(query.from ? { from: new Date(query.from) } : {}),
            ...(query.to ? { to: new Date(query.to) } : {}),
        });
    }
    async requestRefund(adminId, paymentId, input) {
        return this.submit(adminId, 'payment.refund', {
            payment_id: paymentId,
            amount: input.amount,
            reason: input.reason?.trim() || null,
        });
    }
    async payouts(adminId, status) {
        return this.repository.listPayouts(adminId, status);
    }
    async requestPayoutSettlement(adminId, payoutId) {
        return this.submit(adminId, 'payout.settle', { payout_id: payoutId });
    }
    async rejectPayout(adminId, payoutId, notes) {
        try {
            await this.repository.rejectPayout(adminId, payoutId, notes?.trim() || null);
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not reject that payout.');
        }
    }
    async disputes(adminId, status) {
        return this.repository.listDisputes(adminId, status);
    }
    async resolveDispute(adminId, disputeId, input, context) {
        try {
            await this.repository.resolveDispute(adminId, {
                disputeId,
                status: input.status,
                notes: input.notes?.trim() || null,
            });
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not update that dispute.');
        }
        await this.audit.record('dispute.resolved', {
            actorId: adminId,
            entityType: 'dispute',
            entityId: disputeId,
            context,
            metadata: { status: input.status },
        });
    }
    async submit(adminId, action, payload) {
        try {
            return { requestId: await this.repository.requestAction(adminId, action, payload) };
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not submit that request.');
        }
    }
    async reviews(adminId, published) {
        return this.repository.listReviews(adminId, published);
    }
    async setReviewPublished(adminId, id, isPublished) {
        if (!(await this.repository.setReviewPublished(adminId, id, isPublished))) {
            throw new app_exception_1.NotFoundError('Review');
        }
    }
    async messages(adminId, search) {
        return this.repository.searchMessages(adminId, search.trim());
    }
    async setMessageHidden(adminId, id, input) {
        const found = await this.repository.setMessageHidden(adminId, id, input.isHidden, input.reason?.trim() || null);
        if (!found)
            throw new app_exception_1.NotFoundError('Message');
    }
    async report(adminId, from, to) {
        return this.repository.reportSummary(adminId, new Date(from), new Date(to));
    }
    async agencies(adminId, status) {
        return this.repository.listAgencies(adminId, status);
    }
    async agency(adminId, agencyId) {
        const detail = await this.repository.agencyDetail(adminId, agencyId);
        if (!detail.agency)
            throw new app_exception_1.NotFoundError('Agency');
        return detail;
    }
    async reviewAgencyStep(adminId, input) {
        try {
            await this.repository.reviewAgencyStep(adminId, {
                agencyId: input.agencyId,
                stepId: input.stepId,
                status: input.status,
                reviewerNotes: input.reviewerNotes?.trim() || null,
            });
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not save that review.');
        }
    }
    async decideAgency(adminId, agencyId, input, context) {
        if (!(await this.repository.setAgencyStatus(adminId, agencyId, input.status))) {
            throw new app_exception_1.NotFoundError('Agency');
        }
        await this.audit.record('agency.verification_reviewed', {
            actorId: adminId,
            entityType: 'agency',
            entityId: agencyId,
            context,
            metadata: { status: input.status, hasReason: Boolean(input.reason?.trim()) },
        });
    }
    async setAgencyShare(adminId, agencyId, share, context) {
        const result = await this.repository.setAgencyShare(adminId, agencyId, share);
        if (!result)
            throw new app_exception_1.NotFoundError('Agency');
        await this.audit.record('admin.settings_changed', {
            actorId: adminId,
            entityType: 'agency',
            entityId: agencyId,
            context,
            metadata: { scope: 'agency_revenue_share', from: result.previous, to: share.toFixed(2) },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository,
        audit_service_1.AuditService,
        notification_dispatch_service_1.NotificationDispatchService])
], AdminService);
//# sourceMappingURL=admin.service.js.map