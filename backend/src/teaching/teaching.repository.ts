import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
import { NotAuthorizedError } from '../common/exceptions/app.exception';

/**
 * The SELECT policies of assignments and learning_resources, as SQL.
 *
 * The API connects as the tables' owner, so row-level security is not applied
 * and every read has to carry its policy itself. Kept verbatim from the
 * migrations so there is one definition of who may see what; the files module
 * uses the same predicates before it signs a download.
 */
export const ASSIGNMENT_VISIBLE = Prisma.sql`(
  public.owns_tutor(tutor_id)
  or (status <> 'draft' and public.can_access_student(student_id))
  or public.is_admin()
)`;

export const RESOURCE_VISIBLE = Prisma.sql`(
  public.owns_tutor(tutor_id)
  or (is_shared and student_id is not null and public.can_access_student(student_id))
  or public.is_admin()
)`;

export interface LessonNoteRow {
  id: string;
  booking_id: string;
  tutor_id: string;
  covered: string | null;
  understanding: string | null;
  improvements: string | null;
  next_steps: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentRow {
  id: string;
  tutor_id: string;
  student_id: string;
  booking_id: string | null;
  subject_id: string | null;
  title: string;
  instructions: string | null;
  submission_requirements: string | null;
  due_at: Date | null;
  resource_id: string | null;
  status: string;
  assigned_at: Date | null;
  submission_text: string | null;
  submission_path: string | null;
  submitted_at: Date | null;
  feedback: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  /** Filled by the list query only. */
  tutor_name?: string | null;
  subject_name?: string | null;
  student_first_name?: string | null;
  student_avatar_url?: string | null;
  resource_title?: string | null;
}

export interface LearningResourceRow {
  id: string;
  tutor_id: string;
  title: string;
  description: string | null;
  resource_type: string;
  storage_path: string | null;
  external_url: string | null;
  subject_id: string | null;
  student_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  is_shared: boolean;
  created_at: Date;
  /** Filled by the list query only. */
  tutor_name?: string | null;
  subject_name?: string | null;
  student_first_name?: string | null;
}

/**
 * Teaching artefacts: lesson notes, assignments and learning resources.
 *
 * All three share one access shape — a tutor manages their own rows, a family
 * reads what pertains to their learner — expressed by the "Tutors manage" /
 * "Families read" policies. Every method runs in the caller's claims, so the
 * same query serves both roles and returns each only what they may see.
 */
@Injectable()
export class TeachingRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // --- Lesson notes ----------------------------------------------------------

