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
exports.AdminRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let AdminRepository = class AdminRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async dashboardSummary(adminId) {
        const rows = await this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `select * from public.admin_dashboard_summary()`);
        return rows[0] ?? null;
    }
    async listUsers(adminId, filters) {
        const pattern = filters.search ? `%${filters.search}%` : null;
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select p.id, p.full_name, p.email, p.primary_role::text, p.is_active,
               p.onboarding_completed, p.created_at,
               (select array_agg(ur.role::text order by ur.role::text)
                  from public.user_roles ur where ur.user_id = p.id) as roles
        from public.profiles p
        where (${pattern}::text is null or p.full_name ilike ${pattern} or p.email ilike ${pattern})
          and (${filters.role ?? null}::text is null or p.primary_role::text = ${filters.role ?? null})
          and (${filters.from ?? null}::timestamptz is null or p.created_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or p.created_at <= ${filters.to ?? null})
        order by p.created_at desc
        limit 200
      `);
    }
    async requestAction(adminId, action, payload) {
        return this.prisma.withUser(adminId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.admin_request_action(${action}, ${JSON.stringify(payload)}::jsonb) as id
      `;
            return rows[0].id;
        });
    }
    async verificationQueue(adminId, status) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select t.id, t.profile_id, t.headline, t.verification_status::text, t.is_listed,
               t.submitted_at, t.years_experience, t.hourly_rate, t.currency,
               p.full_name, p.email, p.avatar_url, ag.name as agency_name
        from public.tutors t
        join public.profiles p on p.id = t.profile_id
        left join public.tutor_agencies ag on ag.id = t.agency_id
        where case when ${status} = 'all'
                   then t.verification_status <> 'unverified'
                   else t.verification_status::text = ${status} end
        order by t.submitted_at asc nulls last
      `);
    }
    async verificationDetail(adminId, tutorId) {
        return this.prisma.withUser(adminId, async (tx) => {
            const steps = await tx.$queryRaw `
        select id, code, name, description, is_required, sort_order
        from public.verification_steps
        where applies_to = 'tutor' and is_active
        order by sort_order
      `;
            const progress = await tx.$queryRaw `
        select id, step_id, status::text, reviewer_notes, reviewed_at
        from public.tutor_verification_progress
        where tutor_id = ${tutorId}::uuid
      `;
            const documents = await tx.$queryRaw `
        select id, step_id, label, mime_type, size_bytes, status::text, reviewer_notes,
               created_at, storage_path is not null as has_file
        from public.tutor_documents
        where tutor_id = ${tutorId}::uuid
        order by created_at desc
      `;
            return { steps, progress, documents };
        });
    }
    async verificationRecipient(tutorId, stepId) {
        const rows = await this.prisma.$queryRaw `
      select t.profile_id as tutor_user_id,
             p.email       as tutor_email,
             vs.name       as step_name
      from public.tutors t
      join public.profiles p on p.id = t.profile_id
      left join public.verification_steps vs on vs.id = ${stepId ?? null}::uuid
      where t.id = ${tutorId}::uuid
      limit 1
    `;
        return rows[0] ?? null;
    }
    async reviewStep(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        insert into public.tutor_verification_progress
          (tutor_id, step_id, status, reviewer_notes, reviewed_at, reviewed_by)
        values (${input.tutorId}::uuid, ${input.stepId}::uuid,
                ${input.status}::public.verification_status, ${input.reviewerNotes},
                now(), ${adminId}::uuid)
        on conflict (tutor_id, step_id) do update set
          status = excluded.status,
          reviewer_notes = excluded.reviewer_notes,
          reviewed_at = excluded.reviewed_at,
          reviewed_by = excluded.reviewed_by
      `;
        });
    }
    async reviewDocument(adminId, input) {
        return this.prisma.withUser(adminId, async (tx) => {
            const changed = await tx.$executeRaw `
        update public.tutor_documents set
          status = ${input.status}::public.verification_status,
          reviewer_notes = ${input.reviewerNotes},
          reviewed_at = now(),
          reviewed_by = ${adminId}::uuid
        where id = ${input.documentId}::uuid
      `;
            return changed > 0;
        });
    }
    async setTutorVerification(adminId, tutorId, outcome) {
        return this.prisma.withUser(adminId, async (tx) => {
            const changed = await tx.$executeRaw `
        update public.tutors set
          verification_status = ${outcome}::public.verification_status,
          is_listed = ${outcome === 'verified'},
          updated_at = now()
        where id = ${tutorId}::uuid
      `;
            return changed > 0;
        });
    }
    async setHourlyRate(adminId, tutorId, hourlyRate) {
        return this.prisma.withUser(adminId, async (tx) => {
            const before = await tx.$queryRaw `
        select hourly_rate, currency from public.tutors where id = ${tutorId}::uuid for update
      `;
            if (!before[0])
                return null;
            await tx.$executeRaw `
        update public.tutors set hourly_rate = ${hourlyRate}, updated_at = now()
        where id = ${tutorId}::uuid
      `;
            return { previous: before[0].hourly_rate, currency: before[0].currency };
        });
    }
    async listBookings(adminId, filters) {
        const pattern = filters.search ? `%${filters.search}%` : null;
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select b.id, b.student_id, b.tutor_id, b.booked_by, b.subject_id, b.starts_at, b.ends_at,
               b.duration_minutes, b.status::text, b.currency, b.total_amount,
               b.cancellation_policy_id, b.cancelled_at, b.cancellation_reason, b.created_at,
               s.first_name as student_first_name, s.last_name as student_last_name,
               tp.full_name as tutor_name, sub.name as subject_name
        from public.bookings b
        left join public.students s on s.id = b.student_id
        left join public.tutors t on t.id = b.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        left join public.subjects sub on sub.id = b.subject_id
        where (${filters.status ?? null}::text is null or b.status::text = ${filters.status ?? null})
          and (${filters.from ?? null}::timestamptz is null or b.starts_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or b.starts_at <= ${filters.to ?? null})
          and (${pattern}::text is null
               or concat_ws(' ', s.first_name, s.last_name) ilike ${pattern}
               or tp.full_name ilike ${pattern})
        order by b.starts_at desc
        limit 200
      `);
    }
    async setBookingStatus(adminId, bookingId, status) {
        return this.prisma.withUser(adminId, async (tx) => {
            const changed = await tx.$executeRaw `
        update public.bookings set status = ${status}::public.booking_status, updated_at = now()
        where id = ${bookingId}::uuid
      `;
            return changed > 0;
        });
    }
    async listPayments(adminId, filters) {
        const status = filters.status ?? 'all';
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select p.id, p.booking_id, p.tutor_id, p.payer_id, p.amount, p.currency,
               p.status::text, p.provider, p.provider_reference, p.paid_at,
               p.refunded_amount, p.created_at,
               b.starts_at as booking_starts_at,
               s.first_name as student_first_name, s.last_name as student_last_name,
               tp.full_name as tutor_name
        from public.payments p
        left join public.bookings b on b.id = p.booking_id
        left join public.students s on s.id = b.student_id
        left join public.tutors t on t.id = p.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        where case ${status}
                when 'all' then true
                -- Not a stored column: failed, or pending/processing for over a day.
                when 'flagged' then p.status = 'failed'
                  or (p.status in ('pending', 'processing') and p.created_at < now() - interval '24 hours')
                when 'refunded' then coalesce(p.refunded_amount, 0) > 0
                else p.status::text = ${status}
              end
          and (${filters.from ?? null}::timestamptz is null or p.created_at >= ${filters.from ?? null})
          and (${filters.to ?? null}::timestamptz is null or p.created_at <= ${filters.to ?? null})
        order by p.created_at desc
        limit 200
      `);
    }
    async listPayouts(adminId, status) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select po.id, po.tutor_id, po.amount, po.currency, po.status::text, po.reference,
               po.notes, po.requested_at, po.settled_at, tp.full_name as tutor_name,
               po.agency_id, ag.name as agency_name
        from public.payouts po
        left join public.tutor_agencies ag on ag.id = po.agency_id
        left join public.tutors t on t.id = po.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        where ${status} = 'all' or po.status::text = ${status}
        order by po.requested_at desc
        limit 200
      `);
    }
    async rejectPayout(adminId, payoutId, notes) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `select public.admin_reject_payout(${payoutId}::uuid, ${notes}::text)`;
        });
    }
    async listDisputes(adminId, status) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select d.id, d.booking_id, d.category::text, d.status::text, d.description,
               d.resolution_notes, d.resolved_at, d.created_at,
               rp.full_name as raised_by_name, ap.full_name as against_name,
               b.starts_at as booking_starts_at, sub.name as subject_name
        from public.disputes d
        left join public.profiles rp on rp.id = d.raised_by
        left join public.profiles ap on ap.id = d.against_profile_id
        left join public.bookings b on b.id = d.booking_id
        left join public.subjects sub on sub.id = b.subject_id
        where ${status} = 'all' or d.status::text = ${status}
        order by d.created_at desc
        limit 200
      `);
    }
    async resolveDispute(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        select public.admin_resolve_dispute(
          ${input.disputeId}::uuid, ${input.status}::public.dispute_status, ${input.notes}::text
        )
      `;
        });
    }
    async listReviews(adminId, published) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select r.id, r.score, r.comment, r.is_published, r.created_at, r.tutor_id,
               tp.full_name as tutor_name, rp.full_name as rater_name
        from public.ratings r
        left join public.tutors t on t.id = r.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        left join public.profiles rp on rp.id = r.rater_id
        where ${published}::boolean is null or r.is_published = ${published}::boolean
        order by r.created_at desc
        limit 200
      `);
    }
    async setReviewPublished(adminId, id, isPublished) {
        return this.prisma.withUser(adminId, async (tx) => {
            const changed = await tx.$executeRaw `
        update public.ratings set is_published = ${isPublished}, updated_at = now()
        where id = ${id}::uuid
      `;
            return changed > 0;
        });
    }
    async searchMessages(adminId, search) {
        const pattern = `%${search}%`;
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select m.id, m.body, m.sender_id, m.is_hidden, m.created_at, m.conversation_id,
               sp.full_name as sender_name
        from public.messages m
        left join public.profiles sp on sp.id = m.sender_id
        where m.body ilike ${pattern}
        order by m.created_at desc
        limit 100
      `);
    }
    async setMessageHidden(adminId, id, isHidden, reason) {
        return this.prisma.withUser(adminId, async (tx) => {
            const changed = await tx.$executeRaw `
        update public.messages
        set is_hidden = ${isHidden}, hidden_reason = case when ${isHidden} then ${reason}::text end
        where id = ${id}::uuid
      `;
            return changed > 0;
        });
    }
    async reportSummary(adminId, from, to) {
        const rows = await this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select * from public.admin_report_summary(${from}::timestamptz, ${to}::timestamptz)
      `);
        return rows[0] ?? null;
    }
    async listAgencies(adminId, status) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select a.id, a.name, a.registration_number, a.country_code, a.contact_email,
               a.verification_status::text, a.is_active, a.revenue_share_percentage,
               a.submitted_at, a.created_at, p.full_name as owner_name, p.email as owner_email,
               (select count(*) from public.tutors t where t.agency_id = a.id)::int as tutor_count
        from public.tutor_agencies a
        left join public.profiles p on p.id = a.owner_id
        where case when ${status} = 'all' then true else a.verification_status::text = ${status} end
        order by a.submitted_at asc nulls last, a.created_at desc
      `);
    }
    async agencyDetail(adminId, agencyId) {
        return this.prisma.withUser(adminId, async (tx) => {
            const agencies = await tx.$queryRaw `
        select a.id, a.name, a.registration_number, a.country_code, a.contact_email,
               a.contact_phone, a.website, a.about, a.verification_status::text, a.is_active,
               a.revenue_share_percentage, a.submitted_at, a.created_at,
               p.full_name as owner_name, p.email as owner_email
        from public.tutor_agencies a left join public.profiles p on p.id = a.owner_id
        where a.id = ${agencyId}::uuid
      `;
            const steps = await tx.$queryRaw `
        select vs.id, vs.code, vs.name, vs.description, vs.is_required, vs.sort_order,
               pr.id as progress_id, pr.status::text as status, pr.reviewer_notes, pr.reviewed_at
        from public.verification_steps vs
        left join public.agency_verification_progress pr
          on pr.step_id = vs.id and pr.agency_id = ${agencyId}::uuid
        where vs.is_active and vs.applies_to = 'agency'
        order by vs.sort_order
      `;
            const tutors = await tx.$queryRaw `
        select t.id, p.full_name, p.email, t.verification_status::text, t.is_listed
        from public.tutors t left join public.profiles p on p.id = t.profile_id
        where t.agency_id = ${agencyId}::uuid
        order by p.full_name
      `;
            return { agency: agencies[0] ?? null, steps, tutors };
        });
    }
    async reviewAgencyStep(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        insert into public.agency_verification_progress
          (agency_id, step_id, status, reviewer_notes, reviewed_at, reviewed_by)
        values (${input.agencyId}::uuid, ${input.stepId}::uuid,
                ${input.status}::public.verification_status, ${input.reviewerNotes},
                now(), ${adminId}::uuid)
        on conflict (agency_id, step_id) do update set
          status = excluded.status, reviewer_notes = excluded.reviewer_notes,
          reviewed_at = excluded.reviewed_at, reviewed_by = excluded.reviewed_by
      `;
        });
    }
    async setAgencyStatus(adminId, agencyId, status) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.tutor_agencies
        set verification_status = ${status}::public.verification_status, updated_at = now()
        where id = ${agencyId}::uuid
      `;
            return n > 0;
        });
    }
    async setAgencyShare(adminId, agencyId, share) {
        return this.prisma.withUser(adminId, async (tx) => {
            const before = await tx.$queryRaw `
        select revenue_share_percentage from public.tutor_agencies
        where id = ${agencyId}::uuid for update
      `;
            if (!before[0])
                return null;
            await tx.$executeRaw `
        update public.tutor_agencies set revenue_share_percentage = ${share}, updated_at = now()
        where id = ${agencyId}::uuid
      `;
            return { previous: String(before[0].revenue_share_percentage) };
        });
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map