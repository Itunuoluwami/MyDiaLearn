import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotFoundError } from '../common/exceptions/app.exception';
import type { PaginationQueryDto } from '../shared/query.dto';
import type {
  TutorProfileResponse,
  TutorSubjectResponse,
  UpdateTutorProfileDto,
} from './dto/tutor.dto';
import { TutorsRepository, type TutorRow, type TutorSubjectRow } from './tutors.repository';

/**
 * A tutor's own profile, subjects, dashboard and reviews.
 *
 * Note what this service does not decide: whether the tutor is listed or
 * bookable. `is_listed` and `verification_status` are maintained by the
 * enforce_tutor_verification_rules trigger, so they are reported here and never
 * written.
 */
@Injectable()
export class TutorsService {
  constructor(
    private readonly repository: TutorsRepository,
    private readonly audit: AuditService,
  ) {}

  /** The caller's tutor record, created on first access. */
  async me(userId: string): Promise<TutorProfileResponse> {
    return toResponse(await this.repository.ensureOwn(userId));
  }

  async updateMe(
    userId: string,
    dto: UpdateTutorProfileDto,
    context: AuditContext,
  ): Promise<TutorProfileResponse> {
    await this.repository.ensureOwn(userId);
    const updated = await this.repository.updateOwn(userId, dto);
    if (!updated) throw new NotFoundError('Tutor profile');

    await this.audit.record('user.profile_updated', {
      actorId: userId,
      entityType: 'tutor',
      entityId: updated.id,
      context,
      // Field names only. The values are the tutor's own content and add
      // nothing to a trail that already says who changed what and when.
      metadata: { fields: Object.keys(dto), scope: 'tutor_profile' },
    });

    return toResponse(updated);
  }

  async subjects(userId: string): Promise<TutorSubjectResponse[]> {
    const tutor = await this.repository.ensureOwn(userId);
    const rows = await this.repository.listSubjects(userId, tutor.id);
    return rows.map(toSubjectResponse);
  }

  async replaceSubjects(
    userId: string,
    entries: { subjectId: string; educationLevelId?: string | undefined }[],
    context: AuditContext,
  ): Promise<TutorSubjectResponse[]> {
    const tutor = await this.repository.ensureOwn(userId);
    const rows = await this.repository.replaceSubjects(userId, tutor.id, entries);

    await this.audit.record('user.profile_updated', {
      actorId: userId,
      entityType: 'tutor',
      entityId: tutor.id,
      context,
      metadata: { scope: 'tutor_subjects', count: rows.length },
    });

    return rows.map(toSubjectResponse);
  }

  async addSubject(
    userId: string,
    subjectId: string,
    educationLevelId: string | undefined,
    context: AuditContext,
  ): Promise<TutorSubjectResponse> {
    const tutor = await this.repository.ensureOwn(userId);
    const row = await this.repository.addSubject(
      userId,
      tutor.id,
      subjectId,
      educationLevelId,
    );
    await this.audit.record('user.profile_updated', {
      actorId: userId,
      entityType: 'tutor',
      entityId: tutor.id,
      context,
      metadata: { scope: 'tutor_subject_added', subjectId },
    });
    return toSubjectResponse(row);
  }

  async removeSubject(userId: string, id: string): Promise<void> {
    const ok = await this.repository.removeSubject(userId, id);
    if (!ok) throw new NotFoundError('Tutor subject');
  }

  async dashboard(userId: string): Promise<Record<string, unknown> | null> {
    return this.repository.dashboardSummary(userId);
  }

  async students(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.repository.students(userId, query);
  }

  async reviews(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.repository.reviews(userId, query);
  }

  async ratingSummary(userId: string): Promise<Record<string, unknown> | null> {
    return this.repository.ratingSummary(userId);
  }

  async ratingCategories(userId: string): Promise<Record<string, unknown>[]> {
    return this.repository.ratingCategories(userId);
  }
}

export function toResponse(row: TutorRow): TutorProfileResponse {
  return {
    id: row.id,
    profileId: row.profile_id,
    agencyId: row.agency_id,
    headline: row.headline,
    biography: row.biography,
    qualifications: row.qualifications ?? [],
    languages: row.languages ?? [],
    education: row.education ?? [],
    hourlyRate: row.hourly_rate === null ? null : String(row.hourly_rate),
    currency: row.currency,
    yearsExperience: row.years_experience,
    introVideoUrl: row.intro_video_url,
    timezone: row.timezone,
    verificationStatus: row.verification_status,
    isListed: row.is_listed,
    methodology: row.methodology,
    teachingContext: row.teaching_context,
    onboardingStep: row.onboarding_step,
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
  };
}

export function toSubjectResponse(row: TutorSubjectRow): TutorSubjectResponse {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    educationLevelId: row.education_level_id,
    levelName: row.level_name,
  };
}
