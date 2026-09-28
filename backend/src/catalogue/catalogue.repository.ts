import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

export interface TutorSearchFilters {
  q?: string | undefined;
  subjectId?: string | undefined;
  curriculumId?: string | undefined;
  country?: string | undefined;
  educationLevelId?: string | undefined;
  language?: string | undefined;
  minRating?: number | undefined;
  maxPrice?: number | undefined;
  sort?: string | undefined;
  limit: number;
  offset: number;
}

/**
 * Catalogue and public discovery.
 *
 * Everything here runs `asAnonymous`: these are the surfaces an unauthenticated
 * visitor already reaches today, and the underlying functions were granted to
 * anon for exactly that reason. Running them with no caller is the honest
 * representation — and means a bug cannot accidentally widen what a visitor
 * sees to what a signed-in user would.
 */
@Injectable()
export class CatalogueRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async subjects(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`select * from public.public_subject_facets()`,
    );
  }

  async curricula(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<
          Record<string, unknown>[]
        >`select * from public.public_curriculum_facets()`,
    );
  }

  async countries(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`select * from public.public_country_facets()`,
    );
  }

  async educationLevels(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, name, code, curriculum_id, sort_order
        from public.education_levels
        order by sort_order nulls last, name
      `,
    );
  }

  async currencies(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select code, name, symbol, is_active
        from public.currencies
        where is_active
        order by code
      `,
    );
  }

  async searchSuggestions(q: string, limit: number): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_search_suggestions(${q}, ${limit})
      `,
    );
  }

  async searchTutors(filters: TutorSearchFilters): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_tutor_search(
          ${filters.q ?? null}::text,
          ${filters.subjectId ?? null}::uuid,
          ${filters.curriculumId ?? null}::uuid,
          ${filters.country ?? null}::text,
          ${filters.educationLevelId ?? null}::uuid,
          ${filters.language ?? null}::text,
          ${filters.minRating ?? null}::numeric,
          ${filters.maxPrice ?? null}::numeric,
          ${filters.sort ?? null}::text,
          ${filters.limit},
          ${filters.offset}
        )
      `,
    );
  }

  async tutorDetail(tutorId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_tutor_detail(${tutorId}::uuid)
      `,
    );
    return rows[0] ?? null;
  }

  async tutorReviews(tutorId: string, limit: number): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_tutor_reviews(${tutorId}::uuid, ${limit})
      `,
    );
  }

  async publicSettings(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<{ key: string; value: unknown }[]>`
        select key, value from public.platform_settings where is_public
      `,
    );
    // Flatten to a single map, which is how the frontend consumes settings.
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  /**
   * What a tutor teaches, with ids, for the booking form's subject picker.
   * Listed tutors only — the same visibility as their public profile.
   */
  async tutorSubjects(tutorId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select ts.subject_id, ts.education_level_id, s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.tutors t on t.id = ts.tutor_id and t.is_listed
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name, el.sort_order
      `,
    );
  }

  async cancellationPolicies(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, name, description, hours_before, refund_percentage, is_default
        from public.cancellation_policies
        where is_active
        order by hours_before nulls last
      `,
    );
  }

  async verificationSteps(): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, name, code, description, applies_to::text, is_required, sort_order
        from public.verification_steps where is_active order by sort_order, name
      `,
    );
  }

  async commissionExample(): Promise<Record<string, unknown> | null> {
    // A single representative active rule, for the pricing explainer page.
    const rows = await this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select model::text, percentage, platform_fee_percentage, platform_fee_fixed, currency
        from public.commission_rules
        where is_active and tutor_id is null and agency_id is null and subject_id is null
        order by priority asc limit 1
      `,
    );
    return rows[0] ?? null;
  }

  async tutorCards(ids: string[]): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_tutor_cards(${ids}::uuid[])
      `,
    );
  }
}
