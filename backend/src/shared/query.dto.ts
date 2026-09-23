import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Validated pagination, sorting and search for list endpoints.
 *
 * The limit is capped rather than merely defaulted. Several admin screens
 * currently pull whole tables into the browser to build a CSV client-side;
 * when those move here, the cap is what stops one request dragging the entire
 * bookings table across the wire.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export type SortDirection = 'asc' | 'desc';

/**
 * Sorting with an allow-list.
 *
 * `sortBy` is interpolated into SQL by repositories, so it can never be taken
 * from the request unchecked. Each module declares the columns it permits and
 * calls `resolveSort`, which is the only sanctioned path.
 */
export class SortQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection: SortDirection = 'desc';
}

/**
 * Maps a requested sort onto a column the module allows.
 *
 * Falls back to the default rather than throwing: a stale bookmark carrying an
 * old column name should still return results.
 */
export function resolveSort<T extends string>(
  requested: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(requested as T) ? (requested as T) : fallback;
}

export class SearchQueryDto extends SortQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
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

export function paginate<T>(
  data: T[],
  total: number,
  query: PaginationQueryDto,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
    },
  };
}

/**
 * Page built from a limit/offset call that does not report a total.
 *
 * Most of the existing database functions take p_limit and p_offset and return
 * rows only. Rather than issue a second COUNT — which for several of them
 * would mean running the whole query twice — the page is described by asking
 * for one extra row and seeing whether it arrived.
 */
export function paginateWithoutTotal<T>(
  rows: T[],
  query: PaginationQueryDto,
): Omit<Paginated<T>, 'meta'> & { meta: Omit<PageMeta, 'total' | 'totalPages'> } {
  const hasNext = rows.length > query.limit;
  return {
    data: hasNext ? rows.slice(0, query.limit) : rows,
    meta: { page: query.page, limit: query.limit, hasNext },
  };
}
