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
exports.BookingsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const app_exception_1 = require("../common/exceptions/app.exception");
let BookingsRepository = class BookingsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async createWithQuote(callerId, input) {
        return this.prisma.withUser(callerId, async (tx) => {
            const allowed = await tx.$queryRaw `
        select (public.can_access_student(${input.studentId}::uuid) or public.is_admin()) as ok
      `;
            if (!allowed[0]?.ok)
                throw new app_exception_1.NotAuthorizedError('You cannot book for this student.');
            const quotes = await tx.$queryRaw `select * from public.booking_quote(${input.tutorId}::uuid, ${input.durationMinutes})`;
            const quote = quotes[0];
            if (!quote)
                throw new Error('NO_QUOTE');
            const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);
            const rows = await tx.$queryRaw `
        insert into public.bookings (
          student_id, tutor_id, booked_by, subject_id, education_level_id,
          starts_at, ends_at, duration_minutes, booking_timezone,
          hourly_rate, currency, total_amount, commission_rule_id,
          cancellation_policy_id, student_notes
        ) values (
          ${input.studentId}::uuid, ${input.tutorId}::uuid, ${callerId}::uuid,
          ${input.subjectId ?? null}::uuid, ${input.educationLevelId ?? null}::uuid,
          ${input.startsAt}, ${endsAt}, ${input.durationMinutes}, ${input.timezone},
          ${quote.hourly_rate}::numeric, ${quote.currency}, ${quote.total_amount}::numeric,
          ${quote.commission_rule_id}::uuid, ${quote.cancellation_policy_id}::uuid,
          ${input.studentNotes ?? null}
        )
        returning id, student_id, tutor_id, booked_by, subject_id, education_level_id,
                  starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate,
                  currency, total_amount, status::text, student_notes, tutor_accepted_at,
                  cancelled_at, cancellation_reason, created_at
      `;
            return rows[0];
        });
    }
    async notificationContext(bookingId) {
        const rows = await this.prisma.$queryRaw `
      select b.id,
             b.starts_at,
             b.booking_timezone,
             coalesce(t.timezone, b.booking_timezone) as tutor_timezone,
             b.total_amount::text as total_amount,
             b.currency,
             sub.name                  as subject_name,
             t.profile_id              as tutor_user_id,
             tp.full_name              as tutor_name,
             tp.email                  as tutor_email,
             trim(concat(s.first_name, ' ', coalesce(s.last_name, ''))) as student_name,
             sp.id                     as student_user_id,
             sp.email                  as student_email,
             b.booked_by               as booker_user_id,
             bp.full_name              as booker_name,
             bp.email                  as booker_email
      from public.bookings b
      join public.tutors t          on t.id = b.tutor_id
      join public.profiles tp       on tp.id = t.profile_id
      join public.students s        on s.id = b.student_id
      left join public.profiles sp  on sp.id = s.profile_id
      left join public.profiles bp  on bp.id = b.booked_by
      left join public.subjects sub on sub.id = b.subject_id
      where b.id = ${bookingId}::uuid
      limit 1
    `;
        return rows[0] ?? null;
    }
    async list(userId, query, filters) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select b.id, b.student_id, b.tutor_id, b.booked_by, b.subject_id, b.education_level_id,
               b.starts_at, b.ends_at, b.duration_minutes, b.booking_timezone, b.hourly_rate,
               b.currency, b.total_amount, b.status::text, b.student_notes, b.tutor_accepted_at,
               b.cancelled_at, b.cancellation_reason, b.created_at,
               sub.name as subject_name,
               exists(select 1 from public.payments p where p.booking_id = b.id and p.status = 'paid') as paid,
               cs.meeting_url as session_meeting_url, cs.status::text as session_status,
               cs.id as session_id, cs.tutor_notes as session_tutor_notes,
               cs.homework as session_homework,
               tp.full_name as tutor_name, tp.avatar_url as tutor_avatar_url
        from public.bookings b
        left join public.subjects sub on sub.id = b.subject_id
        left join public.class_sessions cs on cs.booking_id = b.id
        left join public.tutors t on t.id = b.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        where (${filters.status ?? null}::text is null or b.status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or b.starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or b.starts_at <= ${filters.to ?? null})
        order by b.starts_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n
        from public.bookings
        where (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or starts_at <= ${filters.to ?? null})
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async findById(userId, id) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, student_id, tutor_id, booked_by, subject_id, education_level_id,
               starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate,
               currency, total_amount, status::text, student_notes, tutor_accepted_at,
               cancelled_at, cancellation_reason, created_at
        from public.bookings where id = ${id}::uuid
      `;
            return rows[0] ?? null;
        });
    }
    async availableSlots(callerId, input) {
        return this.prisma.withUser(callerId, async (tx) => tx.$queryRaw `
        select * from public.tutor_available_slots(
          ${input.tutorId}::uuid, ${input.from}, ${input.days}, ${input.durationMinutes}
        )
      `);
    }
    async rate(userId, bookingId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const found = await tx.$queryRaw `
        select tutor_id, student_id, status::text from public.bookings
        where id = ${bookingId}::uuid
          and (booked_by = auth.uid() or public.can_access_student(student_id))
      `;
            const booking = found[0];
            if (!booking)
                return 'not_found';
            if (booking.status !== 'completed')
                return 'not_completed';
            await tx.$executeRaw `
        insert into public.ratings (booking_id, tutor_id, student_id, rater_id, score, comment)
        values (${bookingId}::uuid, ${booking.tutor_id}::uuid, ${booking.student_id}::uuid,
                ${userId}::uuid, ${input.score}, ${input.comment ?? null})
      `;
            return 'rated';
        });
    }
    async respond(tutorUserId, bookingId, accept) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.tutor_respond_booking(${bookingId}::uuid, ${accept})::text as status
      `;
            return rows[0].status;
        });
    }
    async tutorSchedule(tutorUserId, input) {
        return this.prisma.withUser(tutorUserId, async (tx) => tx.$queryRaw `
        select * from public.tutor_bookings(
          ${input.from ?? null}::timestamptz,
          ${input.to ?? null}::timestamptz,
          ${input.statuses ?? null}::public.booking_status[]
        )
      `);
    }
    async openClass(tutorUserId, bookingId) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        select * from public.tutor_open_class(${bookingId}::uuid)
      `;
            return rows[0] ?? null;
        });
    }
    async joinClass(userId, bookingId) {
        return this.prisma.withUser(userId, async (tx) => {
            const allowed = await tx.$queryRaw `
        select public.can_access_booking(${bookingId}::uuid) as ok
      `;
            if (!allowed[0]?.ok)
                throw new app_exception_1.NotAuthorizedError('That class is not yours to join.');
            const ready = await tx.$queryRaw `
        select status::text from public.bookings where id = ${bookingId}::uuid
      `;
            const status = ready[0]?.status;
            if (!status)
                return null;
            if (!['confirmed', 'in_progress', 'completed'].includes(status)) {
                throw new app_exception_1.ConflictError('This lesson is not confirmed yet.');
            }
            await tx.$executeRaw `
        insert into public.class_sessions (booking_id, status)
        -- class_sessions.status is booking_status, mirroring the booking.
        select ${bookingId}::uuid, ${status}::public.booking_status
        where not exists (
          select 1 from public.class_sessions where booking_id = ${bookingId}::uuid
        )
      `;
            await tx.$executeRaw `
        update public.class_sessions
           set student_attended = true, updated_at = now()
         where booking_id = ${bookingId}::uuid
      `;
            const rows = await tx.$queryRaw `
        select cs.id, cs.meeting_url, cs.meeting_provider, cs.started_at, cs.ended_at,
               cs.status::text as status,
               b.starts_at, b.ends_at, b.duration_minutes,
               sub.name as subject_name,
               tp.full_name as tutor_name
        from public.class_sessions cs
        join public.bookings b       on b.id = cs.booking_id
        join public.tutors t         on t.id = b.tutor_id
        join public.profiles tp      on tp.id = t.profile_id
        left join public.subjects sub on sub.id = b.subject_id
        where cs.booking_id = ${bookingId}::uuid
        limit 1
      `;
            return rows[0] ?? null;
        });
    }
    async setMeetingRoom(bookingId, meetingUrl, provider) {
        await this.prisma.$executeRaw `
      update public.class_sessions
         set meeting_url = ${meetingUrl}, meeting_provider = ${provider}, updated_at = now()
       where booking_id = ${bookingId}::uuid
    `;
    }
    async startClass(tutorUserId, bookingId) {
        await this.prisma.withUser(tutorUserId, async (tx) => {
            await tx.$executeRaw `select public.tutor_start_class(${bookingId}::uuid)`;
        });
    }
    async endClass(tutorUserId, bookingId, studentAttended) {
        await this.prisma.withUser(tutorUserId, async (tx) => {
            await tx.$executeRaw `
        select public.tutor_end_class(${bookingId}::uuid, ${studentAttended ?? null}::boolean)
      `;
        });
    }
    async raiseDispute(userId, bookingId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.raise_dispute(
          ${bookingId}::uuid, ${input.category}::public.dispute_category, ${input.description}
        ) as id
      `;
            return rows[0].id;
        });
    }
    async myRatings(userId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select id, booking_id, tutor_id, score, comment, created_at
        from public.ratings where rater_id = ${userId}::uuid
        order by created_at desc
      `);
    }
    async cancelByFamily(userId, bookingId, reason) {
        return this.prisma.withUser(userId, async (tx) => {
            const found = await tx.$queryRaw `
        select b.status::text as status,
               exists(select 1 from public.payments p
                      where p.booking_id = b.id and p.status in ('paid', 'processing')) as paid
        from public.bookings b
        where b.id = ${bookingId}::uuid
          and (b.booked_by = auth.uid() or public.can_access_student(b.student_id))
        for update
      `;
            const booking = found[0];
            if (!booking)
                return 'not_found';
            if (booking.status !== 'pending' || booking.paid)
                return 'not_cancellable';
            await tx.$executeRaw `
        update public.bookings set
          status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(),
          cancellation_reason = ${reason}, updated_at = now()
        where id = ${bookingId}::uuid
      `;
            return 'cancelled';
        });
    }
};
exports.BookingsRepository = BookingsRepository;
exports.BookingsRepository = BookingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsRepository);
//# sourceMappingURL=bookings.repository.js.map