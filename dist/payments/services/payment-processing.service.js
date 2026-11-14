"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessingService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const audit_service_1 = require("../../common/audit/audit.service");
const notification_dispatch_service_1 = require("../../notifications/services/notification-dispatch.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const database_errors_1 = require("../../common/exceptions/database-errors");
const configuration_1 = require("../../config/configuration");
const payment_service_1 = require("../../integrations/payments/payment.service");
const payment_interface_1 = require("../../integrations/payments/payment.interface");
const payments_repository_1 = require("../payments.repository");
const MAX_REFUND_ATTEMPTS = 5;
let PaymentProcessingService = PaymentProcessingService_1 = class PaymentProcessingService {
    repository;
    gateway;
    audit;
    notifications;
    logger;
    config;
    constructor(repository, gateway, audit, notifications, logger, config) {
        this.repository = repository;
        this.gateway = gateway;
        this.audit = audit;
        this.notifications = notifications;
        this.logger = logger;
        this.config = config;
        this.logger.setContext(PaymentProcessingService_1.name);
    }
    async payForBooking(payerId, bookingId, context) {
        const provider = this.gateway.providerName;
        let prepared;
        try {
            prepared = await this.repository.prepare(payerId, bookingId, provider);
        }
        catch (error) {
            throw (0, database_errors_1.translateDatabaseError)(error, 'We could not start that payment.');
        }
        const payment = await this.requireForProcessing(prepared.id);
        if (payment.status !== 'pending' && payment.status !== 'processing') {
            return { payment };
        }
        let init;
        try {
            init = await this.gateway.initializePayment({
                reference: payment.id,
                money: moneyOf(payment),
                customer: { email: payment.payer_email ?? '', name: payment.payer_name },
                description: 'DiaLearn lesson',
                returnUrl: `${this.config.appUrl}/bookings?payment=${payment.id}`,
                metadata: { bookingId: payment.booking_id, paymentId: payment.id },
            });
        }
        catch (error) {
            await this.event(payment, 'initialize', 'error');
            throw providerUnavailable(error);
        }
        await this.event(payment, 'initialize', init.status, {
            checkout: Boolean(init.checkoutUrl),
        });
        await this.repository.setProviderReference(payment.id, init.providerReference);
        if (init.status === 'failed') {
            const failed = await this.repository.markFailed(payment.id, init.failureReason ?? 'declined');
            await this.auditPayment('payment.created', payerId, failed, context);
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'The payment was declined. Please try again or use another method.', 402);
        }
        if (init.status === 'pending') {
            const refreshed = await this.requireForProcessing(payment.id);
            return {
                payment: refreshed,
                ...(init.checkoutUrl ? { checkoutUrl: init.checkoutUrl } : {}),
            };
        }
        const confirmed = await this.confirmFromProvider(payment.id, init.providerReference);
        await this.auditPayment('payment.created', payerId, confirmed, context);
        return { payment: confirmed };
    }
    async verifyForPayer(userId, paymentId) {
        const payment = await this.requireForProcessing(paymentId);
        if (payment.payer_id !== userId)
            throw new app_exception_1.NotFoundError('Payment');
        return this.confirmFromProvider(paymentId, payment.provider_reference);
    }
    async confirmFromProvider(paymentId, providerReference) {
        const payment = await this.requireForProcessing(paymentId);
        if (payment.status !== 'pending' && payment.status !== 'processing')
            return payment;
        let result;
        try {
            result = await this.gateway.verifyPayment({
                reference: payment.id,
                providerReference: providerReference ?? payment.provider_reference,
                expected: moneyOf(payment),
            });
        }
        catch (error) {
            await this.event(payment, 'verify', 'error');
            throw providerUnavailable(error);
        }
        await this.event(payment, 'verify', result.status, {}, result.amount, result.currency);
        if (result.status === 'failed') {
            return this.repository.markFailed(payment.id, result.failureReason ?? 'failed');
        }
        if (result.status === 'pending')
            return payment;
        if (result.amount === null || result.currency === null) {
            this.logger.error({ paymentId }, 'Provider verified a payment without an amount');
            return payment;
        }
        try {
            const paid = await this.repository.markPaid(payment.id, result.providerReference, result.amount, result.currency);
            await this.sendReceipt(payment, result.amount, result.currency);
            return paid;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/PAYMENT_AMOUNT_MISMATCH/.test(message)) {
                await this.event(payment, 'verify', 'amount_mismatch', {}, result.amount, result.currency);
                this.logger.error({ paymentId }, 'Provider amount or currency differs from the booking');
                throw new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'The payment amount did not match this booking. Our team has been alerted.', 409);
            }
            throw (0, database_errors_1.translateDatabaseError)(error, 'We could not confirm that payment.');
        }
    }
    async handleWebhook(providerName, rawBody, headers) {
        let event;
        try {
            event = this.gateway.parseWebhook(providerName, rawBody, headers);
        }
        catch (error) {
            if (error instanceof payment_interface_1.WebhookSignatureError) {
                throw new app_exception_1.UnauthenticatedError('Webhook signature could not be verified.');
            }
            throw error;
        }
        const paymentId = event.reference ??
            (event.providerReference
                ? await this.repository.findIdByProviderReference(providerName, event.providerReference)
                : null);
        const refund = event.refundIdempotencyKey
            ? await this.repository.findRefundByKey(event.refundIdempotencyKey)
            : event.type.startsWith('refund.') && event.providerReference
                ? await this.repository.findRefundByProviderReference(event.providerReference)
                : null;
        const first = await this.repository.recordEvent({
            paymentId: (await this.exists(paymentId)) ? paymentId : (refund?.payment_id ?? null),
            refundId: refund?.id ?? null,
            provider: providerName,
            providerEventId: event.eventId,
            source: 'webhook',
            eventType: event.type,
            details: event.details,
        });
        if (!first)
            return { received: true, duplicate: true };
        if ((event.type === 'payment.succeeded' || event.type === 'payment.failed') && paymentId) {
            if (await this.exists(paymentId)) {
                await this.confirmFromProvider(paymentId, event.providerReference);
            }
        }
        else if ((event.type === 'refund.succeeded' || event.type === 'refund.failed') &&
            refund) {
            await this.repository.recordRefundOutcome(refund.id, {
                status: event.type === 'refund.succeeded' ? 'succeeded' : 'failed',
                provider: providerName,
                providerRefundReference: event.providerReference,
                failureReason: event.type === 'refund.failed' ? 'reported failed by provider' : null,
                countAttempt: false,
            });
        }
        return { received: true, duplicate: false };
    }
    async processPendingRefunds(paymentId = null) {
        const rows = await this.repository.pendingRefunds(paymentId, MAX_REFUND_ATTEMPTS);
        const tally = { processed: 0, succeeded: 0, pending: 0, failed: 0 };
        for (const row of rows) {
            tally.processed += 1;
            const provider = this.gateway.providerName;
            if (!this.gateway.capabilities.refunds || row.payment_provider !== provider) {
                await this.repository.recordRefundOutcome(row.id, {
                    status: 'pending',
                    provider,
                    providerRefundReference: null,
                    failureReason: 'Manual refund required: charged through another provider.',
                    countAttempt: true,
                });
                tally.pending += 1;
                continue;
            }
            if (!row.payment_provider_reference) {
                await this.repository.recordRefundOutcome(row.id, {
                    status: 'pending',
                    provider,
                    providerRefundReference: null,
                    failureReason: 'Manual refund required: the charge has no provider reference.',
                    countAttempt: true,
                });
                tally.pending += 1;
                continue;
            }
            try {
                const result = await this.gateway.refundPayment({
                    providerReference: row.payment_provider_reference,
                    money: {
                        amount: String(row.amount),
                        currency: row.currency,
                        decimals: row.currency_decimals,
                    },
                    idempotencyKey: row.idempotency_key,
                });
                await this.repository.recordRefundOutcome(row.id, {
                    status: result.status,
                    provider,
                    providerRefundReference: result.providerRefundReference,
                    failureReason: result.failureReason ?? null,
                    countAttempt: true,
                });
                await this.repository.recordEvent({
                    paymentId: row.payment_id,
                    refundId: row.id,
                    provider,
                    source: 'api',
                    eventType: 'refund',
                    status: result.status,
                    amount: String(row.amount),
                    currency: row.currency,
                });
                tally[result.status] += 1;
                if (result.status === 'succeeded') {
                    await this.audit.record('payment.refunded', {
                        actorId: null,
                        entityType: 'payment',
                        entityId: row.payment_id,
                        metadata: { refundId: row.id, amount: String(row.amount), currency: row.currency },
                    });
                }
            }
            catch (error) {
                await this.repository.recordRefundOutcome(row.id, {
                    status: 'pending',
                    provider,
                    providerRefundReference: null,
                    failureReason: error instanceof payment_service_1.PaymentProviderError ? error.message : 'Provider error',
                    countAttempt: true,
                });
                tally.pending += 1;
            }
        }
        return tally;
    }
    async notifyPayoutSent(payoutId) {
        try {
            const recipient = await this.repository.payoutRecipient(payoutId);
            if (!recipient?.email)
                return;
            await this.notifications.dispatchEmail({
                to: recipient.email,
                triggerKey: 'payout.sent',
                vars: { amount: recipient.amount, currency: recipient.currency },
            });
        }
        catch (error) {
            this.logger.error({ err: error, payoutId }, 'Payout notification not sent');
        }
    }
    async sendReceipt(payment, amount, currency) {
        if (!payment.payer_email)
            return;
        try {
            const subject = await this.repository.bookingSubject(payment.booking_id);
            await this.notifications.dispatchEmail({
                to: payment.payer_email,
                triggerKey: 'payment.succeeded',
                vars: { amount, currency, subject: subject ?? 'lesson' },
            });
        }
        catch (error) {
            this.logger.error({ err: error, paymentId: payment.id }, 'Receipt not sent');
        }
    }
    async requireForProcessing(paymentId) {
        const payment = await this.repository.forProcessing(paymentId);
        if (!payment)
            throw new app_exception_1.NotFoundError('Payment');
        return payment;
    }
    async exists(paymentId) {
        return paymentId !== null && /^[0-9a-f-]{36}$/i.test(paymentId)
            ? (await this.repository.forProcessing(paymentId)) !== null
            : false;
    }
    event(payment, type, status, details = {}, amount = payment.amount === null ? null : String(payment.amount), currency = payment.currency) {
        return this.repository.recordEvent({
            paymentId: payment.id,
            provider: this.gateway.providerName,
            source: 'api',
            eventType: type,
            status,
            amount,
            currency,
            details,
        });
    }
    async auditPayment(action, actorId, payment, context) {
        await this.audit.record(action, {
            actorId,
            entityType: 'payment',
            entityId: payment.id,
            context,
            metadata: {
                bookingId: payment.booking_id,
                amount: String(payment.amount),
                currency: payment.currency,
                status: payment.status,
                provider: payment.provider,
            },
        });
    }
};
exports.PaymentProcessingService = PaymentProcessingService;
exports.PaymentProcessingService = PaymentProcessingService = PaymentProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)(configuration_1.authConfig.KEY)),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        payment_service_1.PaymentGatewayService,
        audit_service_1.AuditService,
        notification_dispatch_service_1.NotificationDispatchService,
        nestjs_pino_1.PinoLogger, Object])
], PaymentProcessingService);
function moneyOf(payment) {
    return {
        amount: String(payment.amount),
        currency: payment.currency,
        decimals: payment.currency_decimals,
    };
}
function providerUnavailable(error) {
    if (error instanceof app_exception_1.AppException)
        return error;
    return new app_exception_1.AppException(app_exception_1.ErrorCode.INTEGRATION_UNAVAILABLE, 'The payment service is unavailable right now. Please try again shortly.', 503);
}
//# sourceMappingURL=payment-processing.service.js.map