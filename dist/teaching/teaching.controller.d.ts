import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { CreateAssignmentDto, CreateResourceDto, ListAssignmentsQueryDto, ListResourcesQueryDto, ReviewAssignmentDto, SubmitAssignmentDto, UpsertLessonNoteDto, type AssignmentResponse, type LessonNoteResponse, type ResourceResponse } from './dto/teaching.dto';
import { TeachingService } from './teaching.service';
export declare class TeachingController {
    private readonly teaching;
    constructor(teaching: TeachingService);
    lessonNotes(user: AuthenticatedUser, bookingId: string): Promise<LessonNoteResponse[]>;
    saveLessonNote(user: AuthenticatedUser, bookingId: string, dto: UpsertLessonNoteDto): Promise<LessonNoteResponse>;
    assignments(user: AuthenticatedUser, query: ListAssignmentsQueryDto): Promise<Paginated<AssignmentResponse>>;
    createAssignment(user: AuthenticatedUser, dto: CreateAssignmentDto): Promise<AssignmentResponse>;
    assignment(user: AuthenticatedUser, id: string): Promise<AssignmentResponse>;
    submit(user: AuthenticatedUser, id: string, dto: SubmitAssignmentDto): Promise<AssignmentResponse>;
    assign(user: AuthenticatedUser, id: string): Promise<AssignmentResponse>;
    review(user: AuthenticatedUser, id: string, dto: ReviewAssignmentDto): Promise<AssignmentResponse>;
    resources(user: AuthenticatedUser, query: ListResourcesQueryDto): Promise<Paginated<ResourceResponse>>;
    createResource(user: AuthenticatedUser, dto: CreateResourceDto): Promise<ResourceResponse>;
    deleteResource(user: AuthenticatedUser, id: string): Promise<void>;
}
