import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AddTutorDocumentDto,
  ReplaceAvailabilityDto,
  ReplaceTutorSubjectsDto,
  TutorListQueryDto,
  UpdateTutorProfileDto,
  type AvailabilityWindowResponse,
  type TutorDocumentResponse,
  type TutorProfileResponse,
  type TutorSubjectResponse,
  type VerificationStepResponse,
} from './dto/tutor.dto';
import { TutorAvailabilityService } from './services/tutor-availability.service';
import { TutorVerificationService } from './services/tutor-verification.service';
import { TutorsService } from './tutors.service';

/**
 * The tutor's own workspace.
 *
 * Everything is scoped to the caller rather than taking a tutor id, so there is
 * no path where one tutor can address another's record. Public tutor data is
 * the catalogue module's job.
 */
@Controller('tutors')
export class TutorsController {
  constructor(
    private readonly tutors: TutorsService,
    private readonly availability: TutorAvailabilityService,
    private readonly verification: TutorVerificationService,
  ) {}

  @Get('me')
  @Roles('tutor')
  me(@CurrentUser() user: AuthenticatedUser): Promise<TutorProfileResponse> {
    return this.tutors.me(user.id);
  }

  @Patch('me')
  @Roles('tutor')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTutorProfileDto,
    @Req() request: Request,
  ): Promise<TutorProfileResponse> {
    return this.tutors.updateMe(user.id, dto, auditContextOf(request));
  }

  @Get('me/dashboard')
  @Roles('tutor')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, unknown> | null> {
    return this.tutors.dashboard(user.id);
  }

  // --- Subjects taught ------------------------------------------------------

  @Get('me/subjects')
  @Roles('tutor')
  subjects(@CurrentUser() user: AuthenticatedUser): Promise<TutorSubjectResponse[]> {
    return this.tutors.subjects(user.id);
  }

  /** PUT, not POST: the editor submits the whole set and it is replaced. */
  @Put('me/subjects')
  @Roles('tutor')
  replaceSubjects(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReplaceTutorSubjectsDto,
    @Req() request: Request,
  ): Promise<TutorSubjectResponse[]> {
    return this.tutors.replaceSubjects(user.id, dto.subjects, auditContextOf(request));
  }

  // --- Availability ---------------------------------------------------------

  @Get('me/availability')
  @Roles('tutor')
  availabilityOwn(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AvailabilityWindowResponse[]> {
    return this.availability.listOwn(user.id);
  }

  @Put('me/availability')
  @Roles('tutor')
  replaceAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReplaceAvailabilityDto,
  ): Promise<AvailabilityWindowResponse[]> {
    return this.availability.replaceOwn(user.id, dto.windows);
  }

  // --- Verification ---------------------------------------------------------

  @Get('me/verification')
  @Roles('tutor')
  verificationSteps(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VerificationStepResponse[]> {
    return this.verification.steps(user.id);
  }

  @Get('me/documents')
  @Roles('tutor')
  documents(@CurrentUser() user: AuthenticatedUser): Promise<TutorDocumentResponse[]> {
    return this.verification.documents(user.id);
  }

  @Post('me/documents')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  addDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddTutorDocumentDto,
    @Req() request: Request,
  ): Promise<TutorDocumentResponse> {
    return this.verification.addDocument(user.id, dto, auditContextOf(request));
  }

  @Delete('me/documents/:id')
  @Roles('tutor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.verification.removeDocument(user.id, id, auditContextOf(request));
  }

  @Post('me/verification/submit')
  @Roles('tutor')
  @HttpCode(HttpStatus.OK)
  submitVerification(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    return this.verification.submit(user.id, auditContextOf(request));
  }

  // --- Students and reviews -------------------------------------------------

  @Get('me/students')
  @Roles('tutor')
  students(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TutorListQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.tutors.students(user.id, query);
  }

  @Get('me/reviews')
  @Roles('tutor')
  reviews(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TutorListQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.tutors.reviews(user.id, query);
  }

  @Get('me/ratings/summary')
  @Roles('tutor')
  ratingSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown> | null> {
    return this.tutors.ratingSummary(user.id);
  }

  @Get('me/ratings/categories')
  @Roles('tutor')
  ratingCategories(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown>[]> {
    return this.tutors.ratingCategories(user.id);
  }

  /**
   * A tutor's published availability.
   *
   * Public because the booking screen shows it before sign-in, matching the
   * availability_anon_read policy that already allows exactly this.
   */
  @Get(':id/availability')
  @Public()
  availabilityFor(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AvailabilityWindowResponse[]> {
    return this.availability.listPublic(id);
  }
}
