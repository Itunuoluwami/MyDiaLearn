export declare class PaginationQueryDto {
    page: number;
    limit: number;
    get skip(): number;
}
export type SortDirection = 'asc' | 'desc';
export declare class SortQueryDto extends PaginationQueryDto {
    sortBy?: string;
    sortDirection: SortDirection;
}
export declare function resolveSort<T extends string>(requested: string | undefined, allowed: readonly T[], fallback: T): T;
export declare class SearchQueryDto extends SortQueryDto {
    q?: string;
}
export interface PageMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
}
export interface Paginated<T> {
    data: T[];
    meta: PageMeta;
}
export declare function paginate<T>(data: T[], total: number, query: PaginationQueryDto): Paginated<T>;
export declare function paginateWithoutTotal<T>(rows: T[], query: PaginationQueryDto): Omit<Paginated<T>, 'meta'> & {
    meta: Omit<PageMeta, 'total' | 'totalPages'>;
};
