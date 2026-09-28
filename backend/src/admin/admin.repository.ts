import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

export interface AdminUserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  primary_role: string;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: Date;
  roles: string[] | null;
}

export interface VerificationQueueRow {
  id: string;
  profile_id: string;
  headline: string | null;
  verification_status: string;
  is_listed: boolean;
  submitted_at: Date | null;
  years_experience: number | null;
  hourly_rate: string | null;
  currency: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

/**
 * Admin reads and writes.
 *
 * Every method runs inside the admin's claims, so the PL/pgSQL functions and
 * triggers that consult is_admin() and has_permission() (the hourly-rate
 * guard, enforce_tutor_verification_rules, the governance functions) see the
 * right person. Route guards in the controller are what stop a non-admin; the
 * database checks are the second layer.
 */
@Injectable()
export class AdminRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async dashboardSummary(adminId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<
          Record<string, unknown>[]
        >`select * from public.admin_dashboard_summary()`,
    );
    return rows[0] ?? null;
  }

  async listUsers(
    adminId: string,
    filters: { search?: string; role?: string; from?: Date; to?: Date },
  ): Promise<AdminUserRow[]> {
    const pattern = filters.search ? `%${filters.search}%` : null;
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<AdminUserRow[]>`
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
      `,
    );
  }

  /** Goes to the approval queue; returns the request id, nothing has changed yet. */
  async requestAction(adminId: string, action: string, payload: object): Promise<string> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.admin_request_action(${action}, ${JSON.stringify(payload)}::jsonb) as id
      `;
      return rows[0]!.id;
    });
  }

  async verificationQueue(adminId: string, status: string): Promise<VerificationQueueRow[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<VerificationQueueRow[]>`
        select t.id, t.profile_id, t.headline, t.verification_status::text, t.is_listed,
               t.submitted_at, t.years_experience, t.hourly_rate, t.currency,
               p.full_name, p.email, p.avatar_url
        from public.tutors t
        join public.profiles p on p.id = t.profile_id
        where case when ${status} = 'all'
                   then t.verification_status <> 'unverified'
                   else t.verification_status::text = ${status} end
        order by t.submitted_at asc nulls last
      `,
    );
  }

  async verificationDetail(
    adminId: string,
    tutorId: string,
  ): Promise<{
    steps: Record<string, unknown>[];
    progress: Record<string, unknown>[];
    documents: Record<string, unknown>[];
  }> {
    return this.prisma.withUser(adminId, async (tx) => {
      const steps = await tx.$queryRaw<Record<string, unknown>[]>`
        select id, code, name, description, is_required, sort_order
        from public.verification_steps
        where applies_to = 'tutor' and is_active
        order by sort_order
      `;
      const progress = await tx.$queryRaw<Record<string, unknown>[]>`
        select id, step_id, status::text, reviewer_notes, reviewed_at
        from public.tutor_verification_progress
        where tutor_id = ${tutorId}::uuid
      `;
      const documents = await tx.$queryRaw<Record<string, unknown>[]>`
        select id, step_id, label, mime_type, size_bytes, status::text, reviewer_notes,
               created_at, storage_path is not null as has_file
        from public.tutor_documents
        where tutor_id = ${tutorId}::uuid
        order by created_at desc
      `;
      return { steps, progress, documents };
    });
  }

  /** One progress row per (tutor, step): first review inserts, later ones update. */
  async reviewStep(
    adminId: string,
    input: { tutorId: string; stepId: string; status: string; reviewerNotes: string | null },
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
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

  async reviewDocument(
    adminId: string,
    input: { documentId: string; status: string; reviewerNotes: string | null },
  ): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const changed = await tx.$executeRaw`
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

  /**
   * Sets the overall verification outcome. Approval lists the tutor: the
   * verification trigger only ever forces is_listed off, so an admin approval
   * has to turn it on for the tutor to become bookable.
   */
  async setTutorVerification(
    adminId: string,
    tutorId: string,
    outcome: 'verified' | 'rejected',
  ): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const changed = await tx.$executeRaw`
        update public.tutors set
          verification_status = ${outcome}::public.verification_status,
          is_listed = ${outcome === 'verified'},
          updated_at = now()
        where id = ${tutorId}::uuid
      `;
      return changed > 0;
    });
  }

  /** tutors_admin_only_hourly_rate checks is_admin() under these claims. */
  async setHourlyRate(
    adminId: string,
    tutorId: string,
    hourlyRate: number,
  ): Promise<{ previous: string | null; currency: string } | null> {
    return this.prisma.withUser(adminId, async (tx) => {
      const before = await tx.$queryRaw<{ hourly_rate: string | null; currency: string }[]>`
        select hourly_rate, currency from public.tutors where id = ${tutorId}::uuid for update
      `;
      if (!before[0]) return null;
      await tx.$executeRaw`
        update public.tutors set hourly_rate = ${hourlyRate}, updated_at = now()
        where id = ${tutorId}::uuid
      `;
      return { previous: before[0].hourly_rate, currency: before[0].currency };
    });
  }

  // --- Bookings ----------------------------------------------------------------

  async listBookings(
    adminId: string,
    filters: { search?: string; status?: string; from?: Date; to?: Date },
  ): Promise<Record<string, unknown>[]> {
    const pattern = filters.search ? `%${filters.search}%` : null;
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
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
      `,
    );
  }

  async setBookingStatus(
    adminId: string,
    bookingId: string,
    status: string,
  ): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const changed = await tx.$executeRaw`
        update public.bookings set status = ${status}::public.booking_status, updated_at = now()
        where id = ${bookingId}::uuid
      `;
      return changed > 0;
    });
  }

  // --- Payments and payouts -----------------------------------------------------

  async listPayments(
    adminId: string,
    filters: { status?: string; from?: Date; to?: Date },
  ): Promise<Record<string, unknown>[]> {
    const status = filters.status ?? 'all';
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
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
      `,
    );
  }

  async listPayouts(adminId: string, status: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select po.id, po.tutor_id, po.amount, po.currency, po.status::text, po.reference,
               po.notes, po.requested_at, po.settled_at, tp.full_name as tutor_name
        from public.payouts po
        left join public.tutors t on t.id = po.tutor_id
        left join public.profiles tp on tp.id = t.profile_id
        where ${status} = 'all' or po.status::text = ${status}
        order by po.requested_at desc
        limit 200
      `,
    );
  }

  /** Rejection moves no money, so admin_reject_payout() is single-step. */
  async rejectPayout(adminId: string, payoutId: string, notes: string | null): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`select public.admin_reject_payout(${payoutId}::uuid, ${notes}::text)`;
    });
  }

  // --- Disputes -----------------------------------------------------------------

  async listDisputes(adminId: string, status: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
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
      `,
    );
  }

  async resolveDispute(
    adminId: string,
    input: { disputeId: string; status: string; notes: string | null },
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        select public.admin_resolve_dispute(
          ${input.disputeId}::uuid, ${input.status}::public.dispute_status, ${input.notes}::text
        )
      `;
    });
  }
}
