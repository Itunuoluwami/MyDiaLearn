"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_PROVIDER = exports.WebhookSignatureError = void 0;
class WebhookSignatureError extends Error {
    constructor(message = 'Webhook signature could not be verified.') {
        super(message);
        this.name = 'WebhookSignatureError';
    }
}
exports.WebhookSignatureError = WebhookSignatureError;
exports.PAYMENT_PROVIDER = Symbol('PaymentProvider');
//# sourceMappingURL=payment.interface.js.map