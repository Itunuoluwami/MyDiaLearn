export type ProviderPaymentStatus = 'succeeded' | 'pending' | 'failed';
export type ProviderRefundStatus = 'succeeded' | 'pending' | 'failed';
export interface Money {
    amount: string;
    currency: string;
    decimals: number;
}
export interface InitializePaymentRequest {
    reference: string;
    money: Money;
    customer: {
        email: string;
        name?: string | null;
    };
    description: string;
    returnUrl: string;
    metadata: Record<string, string>;
}
export interface InitializePaymentResult {
    status: ProviderPaymentStatus;
    providerReference: string;
    checkoutUrl?: string;
    failureReason?: string;
}
export interface VerifyPaymentRequest {
    reference: string;
    providerReference: string | null;
    expected: Money;
}
export interface VerifyPaymentResult {
    status: ProviderPaymentStatus;
    providerReference: string;
    amount: string | null;
    currency: string | null;
    failureReason?: string;
}
export interface RefundPaymentRequest {
    providerReference: string;
    money: Money;
    idempotencyKey: string;
    reason?: string | undefined;
}
export interface RefundPaymentResult {
    status: ProviderRefundStatus;
    providerRefundReference: string | null;
    failureReason?: string;
}
export type WebhookEventType = 'payment.succeeded' | 'payment.failed' | 'refund.succeeded' | 'refund.failed' | 'unknown';
export interface WebhookEvent {
    eventId: string;
    type: WebhookEventType;
    reference: string | null;
    providerReference: string | null;
    refundIdempotencyKey: string | null;
    details: Record<string, string | number | boolean | null>;
}
export declare class WebhookSignatureError extends Error {
    constructor(message?: string);
}
export interface PaymentProvider {
    readonly name: string;
    readonly capabilities: {
        refunds: boolean;
        webhooks: boolean;
    };
    initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResult>;
    verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult>;
    parseWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): WebhookEvent;
    refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult>;
}
export declare const PAYMENT_PROVIDER: unique symbol;
