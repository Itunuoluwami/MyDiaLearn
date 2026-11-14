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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdminController = exports.SendTestEmailDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const email_service_1 = require("./email.service");
const email_templates_1 = require("./templates/email-templates");
class SendTestEmailDto {
    to;
    trigger;
}
exports.SendTestEmailDto = SendTestEmailDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address.' }),
    __metadata("design:type", String)
], SendTestEmailDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(email_templates_1.EMAIL_TRIGGERS),
    __metadata("design:type", String)
], SendTestEmailDto.prototype, "trigger", void 0);
let EmailAdminController = class EmailAdminController {
    email;
    constructor(email) {
        this.email = email;
    }
    async health() {
        const health = await this.email.checkHealth();
        return { ...health, environment: this.email.environment };
    }
    triggers() {
        return { triggers: email_templates_1.EMAIL_TRIGGERS };
    }
    async sendTest(user, dto) {
        const result = await this.email.sendTemplate({
            trigger: dto.trigger ?? 'account.welcome',
            to: dto.to,
            vars: {
                full_name: 'DiaLearn test',
                role: 'administrator',
                otp_code: '000000',
                expiry_minutes: 10,
                expiry_hours: 24,
                status: 'verified',
                amount: '0.00',
                currency: 'USD',
                subject: 'Test lesson',
                tutor_name: 'Test tutor',
                student_name: 'Test learner',
                starts_at: new Date().toISOString(),
            },
            headers: { 'X-DiaLearn-Test': 'true' },
        });
        return {
            sent: result !== null,
            provider: this.email.providerName,
            ...(result?.messageId ? { messageId: result.messageId } : {}),
            ...(result?.attempts ? { attempts: result.attempts } : {}),
        };
    }
};
exports.EmailAdminController = EmailAdminController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('triggers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], EmailAdminController.prototype, "triggers", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SendTestEmailDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "sendTest", null);
exports.EmailAdminController = EmailAdminController = __decorate([
    (0, common_1.Controller)('email'),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailAdminController);
//# sourceMappingURL=email.controller.js.map