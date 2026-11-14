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
export declare class TutorsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    ensureOwn(userId: string): Promise<TutorRow>;
    findOwn(userId: string): Promise<TutorRow | null>;
    updateOwn(userId: string, input: UpdateTutorInput): Promise<TutorRow | null>;
    listSubjects(userId: string, tutorId: string): Promise<TutorSubjectRow[]>;
    replaceSubjects(userId: string, tutorId: string, entries: {
        subjectId: string;
        educationLevelId?: string | undefined;
    }[]): Promise<TutorSubjectRow[]>;
    addSubject(userId: string, tutorId: string, subjectId: string, educationLevelId?: string | undefined): Promise<TutorSubjectRow>;
    removeSubject(userId: string, id: string): Promise<boolean>;
    dashboardSummary(userId: string): Promise<Record<string, unknown> | null>;
    students(userId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    reviews(userId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    ratingSummary(userId: string): Promise<Record<string, unknown> | null>;
    ratingCategories(userId: string): Promise<Record<string, unknown>[]>;
}
