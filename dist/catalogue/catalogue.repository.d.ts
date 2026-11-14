import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
export interface TutorSearchFilters {
    q?: string | undefined;
    subjectId?: string | undefined;
    curriculumId?: string | undefined;
    country?: string | undefined;
    educationLevelId?: string | undefined;
    language?: string | undefined;
    minRating?: number | undefined;
    maxPrice?: number | undefined;
    sort?: string | undefined;
    limit: number;
    offset: number;
}
export declare class CatalogueRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    subjects(): Promise<Record<string, unknown>[]>;
    curricula(): Promise<Record<string, unknown>[]>;
    countries(): Promise<Record<string, unknown>[]>;
    educationLevels(): Promise<Record<string, unknown>[]>;
    currencies(): Promise<Record<string, unknown>[]>;
    searchSuggestions(q: string, limit: number): Promise<Record<string, unknown>[]>;
    searchTutors(filters: TutorSearchFilters): Promise<Record<string, unknown>[]>;
    tutorDetail(tutorId: string): Promise<Record<string, unknown> | null>;
    tutorReviews(tutorId: string, limit: number): Promise<Record<string, unknown>[]>;
    publicSettings(): Promise<Record<string, unknown>>;
    tutorSubjects(tutorId: string): Promise<Record<string, unknown>[]>;
    cancellationPolicies(): Promise<Record<string, unknown>[]>;
    verificationSteps(): Promise<Record<string, unknown>[]>;
    commissionExample(): Promise<Record<string, unknown> | null>;
    tutorCards(ids: string[]): Promise<Record<string, unknown>[]>;
}
