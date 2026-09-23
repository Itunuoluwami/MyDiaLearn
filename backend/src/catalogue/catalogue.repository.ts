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

  async tutorCards(ids: string[]): Promise<Record<string, unknown>[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.public_tutor_cards(${ids}::uuid[])
      `,
    );
  }
}
