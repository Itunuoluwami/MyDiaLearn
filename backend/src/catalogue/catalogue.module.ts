import { Module } from '@nestjs/common';

import { CatalogueController } from './catalogue.controller';
import { CatalogueRepository } from './catalogue.repository';
import { CatalogueService } from './catalogue.service';

/**
 * Subjects, curricula, education levels, currencies and public tutor search.
 *
 * Replaces public_subject_facets(), public_curriculum_facets(),
 * public_country_facets(), public_search_suggestions(), public_tutor_search(),
 * public_tutor_cards(), public_tutor_detail() and public_tutor_reviews().
 */
@Module({
  controllers: [CatalogueController],
  providers: [CatalogueRepository, CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
