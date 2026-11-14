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
var NotificationDispatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatchService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const email_service_1 = require("../../integrations/email/email.service");
const notifications_repository_1 = require("../notifications.repository");
let NotificationDispatchService = NotificationDispatchService_1 = class NotificationDispatchService {
    repository;
    email;
    logger;
    constructor(repository, email, logger) {
        this.repository = repository;
        this.email = email;
        this.logger = logger;
        this.logger.setContext(NotificationDispatchService_1.name);
    }
    onModuleInit() {
        this.email.useTemplateSource(async (triggerKey) => {
            const row = await this.repository.findTemplate(triggerKey, 'email');
            return row ? { subject: row.subject, body: row.body } : null;
        });
    }
    async dispatchInApp(input) {
        await this.repository.notify(input.actorId, {
            userId: input.userId,
            triggerKey: input.triggerKey,
            vars: input.vars,
            ...(input.link !== undefined && { link: input.link }),
        });
    }
    async dispatchEmail(input) {
        const template = await this.repository.findTemplate(input.triggerKey, 'email');
        if (!template) {
            this.logger.debug({ triggerKey: input.triggerKey }, 'No active email template; nothing sent');
            return false;
        }
        const result = await this.email.sendTemplate({
            trigger: input.triggerKey,
            to: input.to,
            vars: input.vars,
        });
        return result !== null;
    }
    async dispatch(input) {
        let inApp = false;
        try {
            await this.dispatchInApp(input);
            inApp = true;
        }
        catch (error) {
            this.logger.error({ err: error, triggerKey: input.triggerKey }, 'In-app dispatch failed');
        }
        const email = input.email
            ? await this.dispatchEmail({
                to: input.email,
                triggerKey: input.triggerKey,
                vars: input.vars,
            })
            : false;
        return { inApp, email };
    }
};
exports.NotificationDispatchService = NotificationDispatchService;
exports.NotificationDispatchService = NotificationDispatchService = NotificationDispatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        email_service_1.EmailService,
        nestjs_pino_1.PinoLogger])
], NotificationDispatchService);
//# sourceMappingURL=notification-dispatch.service.js.map