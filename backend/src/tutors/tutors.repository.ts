import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface TutorRow {
  id: string;
  profile_id: string;
  agency_id: string | null;
  headline: string | null;
  biography: string | null;
  qualifications: string[];
  languages: string[];
  hourly_rate: string | null;
  currency: string;
  years_experience: number | null;
  intro_video_url: string | null;
  timezone: string;
  verification_status: string;
  is_listed: boolean;
  education: string[];
  methodology: string | null;
  teaching_context: string | null;
  onboarding_step: number;
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TutorSubjectRow {
  id: string;
  subject_id: string;
  education_level_id: string | null;
  subject_name: string | null;
  level_name: string | null;
}

/**
 * Columns a tutor may change about themselves.
 *
 * `hourly_rate` is absent on purpose. The tutors_admin_only_hourly_rate trigger
 * rejects a self-service rate change, and listing it here would produce a
 * request that always fails at the database — a worse experience than not
 * offering it. Rate changes go through the admin module.
 */
/**
 * `undefined` leaves a column alone; `null` clears it (for the columns that
 * are nullable — the portal clears a headline by sending null).
 */
export interface UpdateTutorInput {
  headline?: string | null | undefined;
  biography?: string | null | undefined;
  qualifications?: string[] | undefined;
  languages?: string[] | undefined;
  education?: string[] | undefined;
  yearsExperience?: number | null | undefined;
  introVideoUrl?: string | null | undefined;
  timezone?: string | undefined;
  methodology?: string | null | undefined;
  teachingContext?: string | null | undefined;
  onboardingStep?: number | undefined;
  isListed?: boolean | undefined;
}

const TUTOR_COLUMNS = `
  id, profile_id, agency_id, headline, biography, qualifications, languages,
  hourly_rate, currency, years_experience, intro_video_url, timezone,
  verification_status::text, is_listed, education, methodology, teaching_context,
  onboarding_step, submitted_at, created_at, updated_at
`;

@Injectable()
export class TutorsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * The caller's tutor record, creating it if absent.
   *
   * ensure_tutor_record() is idempotent and is how the existing onboarding
   * flow starts — a profile with the tutor role does not necessarily have a
   * tutors row until they begin. Calling it here means every tutor endpoint
   * works on first visit rather than 404ing until some other screen ran first.
   */
  async ensureOwn(userId: string): Promise<TutorRow> {
    return this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`select public.ensure_tutor_record()`;
      const rows = await tx.$queryRawUnsafe<TutorRow[]>(
        `select ${TUTOR_COLUMNS} from public.tutors where profile_id = $1::uuid`,
        userId,
      );
      return rows[0]!;
    });
  }

  async findOwn(userId: string): Promise<TutorRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRawUnsafe<TutorRow[]>(
        `select ${TUTOR_COLUMNS} from public.tutors where profile_id = $1::uuid`,
        userId,
      );
      return rows[0] ?? null;
    });
  }

  async updateOwn(userId: string, input: UpdateTutorInput): Promise<TutorRow | null> {
    // qualifications, languages and education are **jsonb** columns, not
    // text[], despite reading like arrays.
    //
    // Prisma binds a JS array as a PostgreSQL array literal ({a,b}) — which is
    // right for a uuid[] or text[] column and wrong for jsonb, where it fails
    // with "invalid input syntax for type json". jsonb needs a JSON string.
    const qualifications = input.qualifications ? JSON.stringify(input.qualifications) : null;
    const languages = input.languages ? JSON.stringify(input.languages) : null;
    const education = input.education ? JSON.stringify(input.education) : null;

    // Nullable text columns: an omitted field is left alone (a PATCH that
    // blanked a biography because the client did not resend it is data loss),
    // while an explicit null clears it.
    const has = (key: keyof UpdateTutorInput): boolean => input[key] !== undefined;

    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<TutorRow[]>`
        update public.tutors set
          headline         = case when ${has('headline')} then ${input.headline ?? null}::text else headline end,
          biography        = case when ${has('biography')} then ${input.biography ?? null}::text else biography end,
          qualifications   = coalesce(${qualifications}::jsonb, qualifications),
          languages        = coalesce(${languages}::jsonb, languages),
          education        = coalesce(${education}::jsonb, education),
          years_experience = case when ${has('yearsExperience')} then ${input.yearsExperience ?? null}::int else years_experience end,
          intro_video_url  = case when ${has('introVideoUrl')} then ${input.introVideoUrl ?? null}::text else intro_video_url end,
          timezone         = coalesce(${input.timezone ?? null}, timezone),
          methodology      = case when ${has('methodology')} then ${input.methodology ?? null}::text else methodology end,
          teaching_context = case when ${has('teachingContext')} then ${input.teachingContext ?? null}::text else teaching_context end,
          onboarding_step  = coalesce(${input.onboardingStep ?? null}::int, onboarding_step),
          is_listed        = coalesce(${input.isListed ?? null}::boolean, is_listed),
          updated_at       = now()
        where profile_id = ${userId}::uuid
        returning id, profile_id, agency_id, headline, biography, qualifications, languages,
                  hourly_rate, currency, years_experience, intro_video_url, timezone,
                  verification_status::text, is_listed, education, methodology,
                  teaching_context, onboarding_step, submitted_at, created_at, updated_at
      `;
      return rows[0] ?? null;
    });
  }

  // --- Subjects taught (qualifications) -------------------------------------

  async listSubjects(userId: string, tutorId: string): Promise<TutorSubjectRow[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<TutorSubjectRow[]>`
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name
      `,
    );
  }

  /**
   * Replaces the whole set in one transaction.
   *
   * A tutor's subject list is edited as a set in the UI, and applying it as
   * individual adds and removes would leave a half-applied list if one failed.
   * Delete-then-insert inside withUser() is atomic.
   */
  async replaceSubjects(
    userId: string,
    tutorId: string,
    entries: { subjectId: string; educationLevelId?: string | undefined }[],
  ): Promise<TutorSubjectRow[]> {
    return this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`delete from public.tutor_subjects where tutor_id = ${tutorId}::uuid`;

      for (const entry of entries) {
        await tx.$executeRaw`
          insert into public.tutor_subjects (tutor_id, subject_id, education_level_id)
          values (${tutorId}::uuid, ${entry.subjectId}::uuid, ${entry.educationLevelId ?? null}::uuid)
          on conflict do nothing
        `;
      }

      return tx.$queryRaw<TutorSubjectRow[]>`
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name
      `;
    });
  }

  async addSubject(
    userId: string,
    tutorId: string,
    subjectId: string,
    educationLevelId?: string | undefined,
  ): Promise<TutorSubjectRow> {
    return this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`
        insert into public.tutor_subjects (tutor_id, subject_id, education_level_id)
        values (${tutorId}::uuid, ${subjectId}::uuid, ${educationLevelId ?? null}::uuid)
        on conflict do nothing
      `;
      const rows = await tx.$queryRaw<TutorSubjectRow[]>`
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid and ts.subject_id = ${subjectId}::uuid
        limit 1
      `;
      return rows[0]!;
    });
  }

  async removeSubject(userId: string, id: string): Promise<boolean> {
    const n = await this.prisma.withUser(
      userId,
      // Scoped to the caller's own tutor record in SQL: the API's connection
      // is not subject to row-level security, so an id alone is not enough.
      async (tx) =>
        tx.$executeRaw`
        delete from public.tutor_subjects
        where id = ${id}::uuid and tutor_id = public.current_tutor_id()
      `,
    );
    return n > 0;
  }

  // --- Dashboard, students, reviews ------------------------------------------

  async dashboardSummary(userId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<
          Record<string, unknown>[]
        >`select * from public.tutor_dashboard_summary()`,
    );
    return rows[0] ?? null;
  }

  async students(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_students(${query.limit}, ${query.skip})
      `,
    );
  }

  async reviews(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_reviews(${query.limit}, ${query.skip})
      `,
    );
  }

  async ratingSummary(userId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`select * from public.tutor_rating_summary()`,
    );
    return rows[0] ?? null;
  }

  async ratingCategories(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<
          Record<string, unknown>[]
        >`select * from public.tutor_rating_categories()`,
    );
  }
}
