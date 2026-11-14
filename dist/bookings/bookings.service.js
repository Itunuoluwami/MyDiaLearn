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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
exports.toResponse = toResponse;
exports.translateBookingError = translateBookingError;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const database_errors_1 = require("../common/exceptions/database-errors");
const classroom_interface_1 = require("../integrations/classroom/classroom.interface");
const notification_dispatch_service_1 = require("../notifications/services/notification-dispatch.service");
const platform_settings_service_1 = require("../platform-settings/platform-settings.service");
const query_dto_1 = require("../shared/query.dto");
const bookings_repository_1 = require("./bookings.repository");
let BookingsService = BookingsService_1 = class BookingsService {
    repository;
    settings;
    audit;
    notifications;
    classroom;
    constructor(repository, settings, audit, notifications, classroom) {
        this.repository = repository;
        this.settings = settings;
        this.audit = audit;
        this.notifications = notifications;
        this.classroom = classroom;
    }
    static describe(ctx, timezone) {
        return {
            subject: ctx.subject_name ?? 'lesson',
            starts_at: new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: timezone,
            }).format(ctx.starts_at),
        };
    }
    async notifySafely(run) {
        try {
            await run();
        }
        catch {
        }
    }
    async create(callerId, dto, context) {
        const startsAt = new Date(dto.startsAt);
        await this.assertBookableWindow(startsAt, dto.durationMinutes);
        let row;
        try {
            row = await this.repository.createWithQuote(callerId, {
                studentId: dto.studentId,
                tutorId: dto.tutorId,
                subjectId: dto.subjectId,
                educationLevelId: dto.educationLevelId,
                startsAt,
                durationMinutes: dto.durationMinutes,
                timezone: dto.timezone,
                studentNotes: dto.studentNotes,
            });
        }
        catch (error) {
            throw translateBookingError(error);
        }
        await this.audit.record('booking.created', {
            actorId: callerId,
            entityType: 'booking',
            entityId: row.id,
            context,
            metadata: {
                tutorId: row.tutor_id,
                studentId: row.student_id,
                startsAt: row.starts_at.toISOString(),
                durationMinutes: row.duration_minutes,
                totalAmount: String(row.total_amount),
                currency: row.currency,
            },
        });
        await this.notifySafely(async () => {
            const ctx = await this.repository.notificationContext(row.id);
            if (!ctx)
                return;
            await this.notifications.dispatch({
                actorId: callerId,
                userId: ctx.tutor_user_id,
                ...(ctx.tutor_email ? { email: ctx.tutor_email } : {}),
                triggerKey: 'booking.created',
                vars: {
                    student_name: ctx.student_name,
                    ...BookingsService_1.describe(ctx, ctx.tutor_timezone),
                },
                link: '/tutor/classes',
            });
        });
        return toResponse(row);
    }
    async list(userId, query) {
        const { rows, total } = await this.repository.list(userId, query, {
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });
        return (0, query_dto_1.paginate)(rows.map(toResponse), total, query);
    }
    async findOne(userId, id) {
        const row = await this.repository.findById(userId, id);
        if (!row)
            throw new app_exception_1.NotFoundError('Booking');
        return toResponse(row);
    }
    async availableSlots(callerId, input) {
        const [minNoticeHours, maxAdvanceDays] = await Promise.all([
            this.settings.minNoticeHours(),
            this.settings.maxAdvanceDays(),
        ]);
        const earliest = Date.now() + minNoticeHours * 3_600_000;
        const latest = Date.now() + maxAdvanceDays * 86_400_000;
        const slots = await this.repository.availableSlots(callerId, {
            tutorId: input.tutorId,
            from: input.from ? new Date(input.from) : new Date(earliest),
            days: input.days,
            durationMinutes: input.durationMinutes,
        });
        return slots
            .filter((slot) => {
            const at = slot.starts_at.getTime();
            return at >= earliest && at <= latest;
        })
            .map((slot) => ({
            startsAt: slot.starts_at.toISOString(),
            endsAt: slot.ends_at.toISOString(),
        }));
    }
    async respond(tutorUserId, bookingId, accept, context) {
        let status;
        try {
            status = await this.repository.respond(tutorUserId, bookingId, accept);
        }
        catch (error) {
            throw translateBookingError(error);
        }
        await this.audit.record(accept ? 'booking.accepted' : 'booking.declined', {
            actorId: tutorUserId,
            entityType: 'booking',
            entityId: bookingId,
            context,
            metadata: { status },
        });
        if (accept && status === 'confirmed') {
            await this.notifySafely(() => this.announceConfirmed(tutorUserId, bookingId));
        }
        return { status };
    }
    async announceConfirmed(actorId, bookingId) {
        const ctx = await this.repository.notificationContext(bookingId);
        if (!ctx)
            return;
        const described = BookingsService_1.describe(ctx, ctx.booking_timezone);
        const emailVars = {
            tutor_name: ctx.tutor_name ?? 'Your tutor',
            student_name: ctx.student_name,
            ...described,
        };
        const recipients = new Map();
        recipients.set(ctx.booker_user_id, { email: ctx.booker_email, link: '/bookings' });
        if (ctx.student_user_id && ctx.student_user_id !== ctx.booker_user_id) {
            recipients.set(ctx.student_user_id, {
                email: ctx.student_email,
                link: '/student/history',
            });
        }
        else if (ctx.student_user_id === ctx.booker_user_id) {
            recipients.set(ctx.booker_user_id, {
                email: ctx.booker_email,
                link: '/student/history',
            });
        }
        for (const [userId, recipient] of recipients) {
            await this.notifications.dispatch({
                actorId,
                userId,
                ...(recipient.email ? { email: recipient.email } : {}),
                triggerKey: 'booking.confirmed',
                vars: { counterpart: ctx.tutor_name ?? 'your tutor', ...described, ...emailVars },
                link: recipient.link,
            });
        }
    }
    async rate(userId, bookingId, input) {
        let outcome;
        try {
            outcome = await this.repository.rate(userId, bookingId, input);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/23505|ratings_booking_id_key|duplicate key/i.test(message)) {
                throw new app_exception_1.ConflictError('This lesson has already been rated.');
            }
            throw (0, database_errors_1.translateDatabaseError)(error, 'We could not save that rating.');
        }
        if (outcome === 'not_found')
            throw new app_exception_1.NotFoundError('Booking');
        if (outcome === 'not_completed') {
            throw new app_exception_1.ConflictError('Only a completed lesson can be rated.');
        }
    }
    async cancelByFamily(userId, bookingId, reason, context) {
        const outcome = await this.repository.cancelByFamily(userId, bookingId, reason?.trim() || 'Cancelled by parent');
        if (outcome === 'not_found')
            throw new app_exception_1.NotFoundError('Booking');
        if (outcome === 'not_cancellable') {
            throw new app_exception_1.ConflictError('Only an unpaid lesson that is still pending can be cancelled here. Contact support for a paid lesson.');
        }
        await this.audit.record('booking.cancelled', {
            actorId: userId,
            entityType: 'booking',
            entityId: bookingId,
            context,
            metadata: { by: 'family' },
        });
        await this.notifySafely(async () => {
            const ctx = await this.repository.notificationContext(bookingId);
            if (!ctx)
                return;
            await this.notifications.dispatch({
                actorId: userId,
                userId: ctx.tutor_user_id,
                ...(ctx.tutor_email ? { email: ctx.tutor_email } : {}),
                triggerKey: 'booking.cancelled',
                vars: {
                    ...BookingsService_1.describe(ctx, ctx.tutor_timezone),
                    refund_note: 'No payment had been taken.',
                },
                link: '/tutor/classes',
            });
        });
    }
    myRatings(userId) {
        return this.repository.myRatings(userId);
    }
    async raiseDispute(userId, bookingId, input, context) {
        let id;
        try {
            id = await this.repository.raiseDispute(userId, bookingId, {
                category: input.category,
                description: input.description.trim(),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/DESCRIPTION_REQUIRED/.test(message)) {
                throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'Please describe what went wrong.', 400);
            }
            throw translateBookingError(error);
        }
        await this.audit.record('dispute.raised', {
            actorId: userId,
            entityType: 'dispute',
            entityId: id,
            context,
            metadata: { bookingId, category: input.category },
        });
        return { id };
    }
    async tutorSchedule(tutorUserId, input) {
        return this.repository.tutorSchedule(tutorUserId, {
            from: input.from ? new Date(input.from) : undefined,
            to: input.to ? new Date(input.to) : undefined,
            statuses: input.statuses?.length ? input.statuses : undefined,
        });
    }
    async openClass(tutorUserId, bookingId) {
        const session = await this.repository.openClass(tutorUserId, bookingId);
        if (!session)
            throw new app_exception_1.NotFoundError('Class');
        if (!this.classroom.isEnabled() || session['meeting_url'])
            return session;
        try {
            const room = await this.classroom.createSession({
                bookingId,
                startsAt: new Date(String(session['starts_at'])),
                durationMinutes: Number(session['duration_minutes'] ?? 60),
                hostName: String(session['tutor_name'] ?? 'DiaLearn tutor'),
                ...(session['subject_name'] ? { subject: String(session['subject_name']) } : {}),
            });
            await this.repository.setMeetingRoom(bookingId, room.joinUrl, room.provider);
            return {
                ...session,
                meeting_url: room.hostUrl ?? room.joinUrl,
                meeting_provider: room.provider,
            };
        }
        catch {
            return session;
        }
    }
    async joinClass(userId, bookingId) {
        const session = await this.repository.joinClass(userId, bookingId);
        if (!session)
            throw new app_exception_1.NotFoundError('Class');
        return session;
    }
    async startClass(tutorUserId, bookingId, context) {
        try {
            await this.repository.startClass(tutorUserId, bookingId);
        }
        catch (error) {
            throw translateBookingError(error);
        }
        await this.audit.record('booking.class_started', {
            actorId: tutorUserId,
            entityType: 'booking',
            entityId: bookingId,
            context,
        });
    }
    async endClass(tutorUserId, bookingId, studentAttended, context) {
        try {
            await this.repository.endClass(tutorUserId, bookingId, studentAttended);
        }
        catch (error) {
            throw translateBookingError(error);
        }
        await this.audit.record('booking.class_ended', {
            actorId: tutorUserId,
            entityType: 'booking',
            entityId: bookingId,
            context,
            metadata: { studentAttended: studentAttended ?? null },
        });
        if (this.classroom.isEnabled()) {
            await this.classroom.endSession(bookingId).catch(() => undefined);
        }
    }
    async assertBookableWindow(startsAt, durationMinutes) {
        const [minNoticeHours, maxAdvanceDays, allowedDurations] = await Promise.all([
            this.settings.minNoticeHours(),
            this.settings.maxAdvanceDays(),
            this.settings.allowedDurations(),
        ]);
        if (!allowedDurations.includes(durationMinutes)) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `Lessons must be one of ${allowedDurations.join(', ')} minutes.`, 400, { allowedDurations });
        }
        const noticeMs = minNoticeHours * 3_600_000;
        if (startsAt.getTime() - Date.now() < noticeMs) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `Lessons must be booked at least ${minNoticeHours} hours in advance.`, 400, { minNoticeHours });
        }
        const horizonMs = maxAdvanceDays * 86_400_000;
        if (startsAt.getTime() - Date.now() > horizonMs) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `Lessons cannot be booked more than ${maxAdvanceDays} days ahead.`, 400, { maxAdvanceDays });
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(classroom_interface_1.CLASSROOM_PROVIDER)),
    __metadata("design:paramtypes", [bookings_repository_1.BookingsRepository,
        platform_settings_service_1.PlatformSettingsService,
        audit_service_1.AuditService,
        notification_dispatch_service_1.NotificationDispatchService, Object])
], BookingsService);
function toResponse(row) {
    return {
        id: row.id,
        studentId: row.student_id,
        tutorId: row.tutor_id,
        bookedBy: row.booked_by,
        subjectId: row.subject_id,
        educationLevelId: row.education_level_id,
        startsAt: row.starts_at.toISOString(),
        endsAt: row.ends_at.toISOString(),
        durationMinutes: row.duration_minutes,
        timezone: row.booking_timezone,
        hourlyRate: String(row.hourly_rate),
        currency: row.currency,
        totalAmount: String(row.total_amount),
        status: row.status,
        subjectName: row.subject_name ?? null,
        paid: row.paid ?? false,
        sessionMeetingUrl: row.session_meeting_url ?? null,
        sessionStatus: row.session_status ?? null,
        sessionId: row.session_id ?? null,
        sessionTutorNotes: row.session_tutor_notes ?? null,
        sessionHomework: row.session_homework ?? null,
        tutorName: row.tutor_name ?? null,
        tutorAvatarUrl: row.tutor_avatar_url ?? null,
        studentNotes: row.student_notes,
        tutorAcceptedAt: row.tutor_accepted_at ? row.tutor_accepted_at.toISOString() : null,
        cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
        cancellationReason: row.cancellation_reason,
        createdAt: row.created_at.toISOString(),
    };
}
function translateBookingError(error) {
    return (0, database_errors_1.translateDatabaseError)(error, 'We could not complete that booking action.');
}
//# sourceMappingURL=bookings.service.js.map