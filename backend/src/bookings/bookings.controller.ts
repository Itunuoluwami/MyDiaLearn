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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { Paginated } from '../shared/query.dto';
import { BookingsService } from './bookings.service';
import {
  AvailableSlotsQueryDto,
  CreateBookingDto,
  EndClassDto,
  FamilyCancelDto,
  ListBookingsQueryDto,
  RaiseDisputeDto,
  RateBookingDto,
  RespondBookingDto,
  TutorScheduleQueryDto,
  type AvailableSlotResponse,
  type BookingResponse,
} from './dto/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('available-slots')
  async availableSlots(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotResponse[]> {
    return this.bookings.availableSlots(user.id, query);
  }

  @Get('tutor-schedule')
  @Roles('tutor')
  async tutorSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TutorScheduleQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.bookings.tutorSchedule(user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookingDto,
    @Req() request: Request,
  ): Promise<BookingResponse> {
    return this.bookings.create(user.id, dto, auditContextOf(request));
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBookingsQueryDto,
  ): Promise<Paginated<BookingResponse>> {
    return this.bookings.list(user.id, query);
  }

  /** Declared before `:id` so the literal path is not parsed as a UUID. */
  @Get('my-ratings')
  myRatings(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, unknown>[]> {
    return this.bookings.myRatings(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<BookingResponse> {
    return this.bookings.findOne(user.id, id);
  }

  @Post(':id/respond')
  @Roles('tutor')
  @HttpCode(HttpStatus.OK)
  async respond(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RespondBookingDto,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    return this.bookings.respond(user.id, id, dto.accept, auditContextOf(request));
  }

  /** A family rates a completed lesson, once. */
  @Post(':id/rating')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RateBookingDto,
  ): Promise<void> {
    await this.bookings.rate(user.id, id, dto);
  }

  /** A family cancels a pending, unpaid lesson. */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelByFamily(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: FamilyCancelDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.bookings.cancelByFamily(user.id, id, dto.reason, auditContextOf(request));
  }

  /** Any party to the booking may raise a dispute; the database checks who. */
  @Post(':id/disputes')
  @HttpCode(HttpStatus.CREATED)
  raiseDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RaiseDisputeDto,
    @Req() request: Request,
  ): Promise<{ id: string }> {
    return this.bookings.raiseDispute(user.id, id, dto, auditContextOf(request));
  }

  @Post(':id/class/open')
  @Roles('tutor')
  @HttpCode(HttpStatus.OK)
  async openClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Record<string, unknown>> {
    return this.bookings.openClass(user.id, id);
  }

  @Post(':id/class/start')
  @Roles('tutor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async startClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.bookings.startClass(user.id, id, auditContextOf(request));
  }

  @Post(':id/class/end')
  @Roles('tutor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: EndClassDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.bookings.endClass(user.id, id, dto.studentAttended, auditContextOf(request));
  }
}
