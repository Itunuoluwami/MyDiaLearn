import { Injectable } from '@nestjs/common';

import { NotFoundError } from '../common/exceptions/app.exception';
import { paginateWithoutTotal, type PaginationQueryDto } from '../shared/query.dto';
import { CatalogueRepository, type TutorSearchFilters } from './catalogue.repository';

/**
 * Reference data and public tutor discovery.
 *
 * Thin by design: the facet and search functions already encode which tutors
 * are publicly visible — the rule that an unverified tutor is not bookable is
 * enforced inside them, not by a filter added here. Re-expressing it would
 * create a second definition of "publicly visible", and the two would diverge.
 */
@Injectable()
export class CatalogueService {
  constructor(private readonly repository: CatalogueRepository) {}

  subjects(): Promise<Record<string, unknown>[]> {
    return this.repository.subjects();
  }

  curricula(): Promise<Record<string, unknown>[]> {
    return this.repository.curricula();
  }

  countries(): Promise<Record<string, unknown>[]> {
    return this.repository.countries();
  }

  educationLevels(): Promise<Record<string, unknown>[]> {
    return this.repository.educationLevels();
  }

  currencies(): Promise<Record<string, unknown>[]> {
    return this.repository.currencies();
  }

  suggestions(q: string, limit: number): Promise<Record<string, unknown>[]> {
    if (!q) return Promise.resolve([]);
    return this.repository.searchSuggestions(q, limit);
  }

  /**
   * Tutor search.
   *
   * public_tutor_search() returns rows without a total, and counting would mean
   * running the whole query twice. One extra row is requested instead, so the
   * page can report whether another exists — enough for "next", which is all
   * the UI offers.
   */
  async searchTutors(
    query: PaginationQueryDto & Omit<TutorSearchFilters, 'limit' | 'offset'>,
  ): Promise<ReturnType<typeof paginateWithoutTotal<Record<string, unknown>>>> {
    const rows = await this.repository.searchTutors({
      q: query.q,
      subjectId: query.subjectId,
      curriculumId: query.curriculumId,
      country: query.country,
      educationLevelId: query.educationLevelId,
      language: query.language,
      minRating: query.minRating,
      maxPrice: query.maxPrice,
      sort: query.sort,
      limit: query.limit + 1,
      offset: query.skip,
    });
    return paginateWithoutTotal(rows, query);
  }

  async tutorDetail(tutorId: string): Promise<Record<string, unknown>> {
    const tutor = await this.repository.tutorDetail(tutorId);
    // Absent means "not publicly visible", which covers both a missing tutor
    // and an unverified one. Saying which would leak the difference.
    if (!tutor) throw new NotFoundError('Tutor');
    return tutor;
  }

  tutorReviews(tutorId: string, limit: number): Promise<Record<string, unknown>[]> {
    return this.repository.tutorReviews(tutorId, limit);
  }

  tutorCards(ids: string[]): Promise<Record<string, unknown>[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.repository.tutorCards(ids);
  }
}
