"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const configuration_1 = require("../../config/configuration");
const payment_interface_1 = require("./payment.interface");
const payment_service_1 = require("./payment.service");
const simulated_payment_provider_1 = require("./providers/simulated-payment.provider");
const paymentProvider = {
    provide: payment_interface_1.PAYMENT_PROVIDER,
    inject: [configuration_1.integrationsConfig.KEY, nestjs_pino_1.PinoLogger],
    useFactory: (config, logger) => {
        switch (config.payment) {
            case 'simulated':
                return new simulated_payment_provider_1.SimulatedPaymentProvider(logger, config.paymentWebhookSecret || undefined);
            default:
                throw new Error(`Unknown PAYMENT_PROVIDER "${String(config.payment)}".`);
        }
    },
};
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [paymentProvider, payment_service_1.PaymentGatewayService],
        exports: [payment_interface_1.PAYMENT_PROVIDER, payment_service_1.PaymentGatewayService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map