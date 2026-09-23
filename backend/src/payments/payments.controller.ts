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

import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { auditContextOf } from '../common/audit/request-context';
import type { Paginated } from '../shared/query.dto';
import {
  ListPaymentsQueryDto,
  PayForBookingDto,
  QuoteBookingDto,
  RequestPayoutDto,
  type PaymentResponse,
  type PayoutResponse,
} from './dto/payment.dto';
import { PaymentsService } from './payments.service';
import type { BookingQuote } from './services/pricing.service';
import type { EarningsSummary, SettlementPolicy } from './services/settlement.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** What a lesson would cost, including the fee split. */
  @Post('quote')
  @HttpCode(HttpStatus.OK)
  async quote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: QuoteBookingDto,
  ): Promise<BookingQuote> {
    return this.payments.quote(user.id, dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async pay(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PayForBookingDto,
    @Req() request: Request,
  ): Promise<PaymentResponse> {
    return this.payments.payForBooking(user.id, dto.bookingId, auditContextOf(request));
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPaymentsQueryDto,
  ): Promise<Paginated<PaymentResponse>> {
    return this.payments.list(user.id, query);
  }

  @Get('settlement-policy')
  async settlementPolicy(): Promise<SettlementPolicy> {
    return this.payments.settlementPolicy();
  }

  @Get('earnings')
  @Roles('tutor')
  async earnings(@CurrentUser() user: AuthenticatedUser): Promise<EarningsSummary | null> {
    return this.payments.earnings(user.id);
  }

  @Get('earnings/records')
  @Roles('tutor')
  async earningsRecords(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPaymentsQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.payments.earningsRecords(user.id, query);
  }

  @Post('payouts')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  async requestPayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestPayoutDto,
    @Req() request: Request,
  ): Promise<{ id: string }> {
    return this.payments.requestPayout(user.id, dto.amount, auditContextOf(request));
  }

  @Get('payouts')
  async listPayouts(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPaymentsQueryDto,
  ): Promise<Paginated<PayoutResponse>> {
    return this.payments.listPayouts(user.id, query);
  }

  /** Last, so it cannot shadow the literal paths above. */
  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PaymentResponse> {
    return this.payments.findOne(user.id, id);
  }
}
