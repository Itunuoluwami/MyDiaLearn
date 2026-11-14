import { paginateWithoutTotal, type PaginationQueryDto } from '../shared/query.dto';
import { CatalogueRepository, type TutorSearchFilters } from './catalogue.repository';
export declare class CatalogueService {
    private readonly repository;
    constructor(repository: CatalogueRepository);
    subjects(): Promise<Record<string, unknown>[]>;
    curricula(): Promise<Record<string, unknown>[]>;
    countries(): Promise<Record<string, unknown>[]>;
    educationLevels(): Promise<Record<string, unknown>[]>;
    currencies(): Promise<Record<string, unknown>[]>;
    suggestions(q: string, limit: number): Promise<Record<string, unknown>[]>;
    searchTutors(query: PaginationQueryDto & Omit<TutorSearchFilters, 'limit' | 'offset'>): Promise<ReturnType<typeof paginateWithoutTotal<Record<string, unknown>>>>;
    tutorSubjects(tutorId: string): Promise<Record<string, unknown>[]>;
    tutorDetail(tutorId: string): Promise<Record<string, unknown>>;
    tutorReviews(tutorId: string, limit: number): Promise<Record<string, unknown>[]>;
    publicSettings(): Promise<Record<string, unknown>>;
    cancellationPolicies(): Promise<Record<string, unknown>[]>;
    verificationSteps(): Promise<Record<string, unknown>[]>;
    commissionExample(): Promise<Record<string, unknown> | null>;
    tutorCards(ids: string[]): Promise<Record<string, unknown>[]>;
}
