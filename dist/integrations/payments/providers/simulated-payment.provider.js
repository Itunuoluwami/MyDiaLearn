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
var SimulatedPaymentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatedPaymentProvider = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const payment_interface_1 = require("../payment.interface");
const SIGNATURE_HEADER = 'x-dialearn-signature';
let SimulatedPaymentProvider = SimulatedPaymentProvider_1 = class SimulatedPaymentProvider {
    logger;
    webhookSecret;
    name = 'simulated';
    capabilities = { refunds: true, webhooks: true };
    constructor(logger, webhookSecret) {
        this.logger = logger;
        this.webhookSecret = webhookSecret;
        this.logger.setContext(SimulatedPaymentProvider_1.name);
    }
    async initializePayment(request) {
        this.logger.warn({
            reference: request.reference,
            amount: request.money.amount,
            currency: request.money.currency,
        }, 'Simulated charge — no money moved');
        return { status: 'succeeded', providerReference: `sim_${request.reference}` };
    }
    async verifyPayment(request) {
        return {
            status: 'succeeded',
            providerReference: request.providerReference ?? `sim_${request.reference}`,
            amount: request.expected.amount,
            currency: request.expected.currency,
        };
    }
    parseWebhook(rawBody, headers) {
        const secret = this.webhookSecret;
        const header = headers[SIGNATURE_HEADER];
        const signature = Array.isArray(header) ? header[0] : header;
        if (!secret || !signature)
            throw new payment_interface_1.WebhookSignatureError();
        const expected = (0, node_crypto_1.createHmac)('sha256', secret).update(rawBody).digest();
        const given = Buffer.from(signature, 'hex');
        if (given.length !== expected.length || !(0, node_crypto_1.timingSafeEqual)(given, expected)) {
            throw new payment_interface_1.WebhookSignatureError();
        }
        let body;
        try {
            body = JSON.parse(rawBody.toString('utf8'));
        }
        catch {
            throw new payment_interface_1.WebhookSignatureError('Webhook body is not valid JSON.');
        }
        const text = (v) => (typeof v === 'string' && v ? v : null);
        const eventId = text(body['id']);
        if (!eventId)
            throw new payment_interface_1.WebhookSignatureError('Webhook has no event id.');
        const known = [
            'payment.succeeded',
            'payment.failed',
            'refund.succeeded',
            'refund.failed',
        ];
        const type = known.includes(body['type'])
            ? body['type']
            : 'unknown';
        return {
            eventId,
            type,
            reference: text(body['reference']),
            providerReference: text(body['providerReference']),
            refundIdempotencyKey: text(body['refundKey']),
            details: { type: String(body['type'] ?? '') },
        };
    }
    async refundPayment(request) {
        this.logger.warn({ idempotencyKey: request.idempotencyKey, amount: request.money.amount }, 'Simulated refund — no money moved');
        return {
            status: 'succeeded',
            providerRefundReference: `simref_${request.idempotencyKey}`,
        };
    }
};
exports.SimulatedPaymentProvider = SimulatedPaymentProvider;
exports.SimulatedPaymentProvider = SimulatedPaymentProvider = SimulatedPaymentProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger, Object])
], SimulatedPaymentProvider);
//# sourceMappingURL=simulated-payment.provider.js.map