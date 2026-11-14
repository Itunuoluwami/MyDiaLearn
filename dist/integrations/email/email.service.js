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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const configuration_1 = require("../../config/configuration");
const email_errors_1 = require("./email.errors");
const email_interface_1 = require("./email.interface");
const email_masking_1 = require("./email.masking");
const email_layout_1 = require("./templates/email-layout");
const email_templates_1 = require("./templates/email-templates");
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 400;
let EmailService = EmailService_1 = class EmailService {
    provider;
    app;
    auth;
    logger;
    lookupTemplate = null;
    constructor(provider, app, auth, logger) {
        this.provider = provider;
        this.app = app;
        this.auth = auth;
        this.logger = logger;
        this.logger.setContext(EmailService_1.name);
    }
    useTemplateSource(lookup) {
        this.lookupTemplate = lookup;
    }
    get providerName() {
        return this.provider.name;
    }
    async sendTemplate(input) {
        if (!(0, email_templates_1.isEmailTrigger)(input.trigger)) {
            this.logger.error({ trigger: input.trigger }, 'Unknown email trigger; nothing sent');
            return null;
        }
        const definition = await this.resolveDefinition(input.trigger);
        const vars = {
            app_url: this.auth.appUrl,
            brand_name: 'DiaLearn',
            ...(input.vars ?? {}),
        };
        const { layout, subject, missing } = (0, email_templates_1.buildLayoutInput)(definition, vars);
        if (missing.length) {
            this.logger.warn({ trigger: input.trigger, missing }, 'Email template variables were not supplied');
        }
        const brand = { name: 'DiaLearn', appUrl: this.auth.appUrl };
        return this.send({
            to: input.to,
            subject,
            html: (0, email_layout_1.renderLayout)(layout, brand),
            text: (0, email_layout_1.toPlainText)(layout, brand),
            ...(input.replyTo !== undefined && { replyTo: input.replyTo }),
            headers: {
                'X-DiaLearn-Trigger': input.trigger,
                ...(input.headers ?? {}),
            },
        });
    }
    async send(message) {
        const recipients = Array.isArray(message.to) ? message.to : [message.to];
        const masked = recipients.map(email_masking_1.maskAddress);
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
            try {
                const result = await this.provider.send(message);
                this.logger.info({
                    provider: result.provider,
                    messageId: result.messageId,
                    to: masked,
                    accepted: result.accepted.length,
                    rejected: result.rejected.length,
                    attempt,
                }, 'Email sent');
                return { ...result, attempts: attempt };
            }
            catch (error) {
                const classified = (0, email_errors_1.classifyEmailError)(error);
                const last = attempt === MAX_ATTEMPTS || !classified.retryable;
                this.logger.error({
                    provider: this.provider.name,
                    to: masked,
                    kind: classified.kind,
                    retryable: classified.retryable,
                    attempt,
                    willRetry: !last,
                }, classified.summary);
                if (last)
                    return null;
                await delay(BASE_BACKOFF_MS * 2 ** (attempt - 1));
            }
        }
        return null;
    }
    async checkHealth() {
        return this.provider.verifyConnection();
    }
    isConfigured() {
        return this.provider.isConfigured();
    }
    get environment() {
        return this.app.env;
    }
    async resolveDefinition(trigger) {
        const fallback = email_templates_1.TEMPLATE_FALLBACKS[trigger];
        if (!this.lookupTemplate)
            return fallback;
        try {
            const row = await this.lookupTemplate(trigger);
            if (!row?.subject || !row.body) {
                this.logger.debug({ trigger }, 'No active email template row; using the built-in definition');
                return fallback;
            }
            return {
                ...fallback,
                subject: row.subject,
                paragraphs: row.body
                    .split(/\n{2,}/)
                    .map((p) => p.trim())
                    .filter(Boolean),
            };
        }
        catch (error) {
            this.logger.error({ err: error, trigger }, 'Template lookup failed; using fallback');
            return fallback;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(email_interface_1.EMAIL_PROVIDER)),
    __param(1, (0, common_1.Inject)(configuration_1.appConfig.KEY)),
    __param(2, (0, common_1.Inject)(configuration_1.authConfig.KEY)),
    __metadata("design:paramtypes", [Object, Object, Object, nestjs_pino_1.PinoLogger])
], EmailService);
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=email.service.js.map