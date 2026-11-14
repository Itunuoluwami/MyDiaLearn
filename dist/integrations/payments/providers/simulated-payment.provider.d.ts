import { PinoLogger } from 'nestjs-pino';
import { type InitializePaymentRequest, type InitializePaymentResult, type PaymentProvider, type RefundPaymentRequest, type RefundPaymentResult, type VerifyPaymentRequest, type VerifyPaymentResult, type WebhookEvent } from '../payment.interface';
export declare class SimulatedPaymentProvider implements PaymentProvider {
    private readonly logger;
    private readonly webhookSecret;
    readonly name = "simulated";
    readonly capabilities: {
        refunds: boolean;
        webhooks: boolean;
    };
    constructor(logger: PinoLogger, webhookSecret: string | undefined);
    initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResult>;
    verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult>;
    parseWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): WebhookEvent;
    refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult>;
}
