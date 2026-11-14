import { type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { ListPaymentsQueryDto, PayForBookingDto, QuoteBookingDto, RequestPayoutDto, type PaymentResponse, type PayoutResponse } from './dto/payment.dto';
import { PaymentsService } from './payments.service';
import { PaymentProcessingService } from './services/payment-processing.service';
import type { BookingQuote } from './services/pricing.service';
import type { EarningsSummary, SettlementPolicy } from './services/settlement.service';
export declare class PaymentsController {
    private readonly payments;
    private readonly processing;
    constructor(payments: PaymentsService, processing: PaymentProcessingService);
    quote(user: AuthenticatedUser, dto: QuoteBookingDto): Promise<BookingQuote>;
    pay(user: AuthenticatedUser, dto: PayForBookingDto, request: Request): Promise<PaymentResponse>;
    verify(user: AuthenticatedUser, id: string): Promise<PaymentResponse>;
    webhook(provider: string, request: RawBodyRequest<Request>): Promise<{
        received: true;
        duplicate: boolean;
    }>;
    processRefunds(): Promise<{
        processed: number;
        succeeded: number;
        pending: number;
        failed: number;
    }>;
    list(user: AuthenticatedUser, query: ListPaymentsQueryDto): Promise<Paginated<PaymentResponse>>;
    settlementPolicy(): Promise<SettlementPolicy>;
    earnings(user: AuthenticatedUser): Promise<EarningsSummary | null>;
    earningsRecords(user: AuthenticatedUser, query: ListPaymentsQueryDto): Promise<Record<string, unknown>[]>;
    requestPayout(user: AuthenticatedUser, dto: RequestPayoutDto, request: Request): Promise<{
        id: string;
    }>;
    listPayouts(user: AuthenticatedUser, query: ListPaymentsQueryDto): Promise<Paginated<PayoutResponse>>;
    findOne(user: AuthenticatedUser, id: string): Promise<PaymentResponse>;
}
