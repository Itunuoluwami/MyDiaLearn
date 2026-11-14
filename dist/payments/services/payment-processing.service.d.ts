import { PinoLogger } from 'nestjs-pino';
import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { NotificationDispatchService } from '../../notifications/services/notification-dispatch.service';
import { type AuthConfig } from '../../config/configuration';
import { PaymentGatewayService } from '../../integrations/payments/payment.service';
import { PaymentsRepository, type PaymentRow } from '../payments.repository';
export interface PaymentOutcome {
    payment: PaymentRow;
    checkoutUrl?: string;
}
export declare class PaymentProcessingService {
    private readonly repository;
    private readonly gateway;
    private readonly audit;
    private readonly notifications;
    private readonly logger;
    private readonly config;
    constructor(repository: PaymentsRepository, gateway: PaymentGatewayService, audit: AuditService, notifications: NotificationDispatchService, logger: PinoLogger, config: AuthConfig);
    payForBooking(payerId: string, bookingId: string, context: AuditContext): Promise<PaymentOutcome>;
    verifyForPayer(userId: string, paymentId: string): Promise<PaymentRow>;
    confirmFromProvider(paymentId: string, providerReference: string | null): Promise<PaymentRow>;
    handleWebhook(providerName: string, rawBody: Buffer | undefined, headers: Record<string, string | string[] | undefined>): Promise<{
        received: true;
        duplicate: boolean;
    }>;
    processPendingRefunds(paymentId?: string | null): Promise<{
        processed: number;
        succeeded: number;
        pending: number;
        failed: number;
    }>;
    notifyPayoutSent(payoutId: string): Promise<void>;
    private sendReceipt;
    private requireForProcessing;
    private exists;
    private event;
    private auditPayment;
}
