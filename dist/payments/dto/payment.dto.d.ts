import { PaginationQueryDto } from '../../shared/query.dto';
export declare class QuoteBookingDto {
    tutorId: string;
    durationMinutes: number;
}
export declare class PayForBookingDto {
    bookingId: string;
}
export declare class RequestPayoutDto {
    amount: number;
}
export declare class ListPaymentsQueryDto extends PaginationQueryDto {
}
export interface PaymentResponse {
    checkoutUrl?: string;
    id: string;
    bookingId: string;
    amount: string;
    currency: string;
    platformFee: string;
    commissionAmount: string;
    tutorPayout: string;
    status: string;
    provider: string | null;
    providerReference: string | null;
    refundedAmount: string | null;
    paidAt: string | null;
    createdAt: string;
}
export interface PayoutResponse {
    id: string;
    amount: string;
    currency: string;
    status: string;
    reference: string | null;
    notes: string | null;
    requestedAt: string;
    settledAt: string | null;
}
