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
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = exports.PaymentProviderError = void 0;
exports.toMinorUnits = toMinorUnits;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const payment_interface_1 = require("./payment.interface");
class PaymentProviderError extends Error {
    operation;
    provider;
    constructor(operation, provider, cause) {
        super(`Payment provider ${provider} failed during ${operation}.`);
        this.operation = operation;
        this.provider = provider;
        this.name = 'PaymentProviderError';
        this.cause = cause;
    }
}
exports.PaymentProviderError = PaymentProviderError;
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    provider;
    logger;
    constructor(provider, logger) {
        this.provider = provider;
        this.logger = logger;
        this.logger.setContext(PaymentGatewayService_1.name);
    }
    get providerName() {
        return this.provider.name;
    }
    get capabilities() {
        return this.provider.capabilities;
    }
    initializePayment(request) {
        return this.call('initializePayment', { reference: request.reference, ...logMoney(request.money) }, () => this.provider.initializePayment(request));
    }
    verifyPayment(request) {
        return this.call('verifyPayment', { reference: request.reference }, () => this.provider.verifyPayment(request));
    }
    refundPayment(request) {
        return this.call('refundPayment', { idempotencyKey: request.idempotencyKey, ...logMoney(request.money) }, () => this.provider.refundPayment(request));
    }
    parseWebhook(providerName, rawBody, headers) {
        if (providerName !== this.provider.name || !this.provider.capabilities.webhooks) {
            throw new payment_interface_1.WebhookSignatureError('No webhook endpoint for this provider.');
        }
        if (!rawBody || rawBody.length === 0)
            throw new payment_interface_1.WebhookSignatureError('Empty webhook body.');
        try {
            return this.provider.parseWebhook(rawBody, headers);
        }
        catch (error) {
            this.logger.warn({ provider: providerName }, 'Rejected an unverifiable webhook');
            if (error instanceof payment_interface_1.WebhookSignatureError)
                throw error;
            throw new payment_interface_1.WebhookSignatureError();
        }
    }
    async call(operation, context, run) {
        const started = Date.now();
        try {
            const result = await run();
            this.logger.info({ provider: this.provider.name, operation, ms: Date.now() - started, ...context }, 'Payment provider call succeeded');
            return result;
        }
        catch (error) {
            this.logger.error({
                provider: this.provider.name,
                operation,
                ms: Date.now() - started,
                ...context,
                error: error instanceof Error ? error.message : String(error),
            }, 'Payment provider call failed');
            throw new PaymentProviderError(operation, this.provider.name, error);
        }
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payment_interface_1.PAYMENT_PROVIDER)),
    __metadata("design:paramtypes", [Object, nestjs_pino_1.PinoLogger])
], PaymentGatewayService);
function logMoney(money) {
    return { amount: money.amount, currency: money.currency };
}
function toMinorUnits(money) {
    const [whole = '0', fraction = ''] = money.amount.trim().split('.');
    if (!/^-?\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > money.decimals) {
        throw new Error(`Invalid ${money.currency} amount: ${money.amount}`);
    }
    const negative = whole.startsWith('-');
    const digits = `${whole.replace('-', '')}${fraction.padEnd(money.decimals, '0')}`;
    const value = BigInt(digits);
    return negative ? -value : value;
}
//# sourceMappingURL=payment.service.js.map