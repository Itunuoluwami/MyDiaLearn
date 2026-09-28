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
  AdminBookingsQueryDto,
  AdminDisputesQueryDto,
  AdminPaymentsQueryDto,
  AdminPayoutsQueryDto,
  AdminUsersQueryDto,
  CancelBookingRequestDto,
  ModerationMessagesQueryDto,
  ModerationReviewsQueryDto,
  OverrideBookingStatusDto,
  RefundRequestDto,
  RejectPayoutDto,
  ResolveDisputeDto,
  RejectTutorDto,
  ReportQueryDto,
  ReviewVerificationDto,
  SetMessageHiddenDto,
  SetReviewPublishedDto,
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

  // --- Bookings ----------------------------------------------------------------

  @Get('bookings')
  @RequirePermission('admin.bookings')
  bookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdminBookingsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.bookings(user.id, query);
  }

  /** Non-financial overrides only; cancellation is the request below. */
  @Patch('bookings/:id/status')
  @RequirePermission('admin.bookings')
  @HttpCode(HttpStatus.NO_CONTENT)
  async overrideBookingStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: OverrideBookingStatusDto,
  ): Promise<void> {
    await this.admin.overrideBookingStatus(user.id, id, dto.status);
  }

  /** Submits a cancel-with-refund request for approval; returns its id. */
  @Post('bookings/:id/cancel')
  @RequirePermission('admin.bookings')
  @HttpCode(HttpStatus.ACCEPTED)
  requestCancellation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: CancelBookingRequestDto,
  ): Promise<{ requestId: string }> {
    return this.admin.requestCancellation(user.id, id, dto);
  }

  // --- Payments and payouts -----------------------------------------------------

  @Get('payments')
  @RequirePermission('admin.payments')
  payments(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdminPaymentsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.payments(user.id, query);
  }

  /** Submits a refund request for approval; returns its id. */
  @Post('payments/:id/refund')
  @RequirePermission('admin.payments')
  @HttpCode(HttpStatus.ACCEPTED)
  requestRefund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: RefundRequestDto,
  ): Promise<{ requestId: string }> {
    return this.admin.requestRefund(user.id, id, dto);
  }

  @Get('payouts')
  @RequirePermission('admin.payouts')
  payouts(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdminPayoutsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.payouts(user.id, query.status ?? 'all');
  }

  /** Submits a settlement request for approval; returns its id. */
  @Post('payouts/:id/settle')
  @RequirePermission('admin.payouts')
  @HttpCode(HttpStatus.ACCEPTED)
  requestSettlement(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
  ): Promise<{ requestId: string }> {
    return this.admin.requestPayoutSettlement(user.id, id);
  }

  @Post('payouts/:id/reject')
  @RequirePermission('admin.payouts')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectPayout(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: RejectPayoutDto,
  ): Promise<void> {
    await this.admin.rejectPayout(user.id, id, dto.notes);
  }

  // --- Disputes -----------------------------------------------------------------

  @Get('disputes')
  @RequirePermission('admin.disputes')
  disputes(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdminDisputesQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.disputes(user.id, query.status ?? 'open');
  }

  @Post('disputes/:id/resolve')
  @RequirePermission('admin.disputes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resolveDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: ResolveDisputeDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.admin.resolveDispute(user.id, id, dto, auditContextOf(request));
  }

  // --- Moderation and reports ---------------------------------------------------

  @Get('moderation/reviews')
  @RequirePermission('admin.moderation')
  reviews(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ModerationReviewsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    const published = query.published === undefined ? null : query.published === 'true';
    return this.admin.reviews(user.id, published);
  }

  @Patch('moderation/reviews/:id')
  @RequirePermission('admin.moderation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setReviewPublished(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SetReviewPublishedDto,
  ): Promise<void> {
    await this.admin.setReviewPublished(user.id, id, dto.isPublished);
  }

  @Get('moderation/messages')
  @RequirePermission('admin.moderation')
  messages(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ModerationMessagesQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.admin.messages(user.id, query.search);
  }

  @Patch('moderation/messages/:id')
  @RequirePermission('admin.moderation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setMessageHidden(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SetMessageHiddenDto,
  ): Promise<void> {
    await this.admin.setMessageHidden(user.id, id, dto);
  }

  /** The reports page is open to any admin, as the portal has it. */
  @Get('reports/summary')
  report(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportQueryDto,
  ): Promise<Record<string, unknown> | null> {
    return this.admin.report(user.id, query.from, query.to);
  }
}
