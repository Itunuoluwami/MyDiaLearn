import { Inject, Injectable } from '@nestjs/common';

import { NotAuthorizedError, NotFoundError } from '../common/exceptions/app.exception';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../integrations/storage/storage.interface';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
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
  constructor(
    private readonly repository: TeachingRepository,
    private readonly notifications: NotificationDispatchService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /**
   * The email half of "your tutor set you homework".
   *
   * The in-app half is raised by the assignments_notify trigger in the
   * database, so only email is sent here — dispatching both would show the
   * learner the same thing twice. Best-effort: homework that has been set
   * stays set whether or not the mail goes out.
   */
  private async emailAssignment(assignmentId: string): Promise<void> {
    try {
      const recipient = await this.repository.assignmentRecipient(assignmentId);
      if (!recipient?.student_email) return;
      await this.notifications.dispatchEmail({
        to: recipient.student_email,
        triggerKey: 'assignment.assigned',
        vars: {
          title: recipient.title,
          tutor_name: recipient.tutor_name ?? 'Your tutor',
          // The in-app template says the same when there is no date.
          due_at: recipient.due_at ? recipient.due_at.toISOString().slice(0, 10) : 'soon',
        },
      });
    } catch {
      // Already logged by the dispatcher; never fails setting the homework.
    }
  }

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
    // The assignments_notify trigger raises the in-app notice; only the email
    // half is sent from here. Not audited: setting homework is routine.
    const row = await this.repository.createAssignment(tutorUserId, input);
    if (row.status === 'assigned') await this.emailAssignment(row.id);
    return toAssignment(row);
  }

  async submitAssignment(
    userId: string,
    id: string,
    input: { submissionText?: string; submissionPath?: string },
  ): Promise<AssignmentResponse> {
    // "Families upload submissions" only allowed submissions/<own uid>/, and a
    // tutor is later shown whatever this points at, so hold it to that folder.
    if (
      input.submissionPath &&
      (!input.submissionPath.startsWith(`submissions/${userId}/`) ||
        input.submissionPath.includes('..'))
    ) {
      throw new NotAuthorizedError('That file does not belong to you.');
    }
    const row = await this.repository.submitAssignment(userId, id, input);
    if (!row) throw new NotFoundError('Assignment');
    return toAssignment(row);
  }

  async reviewAssignment(
    tutorUserId: string,
    id: string,
    feedback: string | undefined,
  ): Promise<AssignmentResponse> {
    const row = await this.repository.reviewAssignment(
      tutorUserId,
      id,
      feedback?.trim() ? feedback.trim() : null,
    );
    if (!row) throw new NotFoundError('Assignment');
    return toAssignment(row);
  }

  async assignDraft(tutorUserId: string, id: string): Promise<AssignmentResponse> {
    const row = await this.repository.assignDraft(tutorUserId, id);
    // Missing, not the caller's, or no longer a draft: none can be assigned.
    if (!row) throw new NotFoundError('Draft assignment');
    // A draft becoming assigned is the moment the learner first hears of it.
    await this.emailAssignment(row.id);
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
    if (!result) return;
    // The row is gone either way; a file that cannot be removed is an orphan
    // for housekeeping, not an error for the tutor.
    try {
      await this.storage.remove('learning-resources', [result]);
    } catch {
      // Intentionally swallowed, as in TutorVerificationService.removeDocument.
    }
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
    tutorId: row.tutor_id,
    tutorName: row.tutor_name ?? null,
    bookingId: row.booking_id,
    subjectId: row.subject_id,
    subjectName: row.subject_name ?? null,
    studentFirstName: row.student_first_name ?? null,
    studentAvatarUrl: row.student_avatar_url ?? null,
    resourceId: row.resource_id,
    resourceTitle: row.resource_title ?? null,
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
    tutorId: row.tutor_id,
    tutorName: row.tutor_name ?? null,
    subjectName: row.subject_name ?? null,
    studentFirstName: row.student_first_name ?? null,
    createdAt: row.created_at.toISOString(),
  };
}
