import { PinoLogger } from 'nestjs-pino';
import { type InitializePaymentRequest, type InitializePaymentResult, type Money, type PaymentProvider, type RefundPaymentRequest, type RefundPaymentResult, type VerifyPaymentRequest, type VerifyPaymentResult, type WebhookEvent } from './payment.interface';
export declare class PaymentProviderError extends Error {
    readonly operation: string;
    readonly provider: string;
    constructor(operation: string, provider: string, cause: unknown);
}
export declare class PaymentGatewayService {
    private readonly provider;
    private readonly logger;
    constructor(provider: PaymentProvider, logger: PinoLogger);
    get providerName(): string;
    get capabilities(): PaymentProvider['capabilities'];
    initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResult>;
    verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult>;
    refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult>;
    parseWebhook(providerName: string, rawBody: Buffer | undefined, headers: Record<string, string | string[] | undefined>): WebhookEvent;
    private call;
}
export declare function toMinorUnits(money: Money): bigint;
