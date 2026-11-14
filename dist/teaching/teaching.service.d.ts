import { type StorageProvider } from '../integrations/storage/storage.interface';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { AssignmentResponse, LessonNoteResponse, ResourceResponse } from './dto/teaching.dto';
import { TeachingRepository, type AssignmentRow, type LearningResourceRow, type LessonNoteRow } from './teaching.repository';
export declare class TeachingService {
    private readonly repository;
    private readonly notifications;
    private readonly storage;
    constructor(repository: TeachingRepository, notifications: NotificationDispatchService, storage: StorageProvider);
    private emailAssignment;
    lessonNotes(userId: string, bookingId: string): Promise<LessonNoteResponse[]>;
    saveLessonNote(tutorUserId: string, bookingId: string, input: {
        covered?: string;
        understanding?: string;
        improvements?: string;
        nextSteps?: string;
    }): Promise<LessonNoteResponse>;
    assignments(userId: string, query: PaginationQueryDto & {
        studentId?: string;
        status?: string;
    }): Promise<Paginated<AssignmentResponse>>;
    assignment(userId: string, id: string): Promise<AssignmentResponse>;
    createAssignment(tutorUserId: string, input: Parameters<TeachingRepository['createAssignment']>[1]): Promise<AssignmentResponse>;
    submitAssignment(userId: string, id: string, input: {
        submissionText?: string;
        submissionPath?: string;
    }): Promise<AssignmentResponse>;
    reviewAssignment(tutorUserId: string, id: string, feedback: string | undefined): Promise<AssignmentResponse>;
    assignDraft(tutorUserId: string, id: string): Promise<AssignmentResponse>;
    resources(userId: string, query: PaginationQueryDto & {
        studentId?: string;
        subjectId?: string;
    }): Promise<Paginated<ResourceResponse>>;
    createResource(tutorUserId: string, input: Parameters<TeachingRepository['createResource']>[1]): Promise<ResourceResponse>;
    deleteResource(tutorUserId: string, id: string): Promise<void>;
}
export declare function toLessonNote(row: LessonNoteRow): LessonNoteResponse;
export declare function toAssignment(row: AssignmentRow): AssignmentResponse;
export declare function toResource(row: LearningResourceRow): ResourceResponse;
