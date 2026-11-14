import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export interface PaymentRow {
    id: string;
    booking_id: string;
    payer_id: string;
    tutor_id: string;
    amount: string;
    currency: string;
    platform_fee: string;
    commission_amount: string;
    tutor_payout: string;
    status: string;
    provider: string | null;
    provider_reference: string | null;
    paid_at: Date | null;
    refunded_amount: string | null;
    failure_reason?: string | null;
    created_at: Date;
}
export interface PaymentForProcessing extends PaymentRow {
    currency_decimals: number;
    payer_email: string | null;
    payer_name: string | null;
    booking_status: string;
}
export interface RefundLedgerRow {
    id: string;
    payment_id: string;
    amount: string;
    currency: string;
    currency_decimals: number;
    idempotency_key: string;
    status: string;
    attempts: number;
    payment_provider: string | null;
    payment_provider_reference: string | null;
}
export interface PayoutRow {
    id: string;
    tutor_id: string;
    amount: string;
    currency: string;
    status: string;
    reference: string | null;
    notes: string | null;
    requested_at: Date;
    settled_at: Date | null;
}
export declare class PaymentsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    listForUser(userId: string, query: PaginationQueryDto): Promise<{
        rows: PaymentRow[];
        total: number;
    }>;
    findById(userId: string, id: string): Promise<PaymentRow | null>;
    earningsRecords(tutorUserId: string, query: PaginationQueryDto): Promise<Record<string, unknown>[]>;
    requestPayout(tutorUserId: string, amount: number): Promise<string>;
    listPayouts(userId: string, query: PaginationQueryDto): Promise<{
        rows: PayoutRow[];
        total: number;
    }>;
    prepare(payerId: string, bookingId: string, provider: string): Promise<PaymentRow>;
    forProcessing(paymentId: string): Promise<PaymentForProcessing | null>;
    findIdByProviderReference(provider: string, providerReference: string): Promise<string | null>;
    setProviderReference(paymentId: string, providerReference: string): Promise<void>;
    bookingSubject(bookingId: string): Promise<string | null>;
    payoutRecipient(payoutId: string): Promise<{
        email: string | null;
        amount: string;
        currency: string;
    } | null>;
    markPaid(paymentId: string, providerReference: string, amount: string, currency: string): Promise<PaymentRow>;
    markFailed(paymentId: string, reason: string): Promise<PaymentRow>;
    recordEvent(event: {
        paymentId: string | null;
        refundId?: string | null;
        provider: string;
        providerEventId?: string | null;
        source: 'api' | 'webhook';
        eventType: string;
        status?: string | null;
        amount?: string | null;
        currency?: string | null;
        details?: Record<string, unknown>;
    }): Promise<boolean>;
    pendingRefunds(paymentId: string | null, maxAttempts: number): Promise<RefundLedgerRow[]>;
    findRefundByKey(key: string): Promise<{
        id: string;
        payment_id: string;
    } | null>;
    findRefundByProviderReference(reference: string): Promise<{
        id: string;
        payment_id: string;
    } | null>;
    recordRefundOutcome(refundId: string, outcome: {
        status: 'pending' | 'succeeded' | 'failed';
        provider: string;
        providerRefundReference: string | null;
        failureReason: string | null;
        countAttempt: boolean;
    }): Promise<void>;
}
