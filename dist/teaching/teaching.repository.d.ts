import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export declare const ASSIGNMENT_VISIBLE: Prisma.Sql;
export declare const RESOURCE_VISIBLE: Prisma.Sql;
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
    tutor_name?: string | null;
    subject_name?: string | null;
    student_first_name?: string | null;
}
export declare class TeachingRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    lessonNotesForBooking(userId: string, bookingId: string): Promise<LessonNoteRow[]>;
    upsertLessonNote(tutorUserId: string, input: {
        bookingId: string;
        covered?: string | undefined;
        understanding?: string | undefined;
        improvements?: string | undefined;
        nextSteps?: string | undefined;
    }): Promise<LessonNoteRow>;
    listAssignments(userId: string, query: PaginationQueryDto, filters: {
        studentId?: string | undefined;
        status?: string | undefined;
    }): Promise<{
        rows: AssignmentRow[];
        total: number;
    }>;
    findAssignment(userId: string, id: string): Promise<AssignmentRow | null>;
    assignmentRecipient(assignmentId: string): Promise<{
        student_email: string | null;
        tutor_name: string | null;
        title: string;
        due_at: Date | null;
    } | null>;
    createAssignment(tutorUserId: string, input: {
        studentId: string;
        title: string;
        bookingId?: string | undefined;
        subjectId?: string | undefined;
        instructions?: string | undefined;
        submissionRequirements?: string | undefined;
        dueAt?: string | undefined;
        resourceId?: string | undefined;
        assignNow?: boolean | undefined;
    }): Promise<AssignmentRow>;
    submitAssignment(userId: string, id: string, input: {
        submissionText?: string | undefined;
        submissionPath?: string | undefined;
    }): Promise<AssignmentRow | null>;
    reviewAssignment(tutorUserId: string, id: string, feedback: string | null): Promise<AssignmentRow | null>;
    assignDraft(tutorUserId: string, id: string): Promise<AssignmentRow | null>;
    listResources(userId: string, query: PaginationQueryDto, filters: {
        studentId?: string | undefined;
        subjectId?: string | undefined;
    }): Promise<{
        rows: LearningResourceRow[];
        total: number;
    }>;
    createResource(tutorUserId: string, input: {
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
    }): Promise<LearningResourceRow>;
    deleteResource(tutorUserId: string, id: string): Promise<string | null>;
}
