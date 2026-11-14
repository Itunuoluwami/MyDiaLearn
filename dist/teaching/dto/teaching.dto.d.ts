import { PaginationQueryDto } from '../../shared/query.dto';
export declare const ASSIGNMENT_STATUSES: readonly ["draft", "assigned", "submitted", "reviewed"];
export declare const RESOURCE_TYPES: readonly ["pdf", "video", "link", "document", "image", "other"];
export declare class UpsertLessonNoteDto {
    covered?: string;
    understanding?: string;
    improvements?: string;
    nextSteps?: string;
}
export declare class CreateAssignmentDto {
    studentId: string;
    title: string;
    bookingId?: string;
    subjectId?: string;
    instructions?: string;
    submissionRequirements?: string;
    dueAt?: string;
    resourceId?: string;
    assignNow?: boolean;
}
export declare class SubmitAssignmentDto {
    submissionText?: string;
    submissionPath?: string;
}
export declare class ReviewAssignmentDto {
    feedback?: string;
}
export declare class ListAssignmentsQueryDto extends PaginationQueryDto {
    studentId?: string;
    status?: (typeof ASSIGNMENT_STATUSES)[number];
}
export declare class CreateResourceDto {
    title: string;
    resourceType: (typeof RESOURCE_TYPES)[number];
    description?: string;
    storagePath?: string;
    externalUrl?: string;
    subjectId?: string;
    studentId?: string;
    mimeType?: string;
    sizeBytes?: number;
    isShared?: boolean;
}
export declare class ListResourcesQueryDto extends PaginationQueryDto {
    studentId?: string;
    subjectId?: string;
}
export interface LessonNoteResponse {
    id: string;
    bookingId: string;
    covered: string | null;
    understanding: string | null;
    improvements: string | null;
    nextSteps: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface AssignmentResponse {
    id: string;
    studentId: string;
    tutorId: string;
    tutorName: string | null;
    bookingId: string | null;
    subjectId: string | null;
    subjectName: string | null;
    studentFirstName: string | null;
    studentAvatarUrl: string | null;
    resourceId: string | null;
    resourceTitle: string | null;
    title: string;
    instructions: string | null;
    submissionRequirements: string | null;
    dueAt: string | null;
    status: string;
    submissionText: string | null;
    submittedAt: string | null;
    feedback: string | null;
    reviewedAt: string | null;
    createdAt: string;
}
export interface ResourceResponse {
    id: string;
    title: string;
    description: string | null;
    resourceType: string;
    externalUrl: string | null;
    hasFile: boolean;
    subjectId: string | null;
    studentId: string | null;
    isShared: boolean;
    tutorId: string;
    tutorName: string | null;
    subjectName: string | null;
    studentFirstName: string | null;
    createdAt: string;
}
