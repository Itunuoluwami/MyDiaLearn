"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const configuration_1 = require("../../config/configuration");
const email_controller_1 = require("./email.controller");
const email_interface_1 = require("./email.interface");
const email_service_1 = require("./email.service");
const log_email_provider_1 = require("./smtp/log-email.provider");
const smtp_email_provider_1 = require("./smtp/smtp-email.provider");
const emailProvider = {
    provide: email_interface_1.EMAIL_PROVIDER,
    inject: [configuration_1.integrationsConfig.KEY, configuration_1.smtpConfig.KEY, nestjs_pino_1.PinoLogger],
    useFactory: (config, smtp, logger) => config.email === 'smtp'
        ? new smtp_email_provider_1.SmtpEmailProvider(smtp, logger)
        : new log_email_provider_1.LogEmailProvider(logger),
};
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [email_controller_1.EmailAdminController],
        providers: [emailProvider, email_service_1.EmailService],
        exports: [email_interface_1.EMAIL_PROVIDER, email_service_1.EmailService],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map