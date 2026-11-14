import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { PaymentResponse, PayoutResponse } from './dto/payment.dto';
import { PaymentsRepository, type PaymentRow, type PayoutRow } from './payments.repository';
import { PaymentProcessingService } from './services/payment-processing.service';
import { PricingService, type BookingQuote } from './services/pricing.service';
import { SettlementService, type EarningsSummary, type SettlementPolicy } from './services/settlement.service';
export declare class PaymentsService {
    private readonly repository;
    private readonly pricing;
    private readonly settlement;
    private readonly audit;
    private readonly processing;
    constructor(repository: PaymentsRepository, pricing: PricingService, settlement: SettlementService, audit: AuditService, processing: PaymentProcessingService);
    quote(callerId: string, input: {
        tutorId: string;
        durationMinutes: number;
    }): Promise<BookingQuote>;
    payForBooking(payerId: string, bookingId: string, context: AuditContext): Promise<PaymentResponse>;
    verify(userId: string, paymentId: string): Promise<PaymentResponse>;
    list(userId: string, query: PaginationQueryDto): Promise<Paginated<PaymentResponse>>;
    findOne(userId: string, id: string): Promise<PaymentResponse>;
    earnings(tutorUserId: string): Promise<EarningsSummary | null>;
    earningsRecords(tutorUserId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    settlementPolicy(): Promise<SettlementPolicy>;
    requestPayout(tutorUserId: string, amount: number, context: AuditContext): Promise<{
        id: string;
    }>;
    listPayouts(userId: string, query: PaginationQueryDto): Promise<Paginated<PayoutResponse>>;
}
export declare function toPaymentResponse(row: PaymentRow): PaymentResponse;
export declare function toPayoutResponse(row: PayoutRow): PayoutResponse;
