import { PaginationQueryDto } from '../../shared/query.dto';
export declare const TUTOR_SORTS: readonly ["top_rated", "price_low", "price_high", "newest"];
export declare class TutorSearchQueryDto extends PaginationQueryDto {
    q?: string;
    subjectId?: string;
    curriculumId?: string;
    country?: string;
    educationLevelId?: string;
    language?: string;
    minRating?: number;
    maxPrice?: number;
    sort?: (typeof TUTOR_SORTS)[number];
}
export declare class SearchSuggestionsQueryDto {
    q: string;
    limit: number;
}
export declare class TutorReviewsQueryDto {
    limit: number;
}
export declare class TutorCardsQueryDto {
    ids: string[];
}
