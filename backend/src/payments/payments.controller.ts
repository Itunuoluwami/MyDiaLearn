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
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { RequirePermission, Roles } from '../common/decorators/roles.decorator';
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
import { PaymentProcessingService } from './services/payment-processing.service';
import type { BookingQuote } from './services/pricing.service';
import type { EarningsSummary, SettlementPolicy } from './services/settlement.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly processing: PaymentProcessingService,
  ) {}

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

  /** The payer, back from the provider: the server re-checks with the provider. */
  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PaymentResponse> {
    return this.payments.verify(user.id, id);
  }

  /**
   * Provider webhooks. Public — the provider has no DiaLearn session — and
   * authenticated instead by the adapter's signature check over the raw body.
   * Redelivered events are acknowledged without being processed again.
   */
  @Public()
  @SkipThrottle()
  @Post('webhooks/:provider')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Param('provider') provider: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: true; duplicate: boolean }> {
    return this.processing.handleWebhook(
      provider,
      request.rawBody,
      request.headers as Record<string, string | string[] | undefined>,
    );
  }

  /** Retries refunds the provider has not completed. */
  @Post('refunds/process')
  @Roles('admin')
  @RequirePermission('admin.payments')
  @HttpCode(HttpStatus.OK)
  async processRefunds(): Promise<{
    processed: number;
    succeeded: number;
    pending: number;
    failed: number;
  }> {
    return this.processing.processPendingRefunds();
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
