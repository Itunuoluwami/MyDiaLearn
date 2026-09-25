import { Injectable } from '@nestjs/common';

import { NotFoundError } from '../common/exceptions/app.exception';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type {
  AssignmentResponse,
  LessonNoteResponse,
  ResourceResponse,
} from './dto/teaching.dto';
import {
  TeachingRepository,
  type AssignmentRow,
  type LearningResourceRow,
  type LessonNoteRow,
} from './teaching.repository';

/**
 * Lesson notes, assignments and learning resources.
 *
 * Access is the database's decision — tutors manage their own, families read
 * what pertains to their learner — so this service orchestrates and shapes
 * rather than re-checking. A row the caller may not see comes back absent, and
 * absent is reported as not-found, which does not confirm it exists.
 */
@Injectable()
export class TeachingService {
  constructor(private readonly repository: TeachingRepository) {}

  // --- Lesson notes ----------------------------------------------------------

  async lessonNotes(userId: string, bookingId: string): Promise<LessonNoteResponse[]> {
    const rows = await this.repository.lessonNotesForBooking(userId, bookingId);
    return rows.map(toLessonNote);
  }

  async saveLessonNote(
    tutorUserId: string,
    bookingId: string,
    input: {
      covered?: string;
      understanding?: string;
      improvements?: string;
      nextSteps?: string;
    },
  ): Promise<LessonNoteResponse> {
    const row = await this.repository.upsertLessonNote(tutorUserId, { bookingId, ...input });
    return toLessonNote(row);
  }

  // --- Assignments -----------------------------------------------------------

  async assignments(
    userId: string,
    query: PaginationQueryDto & { studentId?: string; status?: string },
  ): Promise<Paginated<AssignmentResponse>> {
    const { rows, total } = await this.repository.listAssignments(userId, query, {
      studentId: query.studentId,
      status: query.status,
    });
    return paginate(rows.map(toAssignment), total, query);
  }

  async assignment(userId: string, id: string): Promise<AssignmentResponse> {
    const row = await this.repository.findAssignment(userId, id);
    if (!row) throw new NotFoundError('Assignment');
    return toAssignment(row);
  }

  async createAssignment(
    tutorUserId: string,
    input: Parameters<TeachingRepository['createAssignment']>[1],
  ): Promise<AssignmentResponse> {
    // The assignments_notify trigger notifies the family, so no notification is
    // raised here. Not audited: setting homework is routine, not sensitive.
    return toAssignment(await this.repository.createAssignment(tutorUserId, input));
  }

  async submitAssignment(
    userId: string,
    id: string,
    input: { submissionText?: string; submissionPath?: string },
  ): Promise<AssignmentResponse> {
    const row = await this.repository.submitAssignment(userId, id, input);
    if (!row) throw new NotFoundError('Assignment');
    return toAssignment(row);
  }

  async reviewAssignment(
    tutorUserId: string,
    id: string,
    feedback: string,
  ): Promise<AssignmentResponse> {
    const row = await this.repository.reviewAssignment(tutorUserId, id, feedback);
    if (!row) throw new NotFoundError('Assignment');
    return toAssignment(row);
  }

  // --- Learning resources ----------------------------------------------------

  async resources(
    userId: string,
    query: PaginationQueryDto & { studentId?: string; subjectId?: string },
  ): Promise<Paginated<ResourceResponse>> {
    const { rows, total } = await this.repository.listResources(userId, query, {
      studentId: query.studentId,
      subjectId: query.subjectId,
    });
    return paginate(rows.map(toResource), total, query);
  }

  async createResource(
    tutorUserId: string,
    input: Parameters<TeachingRepository['createResource']>[1],
  ): Promise<ResourceResponse> {
    return toResource(await this.repository.createResource(tutorUserId, input));
  }

  async deleteResource(tutorUserId: string, id: string): Promise<void> {
    const result = await this.repository.deleteResource(tutorUserId, id);
    if (result === null) throw new NotFoundError('Resource');
    // The stored file, if any, is removed by the files module's storage
    // provider; this returns the key for that follow-up once storage is wired.
  }
}

export function toLessonNote(row: LessonNoteRow): LessonNoteResponse {
  return {
    id: row.id,
    bookingId: row.booking_id,
    covered: row.covered,
    understanding: row.understanding,
    improvements: row.improvements,
    nextSteps: row.next_steps,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function toAssignment(row: AssignmentRow): AssignmentResponse {
  return {
    id: row.id,
    studentId: row.student_id,
    bookingId: row.booking_id,
    subjectId: row.subject_id,
    title: row.title,
    instructions: row.instructions,
    submissionRequirements: row.submission_requirements,
    dueAt: row.due_at ? row.due_at.toISOString() : null,
    status: row.status,
    submissionText: row.submission_text,
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    feedback: row.feedback,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

export function toResource(row: LearningResourceRow): ResourceResponse {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    resourceType: row.resource_type,
    externalUrl: row.external_url,
    hasFile: row.storage_path !== null,
    subjectId: row.subject_id,
    studentId: row.student_id,
    isShared: row.is_shared,
    createdAt: row.created_at.toISOString(),
  };
}
