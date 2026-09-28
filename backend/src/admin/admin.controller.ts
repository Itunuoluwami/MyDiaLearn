import {
  Body,
  Controller,
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
import { RequirePermission, Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import {
  AdminUsersQueryDto,
  RejectTutorDto,
  ReviewVerificationDto,
  SetHourlyRateDto,
  SuspendUserDto,
  VerificationQueueQueryDto,
} from './dto/admin.dto';

const UUID = new ParseUUIDPipe({ version: '4' });

/**
 * The admin portal.
 *
 * Every route needs the admin role (super_admin passes implicitly) and, where
 * the portal gates a page on a permission, that same permission key — so a
 * scoped admin is refused here exactly where the UI refuses them.
 */
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, unknown> | null> {
    return this.admin.dashboard(user.id);
  }

  // --- Users -----------------------------------------------------------------

  @Get('users')
  @RequirePermission('admin.users')
  users(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdminUsersQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.users(user.id, query);
  }

  /** Submits a suspension request for approval; returns its id. */
  @Post('users/:id/suspend')
  @RequirePermission('admin.users')
  @HttpCode(HttpStatus.ACCEPTED)
  suspend(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SuspendUserDto,
  ): Promise<{ requestId: string }> {
    return this.admin.requestSuspension(user.id, id, dto.isActive);
  }

  // --- Tutor verification ----------------------------------------------------

  @Get('verification')
  @RequirePermission('admin.verification')
  verificationQueue(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VerificationQueueQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.verificationQueue(user.id, query.status ?? 'pending');
  }

  @Get('verification/:tutorId')
  @RequirePermission('admin.verification')
  verificationDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
  ): ReturnType<AdminService['verificationDetail']> {
    return this.admin.verificationDetail(user.id, tutorId);
  }

  @Put('verification/:tutorId/steps/:stepId')
  @RequirePermission('admin.verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reviewStep(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Param('stepId', UUID) stepId: string,
    @Body() dto: ReviewVerificationDto,
  ): Promise<void> {
    await this.admin.reviewStep(user.id, { tutorId, stepId, ...dto });
  }

  @Patch('verification/documents/:documentId')
  @RequirePermission('admin.verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reviewDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId', UUID) documentId: string,
    @Body() dto: ReviewVerificationDto,
  ): Promise<void> {
    await this.admin.reviewDocument(user.id, { documentId, ...dto });
  }

  @Post('verification/:tutorId/approve')
  @RequirePermission('admin.verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.admin.approveTutor(user.id, tutorId, auditContextOf(request));
  }

  @Post('verification/:tutorId/reject')
  @RequirePermission('admin.verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Body() dto: RejectTutorDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.admin.rejectTutor(user.id, tutorId, dto.reason, auditContextOf(request));
  }

  @Patch('tutors/:tutorId/hourly-rate')
  @RequirePermission('admin.verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setHourlyRate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutorId', UUID) tutorId: string,
    @Body() dto: SetHourlyRateDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.admin.setHourlyRate(user.id, tutorId, dto.hourlyRate, auditContextOf(request));
  }
}