  async lessonNotesForBooking(userId: string, bookingId: string): Promise<LessonNoteRow[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<LessonNoteRow[]>`
        select id, booking_id, tutor_id, covered, understanding, improvements,
               next_steps, created_at, updated_at
        from public.lesson_notes where booking_id = ${bookingId}::uuid
          -- The three SELECT policies on lesson_notes, applied here: the API's
          -- connection owns the table, so row-level security does not.
          and (public.owns_tutor(tutor_id) or public.can_access_booking(booking_id)
               or public.is_admin())
        order by created_at desc
      `,
    );
  }

  /**
   * Creates or updates the note for a booking.
   *
   * One note per booking in practice, so this upserts: a tutor editing after
   * the lesson updates the existing row rather than stacking duplicates. The
   * "Tutors manage" policy confines it to the tutor's own bookings.
   */
  async upsertLessonNote(
    tutorUserId: string,
    input: {
      bookingId: string;
      covered?: string | undefined;
      understanding?: string | undefined;
      improvements?: string | undefined;
      nextSteps?: string | undefined;
    },
  ): Promise<LessonNoteRow> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      // Only the tutor who teaches the booking writes its note. The API's
      // connection is not subject to row-level security, so this is checked
      // here rather than left to the policy.
      const own = await tx.$queryRaw<{ ok: boolean }[]>`
        select exists (
          select 1 from public.bookings
          where id = ${input.bookingId}::uuid and tutor_id = public.current_tutor_id()
        ) as ok
      `;
      if (!own[0]?.ok)
        throw new NotAuthorizedError('You can only write notes for your own lessons.');

      const existing = await tx.$queryRaw<{ id: string }[]>`
        select id from public.lesson_notes where booking_id = ${input.bookingId}::uuid limit 1
      `;

      if (existing[0]) {
        const rows = await tx.$queryRaw<LessonNoteRow[]>`
          update public.lesson_notes set
            covered       = coalesce(${input.covered ?? null}, covered),
            understanding = coalesce(${input.understanding ?? null}, understanding),
            improvements  = coalesce(${input.improvements ?? null}, improvements),
            next_steps    = coalesce(${input.nextSteps ?? null}, next_steps),
            updated_at    = now()
          where id = ${existing[0].id}::uuid and public.owns_tutor(tutor_id)
          returning id, booking_id, tutor_id, covered, understanding, improvements,
                    next_steps, created_at, updated_at
        `;
        return rows[0]!;
      }

      // tutor_id is resolved by the database from the caller, not passed in —
      // current_tutor_id() is what the policy checks.
      const rows = await tx.$queryRaw<LessonNoteRow[]>`
        insert into public.lesson_notes (booking_id, tutor_id, covered, understanding, improvements, next_steps)
        values (
          ${input.bookingId}::uuid, public.current_tutor_id(),
          ${input.covered ?? null}, ${input.understanding ?? null},
          ${input.improvements ?? null}, ${input.nextSteps ?? null}
        )
        returning id, booking_id, tutor_id, covered, understanding, improvements,
                  next_steps, created_at, updated_at
      `;
      return rows[0]!;
    });
  }

  // --- Assignments -----------------------------------------------------------

  async listAssignments(
    userId: string,
    query: PaginationQueryDto,
    filters: { studentId?: string | undefined; status?: string | undefined },
  ): Promise<{ rows: AssignmentRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        select id, tutor_id, student_id, booking_id, subject_id, title, instructions,
               submission_requirements, due_at, resource_id, status::text, assigned_at,
               submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at,
               (select tp.full_name from public.tutors t join public.profiles tp on tp.id = t.profile_id
                 where t.id = assignments.tutor_id) as tutor_name,
               (select name from public.subjects where id = assignments.subject_id) as subject_name,
               (select first_name from public.students where id = assignments.student_id) as student_first_name,
               (select avatar_url from public.students where id = assignments.student_id) as student_avatar_url,
               (select title from public.learning_resources where id = assignments.resource_id) as resource_title
        from public.assignments
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          -- The SELECT policies on assignments, applied here: the API's
          -- connection owns the table, so row-level security does not.
          and ${ASSIGNMENT_VISIBLE}
        order by coalesce(due_at, created_at) desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.assignments
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          and ${ASSIGNMENT_VISIBLE}
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async findAssignment(userId: string, id: string): Promise<AssignmentRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        select id, tutor_id, student_id, booking_id, subject_id, title, instructions,
               submission_requirements, due_at, resource_id, status::text, assigned_at,
               submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
        from public.assignments where id = ${id}::uuid and ${ASSIGNMENT_VISIBLE}
      `;
      return rows[0] ?? null;
    });
  }

  async createAssignment(
    tutorUserId: string,
    input: {
      studentId: string;
      title: string;
      bookingId?: string | undefined;
      subjectId?: string | undefined;
      instructions?: string | undefined;
      submissionRequirements?: string | undefined;
      dueAt?: string | undefined;
      resourceId?: string | undefined;
      assignNow?: boolean | undefined;
    },
  ): Promise<AssignmentRow> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      // A draft stays invisible to the family. When status is 'assigned' the
      // assignments_notify trigger notifies them, so nothing is raised here.
      const assignNow = input.assignNow ?? true;
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        insert into public.assignments
          (tutor_id, student_id, booking_id, subject_id, title, instructions,
           submission_requirements, due_at, resource_id, status, assigned_at)
        values (
          public.current_tutor_id(), ${input.studentId}::uuid, ${input.bookingId ?? null}::uuid,
          ${input.subjectId ?? null}::uuid, ${input.title}, ${input.instructions ?? null},
          ${input.submissionRequirements ?? null}, ${input.dueAt ?? null}::timestamptz,
          ${input.resourceId ?? null}::uuid,
          (case when ${assignNow} then 'assigned' else 'draft' end)::public.assignment_status,
          case when ${assignNow} then now() end
        )
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
      return rows[0]!;
    });
  }

  /** A family submits work. The "Families submit" UPDATE policy scopes this. */
  async submitAssignment(
    userId: string,
    id: string,
    input: { submissionText?: string | undefined; submissionPath?: string | undefined },
  ): Promise<AssignmentRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        update public.assignments set
          submission_text = ${input.submissionText ?? null},
          submission_path = ${input.submissionPath ?? null},
          submitted_at    = now(),
          status          = 'submitted',
          updated_at      = now()
        -- The "Families submit" policy, applied here: the API's connection
        -- bypasses row-level security.
        where id = ${id}::uuid
          and status in ('assigned', 'submitted')
          and public.can_access_student(student_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
      return rows[0] ?? null;
    });
  }

  /** A tutor reviews a submission. */
  async reviewAssignment(
    tutorUserId: string,
    id: string,
    feedback: string | null,
  ): Promise<AssignmentRow | null> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        update public.assignments set
          feedback = ${feedback}::text, reviewed_at = now(), status = 'reviewed', updated_at = now()
        where id = ${id}::uuid and public.owns_tutor(tutor_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * Publishes a draft. Only a draft moves, so assigning twice cannot reset
   * assigned_at or re-notify the family (assignments_notify fires on the
   * change to 'assigned').
   */
  async assignDraft(tutorUserId: string, id: string): Promise<AssignmentRow | null> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<AssignmentRow[]>`
        update public.assignments set
          status = 'assigned', assigned_at = now(), updated_at = now()
        where id = ${id}::uuid and status = 'draft' and public.owns_tutor(tutor_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
      return rows[0] ?? null;
    });
  }

  // --- Learning resources ----------------------------------------------------

  async listResources(
    userId: string,
    query: PaginationQueryDto,
    filters: { studentId?: string | undefined; subjectId?: string | undefined },
  ): Promise<{ rows: LearningResourceRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<LearningResourceRow[]>`
        select id, tutor_id, title, description, resource_type::text, storage_path,
               external_url, subject_id, student_id, mime_type, size_bytes, is_shared, created_at,
               (select tp.full_name from public.tutors t join public.profiles tp on tp.id = t.profile_id
                 where t.id = learning_resources.tutor_id) as tutor_name,
               (select name from public.subjects where id = learning_resources.subject_id) as subject_name,
               (select first_name from public.students where id = learning_resources.student_id) as student_first_name
        from public.learning_resources
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.subjectId ?? null}::uuid is null or subject_id = ${filters.subjectId ?? null}::uuid)
          -- The SELECT policies on learning_resources, applied here.
          and ${RESOURCE_VISIBLE}
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.learning_resources
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.subjectId ?? null}::uuid is null or subject_id = ${filters.subjectId ?? null}::uuid)
          and ${RESOURCE_VISIBLE}
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async createResource(
    tutorUserId: string,
    input: {
      title: string;
      resourceType: string;
      description?: string | undefined;
      storagePath?: string | undefined;
      externalUrl?: string | undefined;
      subjectId?: string | undefined;
      studentId?: string | undefined;
      mimeType?: string | undefined;
      sizeBytes?: number | undefined;
      isShared?: boolean | undefined;
    },
  ): Promise<LearningResourceRow> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      // The key comes from the caller, so it is confined to this tutor's
      // folder — the rule "Tutors manage own learning files" applied to
      // storage. Otherwise a row could point at another tutor's file and the
      // files module would sign a link to it for this tutor's families.
      if (input.storagePath) {
        const owned = await tx.$queryRaw<{ ok: boolean }[]>`
          select coalesce(starts_with(${input.storagePath}, public.current_tutor_id()::text || '/'), false)
                 and position('..' in ${input.storagePath}) = 0 as ok
        `;
        if (!owned[0]?.ok) throw new NotAuthorizedError('That file does not belong to you.');
      }
      const rows = await tx.$queryRaw<LearningResourceRow[]>`
        insert into public.learning_resources
          (tutor_id, title, description, resource_type, storage_path, external_url,
           subject_id, student_id, mime_type, size_bytes, is_shared)
        values (
          public.current_tutor_id(), ${input.title}, ${input.description ?? null},
          ${input.resourceType}::public.resource_type, ${input.storagePath ?? null},
          ${input.externalUrl ?? null}, ${input.subjectId ?? null}::uuid,
          ${input.studentId ?? null}::uuid, ${input.mimeType ?? null},
          ${input.sizeBytes ?? null}, ${input.isShared ?? false}
        )
        returning id, tutor_id, title, description, resource_type::text, storage_path,
                  external_url, subject_id, student_id, mime_type, size_bytes, is_shared, created_at
      `;
      return rows[0]!;
    });
  }

  async deleteResource(tutorUserId: string, id: string): Promise<string | null> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<{ storage_path: string | null }[]>`
        delete from public.learning_resources
        where id = ${id}::uuid and public.owns_tutor(tutor_id)
        returning storage_path
      `;
      return rows.length ? (rows[0]!.storage_path ?? '') : null;
    });
  }
}
