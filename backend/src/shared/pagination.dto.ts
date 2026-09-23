import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared cursor-free pagination for list endpoints.
 *
 * Capped at 100 so a caller cannot ask for an unbounded page. Several admin
 * screens currently pull whole tables into the browser and export them as CSV
 * client-side; when those move here, the cap is what stops one request
 * dragging the whole bookings table across the wire.
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

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function paginated<T>(
  data: T[],
  total: number,
  query: PaginationQueryDto,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
