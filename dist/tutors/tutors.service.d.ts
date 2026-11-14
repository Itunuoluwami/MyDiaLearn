import { AuditService, type AuditContext } from '../common/audit/audit.service';
import type { PaginationQueryDto } from '../shared/query.dto';
import type { TutorProfileResponse, TutorSubjectResponse, UpdateTutorProfileDto } from './dto/tutor.dto';
import { TutorsRepository, type TutorRow, type TutorSubjectRow } from './tutors.repository';
export declare class TutorsService {
    private readonly repository;
    private readonly audit;
    constructor(repository: TutorsRepository, audit: AuditService);
    me(userId: string): Promise<TutorProfileResponse>;
    updateMe(userId: string, dto: UpdateTutorProfileDto, context: AuditContext): Promise<TutorProfileResponse>;
    subjects(userId: string): Promise<TutorSubjectResponse[]>;
    replaceSubjects(userId: string, entries: {
        subjectId: string;
        educationLevelId?: string | undefined;
    }[], context: AuditContext): Promise<TutorSubjectResponse[]>;
    addSubject(userId: string, subjectId: string, educationLevelId: string | undefined, context: AuditContext): Promise<TutorSubjectResponse>;
    removeSubject(userId: string, id: string): Promise<void>;
    dashboard(userId: string): Promise<Record<string, unknown> | null>;
    students(userId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    reviews(userId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    ratingSummary(userId: string): Promise<Record<string, unknown> | null>;
    ratingCategories(userId: string): Promise<Record<string, unknown>[]>;
}
export declare function toResponse(row: TutorRow): TutorProfileResponse;
export declare function toSubjectResponse(row: TutorSubjectRow): TutorSubjectResponse;
