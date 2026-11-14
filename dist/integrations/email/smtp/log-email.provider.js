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
var LogEmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogEmailProvider = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const email_masking_1 = require("../email.masking");
let LogEmailProvider = LogEmailProvider_1 = class LogEmailProvider {
    logger;
    name = 'log';
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext(LogEmailProvider_1.name);
    }
    isConfigured() {
        return true;
    }
    async send(message) {
        const recipients = Array.isArray(message.to) ? message.to : [message.to];
        this.logger.info({ to: recipients.map(email_masking_1.maskAddress), subject: message.subject }, 'Email suppressed (EMAIL_PROVIDER=log)');
        this.logger.debug({ text: message.text }, 'Suppressed email body');
        return {
            messageId: `log-${Date.now()}`,
            accepted: recipients,
            rejected: [],
            provider: this.name,
            attempts: 1,
        };
    }
    async verifyConnection() {
        return {
            status: 'ok',
            provider: this.name,
            detail: 'Logging provider: nothing is delivered.',
            warnings: ['EMAIL_PROVIDER=log — no email is actually sent.'],
        };
    }
};
exports.LogEmailProvider = LogEmailProvider;
exports.LogEmailProvider = LogEmailProvider = LogEmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], LogEmailProvider);
//# sourceMappingURL=log-email.provider.js.map