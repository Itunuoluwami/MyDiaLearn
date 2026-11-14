import { CatalogueService } from './catalogue.service';
import { SearchSuggestionsQueryDto, TutorCardsQueryDto, TutorReviewsQueryDto, TutorSearchQueryDto } from './dto/catalogue.dto';
export declare class CatalogueController {
    private readonly catalogue;
    constructor(catalogue: CatalogueService);
    subjects(): Promise<Record<string, unknown>[]>;
    curricula(): Promise<Record<string, unknown>[]>;
    countries(): Promise<Record<string, unknown>[]>;
    educationLevels(): Promise<Record<string, unknown>[]>;
    settings(): Promise<Record<string, unknown>>;
    cancellationPolicies(): Promise<Record<string, unknown>[]>;
    verificationSteps(): Promise<Record<string, unknown>[]>;
    commissionExample(): Promise<Record<string, unknown> | null>;
    currencies(): Promise<Record<string, unknown>[]>;
    suggestions(query: SearchSuggestionsQueryDto): Promise<Record<string, unknown>[]>;
    searchTutors(query: TutorSearchQueryDto): Promise<Omit<import("../shared").Paginated<Record<string, unknown>>, "meta"> & {
        meta: Omit<import("../shared").PageMeta, "total" | "totalPages">;
    }>;
    tutorCards(dto: TutorCardsQueryDto): Promise<Record<string, unknown>[]>;
    tutorDetail(id: string): Promise<Record<string, unknown>>;
    tutorSubjects(id: string): Promise<Record<string, unknown>[]>;
    tutorReviews(id: string, query: TutorReviewsQueryDto): Promise<Record<string, unknown>[]>;
}
