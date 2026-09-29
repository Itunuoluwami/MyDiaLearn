import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

type Row = Record<string, unknown>;

export interface AgencyRow {
  id: string;
  owner_id: string;
  name: string;
  registration_number: string | null;
  country_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  about: string | null;
  logo_url: string | null;
  verification_status: string;
  is_active: boolean;
  revenue_share_percentage: string;
  submitted_at: Date | null;
  created_at: Date;
}

const AGENCY_COLUMNS = `
  id, owner_id, name, registration_number, country_code, contact_email, contact_phone,
  website, about, logo_url, verification_status::text, is_active,
  revenue_share_percentage, submitted_at, created_at
`;

/**
 * The agency's own data. Every call runs in the owner's claims, so the
 * agency rules triggers (no self-verification, no self-set share, only the
 * owner links tutors) see who is acting.
 */
@Injectable()
export class AgenciesRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /** The owner's agency, created on first visit from their profile name. */
  async findOrCreateOwn(ownerId: string): Promise<AgencyRow | null> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const select = () =>
        tx.$queryRawUnsafe<AgencyRow[]>(
          `select ${AGENCY_COLUMNS} from public.tutor_agencies where owner_id = $1::uuid`,
          ownerId,
        );
      const existing = await select();
      if (existing[0]) return existing[0];
      await tx.$executeRaw`
        insert into public.tutor_agencies (owner_id, name, contact_email, country_code)
        select p.id, coalesce(nullif(btrim(p.full_name), ''), 'My agency'), p.email, p.country_code
        from public.profiles p
        -- Only agency accounts get an agency; a super admin passing the role
        -- gate must not have one created for them.
        where p.id = ${ownerId}::uuid and public.has_role(p.id, 'agency')
        on conflict (owner_id) do nothing
      `;
      return (await select())[0] ?? null;
    });
  }

  async update(
    ownerId: string,
    patch: Partial<{
      name: string;
      registrationNumber: string | null;
      countryCode: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
      website: string | null;
      about: string | null;
    }>,
  ): Promise<AgencyRow | null> {
    const has = (key: keyof typeof patch) => patch[key] !== undefined;
    return this.prisma.withUser(ownerId, async (tx) => {
      const rows = await tx.$queryRawUnsafe<AgencyRow[]>(
        `update public.tutor_agencies set
           name = coalesce($2::text, name),
           registration_number = case when $3::boolean then $4::text else registration_number end,
           country_code = case when $5::boolean then $6::text else country_code end,
           contact_email = case when $7::boolean then $8::text else contact_email end,
           contact_phone = case when $9::boolean then $10::text else contact_phone end,
           website = case when $11::boolean then $12::text else website end,
           about = case when $13::boolean then $14::text else about end,
           updated_at = now()
         where owner_id = $1::uuid
         returning ${AGENCY_COLUMNS}`,
        ownerId,
        patch.name ?? null,
        has('registrationNumber'),
        patch.registrationNumber ?? null,
        has('countryCode'),
        patch.countryCode ?? null,
        has('contactEmail'),
        patch.contactEmail ?? null,
        has('contactPhone'),
        patch.contactPhone ?? null,
        has('website'),
        patch.website ?? null,
        has('about'),
        patch.about ?? null,
      );
      return rows[0] ?? null;
    });
  }

  async verificationSteps(ownerId: string, agencyId: string): Promise<Row[]> {
    return this.prisma.withUser(
      ownerId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select vs.id, vs.code, vs.name, vs.description, vs.is_required, vs.sort_order,
               p.status::text as status, p.reviewer_notes, p.reviewed_at
        from public.verification_steps vs
        left join public.agency_verification_progress p
          on p.step_id = vs.id and p.agency_id = ${agencyId}::uuid
        where vs.is_active and vs.applies_to = 'agency'
        order by vs.sort_order
      `,
    );
  }

  async submitVerification(ownerId: string): Promise<string> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const rows = await tx.$queryRaw<{ s: string }[]>`
        select public.agency_submit_verification()::text as s
      `;
      return rows[0]!.s;
    });
  }

  async dashboard(ownerId: string, agencyId: string): Promise<Row> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const rows = await tx.$queryRaw<Row[]>`
        select
          (select count(*) from public.tutors where agency_id = ${agencyId}::uuid)::int as tutors_total,
          (select count(*) from public.tutors
            where agency_id = ${agencyId}::uuid and verification_status = 'verified')::int as tutors_verified,
          (select count(*) from public.tutors
            where agency_id = ${agencyId}::uuid and verification_status in ('pending', 'in_review'))::int as tutors_in_review,
          (select count(*) from public.tutors where agency_id = ${agencyId}::uuid and is_listed)::int as tutors_listed,
          (select count(*) from public.bookings b join public.tutors t on t.id = b.tutor_id
            where t.agency_id = ${agencyId}::uuid and b.status in ('pending', 'confirmed')
              and b.starts_at >= now())::int as upcoming_bookings,
          (select count(*) from public.bookings b join public.tutors t on t.id = b.tutor_id
            where t.agency_id = ${agencyId}::uuid and b.status = 'completed')::int as completed_lessons
      `;
      return rows[0]!;
    });
  }

  async roster(ownerId: string): Promise<Row[]> {
    return this.prisma.withUser(ownerId, async (tx) => {
      return tx.$queryRaw<Row[]>`
        select e.*, pr.email, t.headline, t.onboarding_step, t.submitted_at
        from public.agency_tutor_earnings() e
        join public.tutors t on t.id = e.tutor_id
        left join public.profiles pr on pr.id = t.profile_id
      `;
    });
  }

  /**
   * The tutor's profile id, if the tutor belongs to the caller's agency.
   * Everything done to an agency tutor goes through this check first.
   */
  async ownedTutorProfile(ownerId: string, tutorId: string): Promise<string | null> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const rows = await tx.$queryRaw<{ profile_id: string }[]>`
        select t.profile_id from public.tutors t
        where t.id = ${tutorId}::uuid and t.agency_id = public.current_agency_id()
      `;
      return rows[0]?.profile_id ?? null;
    });
  }

  /** Links a tutor record to the caller's agency; the rules trigger checks ownership. */
  async attachTutor(ownerId: string, tutorId: string): Promise<void> {
    await this.prisma.withUser(ownerId, async (tx) => {
      await tx.$executeRaw`
        update public.tutors set agency_id = public.current_agency_id(), updated_at = now()
        where id = ${tutorId}::uuid
      `;
    });
  }

  async detachTutor(ownerId: string, tutorId: string): Promise<boolean> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const n = await tx.$executeRaw`
        update public.tutors set agency_id = null, is_listed = false, updated_at = now()
        where id = ${tutorId}::uuid and agency_id = public.current_agency_id()
      `;
      return n > 0;
    });
  }

  /** Creates the tutor record for a newly provisioned tutor, as that tutor. */
  async ensureTutorRecord(tutorProfileId: string): Promise<string> {
    return this.prisma.withUser(tutorProfileId, async (tx) => {
      const rows = await tx.$queryRaw<
        { id: string }[]
      >`select public.ensure_tutor_record() as id`;
      return rows[0]!.id;
    });
  }

  async bookings(
    ownerId: string,
    filters: { status: string | null; from: Date | null; to: Date | null },
  ): Promise<Row[]> {
    return this.prisma.withUser(
      ownerId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select b.id, b.tutor_id, b.starts_at, b.ends_at, b.duration_minutes, b.status::text,
               b.currency, b.total_amount, b.created_at,
               tp.full_name as tutor_name, s.first_name as student_first_name,
               sub.name as subject_name,
               exists(select 1 from public.payments p where p.booking_id = b.id and p.status = 'paid') as paid
        from public.bookings b
        join public.tutors t on t.id = b.tutor_id and t.agency_id = public.current_agency_id()
        left join public.profiles tp on tp.id = t.profile_id
        left join public.students s on s.id = b.student_id
        left join public.subjects sub on sub.id = b.subject_id
        where (${filters.status}::text is null or b.status::text = ${filters.status})
          and (${filters.from}::timestamptz is null or b.starts_at >= ${filters.from})
          and (${filters.to}::timestamptz is null or b.starts_at <= ${filters.to})
        order by b.starts_at desc
        limit 300
      `,
    );
  }

  async earnings(ownerId: string): Promise<Row | null> {
    const rows = await this.prisma.withUser(
      ownerId,
      async (tx) => tx.$queryRaw<Row[]>`select * from public.agency_earnings_summary()`,
    );
    return rows[0] ?? null;
  }

  async payouts(ownerId: string): Promise<Row[]> {
    return this.prisma.withUser(
      ownerId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, amount, currency, status::text, reference, notes, requested_at, settled_at
        from public.payouts where agency_id = public.current_agency_id()
        order by requested_at desc
      `,
    );
  }

  async requestPayout(ownerId: string, amount: number): Promise<string> {
    return this.prisma.withUser(ownerId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.agency_request_payout(${amount}::numeric) as id
      `;
      return rows[0]!.id;
    });
  }
}
