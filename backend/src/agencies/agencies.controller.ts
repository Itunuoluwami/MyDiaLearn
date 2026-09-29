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
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../common/decorators/roles.decorator';
import {
  AddAvailabilityWindowDto,
  AddTutorSubjectDto,
  SetWindowActiveDto,
  UpdateTutorProfileDto,
} from '../tutors/dto/tutor.dto';
import { AgenciesService } from './agencies.service';
import {
  AddAgencyTutorDto,
  AgencyBookingsQueryDto,
  AgencyPayoutDto,
  UpdateAgencyDto,
} from './dto/agency.dto';

const UUID = new ParseUUIDPipe({ version: '4' });
type Row = Record<string, unknown>;

/**
 * The agency portal. Agency accounts only (agency role, agency.manage), and
 * every tutor route checks the tutor belongs to the caller's agency.
 */
@Controller('agencies/me')
@Roles('agency')
@RequirePermission('agency.manage')
export class AgenciesController {
  constructor(private readonly agencies: AgenciesService) {}

  @Get()
  me(@CurrentUser() user: AuthenticatedUser): Promise<Row> {
    return this.agencies.me(user.id);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAgencyDto): Promise<Row> {
    return this.agencies.update(user.id, dto);
  }

  @Post('verification/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    return this.agencies.submitVerification(user.id, auditContextOf(request));
  }

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<Row> {
    return this.agencies.dashboard(user.id);
  }

  // --- Tutors ------------------------------------------------------------------

  @Get('tutors')
  roster(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.agencies.roster(user.id);
  }

  @Post('tutors')
  @HttpCode(HttpStatus.CREATED)
  addTutor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddAgencyTutorDto,
    @Req() request: Request,
  ): Promise<{ tutorId: string; emailed: boolean }> {
    return this.agencies.addTutor(user.id, dto, auditContextOf(request));
  }

  @Delete('tutors/:tutorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTutor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.agencies.removeTutor(user.id, tutorId, auditContextOf(request));
  }

  @Get('tutors/:tutorId/profile')
  tutorProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
  ) {
    return this.agencies.tutorProfile(user.id, tutorId);
  }

  @Patch('tutors/:tutorId/profile')
  updateTutorProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Body() dto: UpdateTutorProfileDto,
    @Req() request: Request,
  ) {
    return this.agencies.updateTutorProfile(user.id, tutorId, dto, auditContextOf(request));
  }

  @Get('tutors/:tutorId/subjects')
  tutorSubjects(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
  ) {
    return this.agencies.tutorSubjects(user.id, tutorId);
  }

  @Post('tutors/:tutorId/subjects')
  @HttpCode(HttpStatus.CREATED)
  addTutorSubject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Body() dto: AddTutorSubjectDto,
    @Req() request: Request,
  ) {
    return this.agencies.addTutorSubject(
      user.id,
      tutorId,
      dto.subjectId,
      dto.educationLevelId,
      auditContextOf(request),
    );
  }

  @Delete('tutors/:tutorId/subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTutorSubject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Param('id', UUID) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.agencies.removeTutorSubject(user.id, tutorId, id, auditContextOf(request));
  }

  @Get('tutors/:tutorId/availability')
  tutorAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
  ) {
    return this.agencies.tutorAvailability(user.id, tutorId);
  }

  @Post('tutors/:tutorId/availability')
  @HttpCode(HttpStatus.CREATED)
  addTutorWindow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Body() dto: AddAvailabilityWindowDto,
    @Req() request: Request,
  ) {
    return this.agencies.addTutorWindow(user.id, tutorId, dto, auditContextOf(request));
  }

  @Patch('tutors/:tutorId/availability/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setTutorWindowActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Param('id', UUID) id: string,
    @Body() dto: SetWindowActiveDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.agencies.setTutorWindowActive(
      user.id,
      tutorId,
      id,
      dto.isActive,
      auditContextOf(request),
    );
  }

  @Delete('tutors/:tutorId/availability/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTutorWindow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Param('id', UUID) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.agencies.deleteTutorWindow(user.id, tutorId, id, auditContextOf(request));
  }

  @Get('tutors/:tutorId/verification')
  tutorVerification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
  ) {
    return this.agencies.tutorVerification(user.id, tutorId);
  }

  @Post('tutors/:tutorId/verification/submit')
  @HttpCode(HttpStatus.OK)
  submitTutorVerification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Req() request: Request,
  ) {
    return this.agencies.submitTutorVerification(user.id, tutorId, auditContextOf(request));
  }

  // --- Bookings and money --------------------------------------------------------

  @Get('bookings')
  bookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AgencyBookingsQueryDto,
  ): Promise<Row[]> {
    return this.agencies.bookings(user.id, query);
  }

  @Get('earnings')
  earnings(@CurrentUser() user: AuthenticatedUser): Promise<Row | null> {
    return this.agencies.earnings(user.id);
  }

  @Get('payouts')
  payouts(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.agencies.payouts(user.id);
  }

  @Post('payouts')
  @HttpCode(HttpStatus.CREATED)
  requestPayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AgencyPayoutDto,
    @Req() request: Request,
  ): Promise<{ id: string }> {
    return this.agencies.requestPayout(user.id, dto.amount, auditContextOf(request));
  }
}
