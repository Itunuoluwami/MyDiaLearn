import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { CatalogueService } from './catalogue.service';
import {
  SearchSuggestionsQueryDto,
  TutorCardsQueryDto,
  TutorReviewsQueryDto,
  TutorSearchQueryDto,
} from './dto/catalogue.dto';

/**
 * Public discovery.
 *
 * Every route is @Public(): these surfaces are reachable without an account
 * today — the marketing site, the tutor directory — and putting them behind
 * authentication would be a UX change, which this phase does not make.
 */
@Controller('catalogue')
@Public()
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Get('subjects')
  subjects(): Promise<Record<string, unknown>[]> {
    return this.catalogue.subjects();
  }

  @Get('curricula')
  curricula(): Promise<Record<string, unknown>[]> {
    return this.catalogue.curricula();
  }

  @Get('countries')
  countries(): Promise<Record<string, unknown>[]> {
    return this.catalogue.countries();
  }

  @Get('education-levels')
  educationLevels(): Promise<Record<string, unknown>[]> {
    return this.catalogue.educationLevels();
  }

  @Get('currencies')
  currencies(): Promise<Record<string, unknown>[]> {
    return this.catalogue.currencies();
  }

  @Get('suggestions')
  suggestions(@Query() query: SearchSuggestionsQueryDto): Promise<Record<string, unknown>[]> {
    return this.catalogue.suggestions(query.q, query.limit);
  }

  @Get('tutors')
  searchTutors(@Query() query: TutorSearchQueryDto) {
    return this.catalogue.searchTutors(query);
  }

  @Post('tutors/cards')
  @HttpCode(HttpStatus.OK)
  tutorCards(@Body() dto: TutorCardsQueryDto): Promise<Record<string, unknown>[]> {
    return this.catalogue.tutorCards(dto.ids);
  }

  @Get('tutors/:id')
  tutorDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Record<string, unknown>> {
    return this.catalogue.tutorDetail(id);
  }

  @Get('tutors/:id/reviews')
  tutorReviews(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: TutorReviewsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.catalogue.tutorReviews(id, query.limit);
  }
}
