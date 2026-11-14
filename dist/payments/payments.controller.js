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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const request_context_1 = require("../common/audit/request-context");
const payment_dto_1 = require("./dto/payment.dto");
const payments_service_1 = require("./payments.service");
const payment_processing_service_1 = require("./services/payment-processing.service");
let PaymentsController = class PaymentsController {
    payments;
    processing;
    constructor(payments, processing) {
        this.payments = payments;
        this.processing = processing;
    }
    async quote(user, dto) {
        return this.payments.quote(user.id, dto);
    }
    async pay(user, dto, request) {
        return this.payments.payForBooking(user.id, dto.bookingId, (0, request_context_1.auditContextOf)(request));
    }
    async verify(user, id) {
        return this.payments.verify(user.id, id);
    }
    async webhook(provider, request) {
        return this.processing.handleWebhook(provider, request.rawBody, request.headers);
    }
    async processRefunds() {
        return this.processing.processPendingRefunds();
    }
    async list(user, query) {
        return this.payments.list(user.id, query);
    }
    async settlementPolicy() {
        return this.payments.settlementPolicy();
    }
    async earnings(user) {
        return this.payments.earnings(user.id);
    }
    async earningsRecords(user, query) {
        return this.payments.earningsRecords(user.id, query);
    }
    async requestPayout(user, dto, request) {
        return this.payments.requestPayout(user.id, dto.amount, (0, request_context_1.auditContextOf)(request));
    }
    async listPayouts(user, query) {
        return this.payments.listPayouts(user.id, query);
    }
    async findOne(user, id) {
        return this.payments.findOne(user.id, id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('quote'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.QuoteBookingDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "quote", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.PayForBookingDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verify", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Post)('webhooks/:provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
__decorate([
    (0, common_1.Post)('refunds/process'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, roles_decorator_1.RequirePermission)('admin.payments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processRefunds", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.ListPaymentsQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('settlement-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "settlementPolicy", null);
__decorate([
    (0, common_1.Get)('earnings'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "earnings", null);
__decorate([
    (0, common_1.Get)('earnings/records'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.ListPaymentsQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "earningsRecords", null);
__decorate([
    (0, common_1.Post)('payouts'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.RequestPayoutDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.ListPaymentsQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "listPayouts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        payment_processing_service_1.PaymentProcessingService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map