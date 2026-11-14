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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
exports.toPaymentResponse = toPaymentResponse;
exports.toPayoutResponse = toPayoutResponse;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit/audit.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const database_errors_1 = require("../common/exceptions/database-errors");
const query_dto_1 = require("../shared/query.dto");
const payments_repository_1 = require("./payments.repository");
const payment_processing_service_1 = require("./services/payment-processing.service");
const pricing_service_1 = require("./services/pricing.service");
const settlement_service_1 = require("./services/settlement.service");
let PaymentsService = class PaymentsService {
    repository;
    pricing;
    settlement;
    audit;
    processing;
    constructor(repository, pricing, settlement, audit, processing) {
        this.repository = repository;
        this.pricing = pricing;
        this.settlement = settlement;
        this.audit = audit;
        this.processing = processing;
    }
    async quote(callerId, input) {
        return this.pricing.quote(callerId, input);
    }
    async payForBooking(payerId, bookingId, context) {
        const outcome = await this.processing.payForBooking(payerId, bookingId, context);
        return {
            ...toPaymentResponse(outcome.payment),
            ...(outcome.checkoutUrl ? { checkoutUrl: outcome.checkoutUrl } : {}),
        };
    }
    async verify(userId, paymentId) {
        return toPaymentResponse(await this.processing.verifyForPayer(userId, paymentId));
    }
    async list(userId, query) {
        const { rows, total } = await this.repository.listForUser(userId, query);
        return (0, query_dto_1.paginate)(rows.map(toPaymentResponse), total, query);
    }
    async findOne(userId, id) {
        const row = await this.repository.findById(userId, id);
        if (!row)
            throw new app_exception_1.NotFoundError('Payment');
        return toPaymentResponse(row);
    }
    async earnings(tutorUserId) {
        return this.settlement.earnings(tutorUserId);
    }
    async earningsRecords(tutorUserId, query) {
        return this.repository.earningsRecords(tutorUserId, query);
    }
    async settlementPolicy() {
        return this.settlement.policy();
    }
    async requestPayout(tutorUserId, amount, context) {
        await this.settlement.assertPayoutAllowed(amount);
        let id;
        try {
            id = await this.repository.requestPayout(tutorUserId, amount);
        }
        catch (error) {
            throw (0, database_errors_1.translateDatabaseError)(error, 'We could not request that payout.');
        }
        await this.audit.record('payout.requested', {
            actorId: tutorUserId,
            entityType: 'payout',
            entityId: id,
            context,
            metadata: { amount: String(amount) },
        });
        return { id };
    }
    async listPayouts(userId, query) {
        const { rows, total } = await this.repository.listPayouts(userId, query);
        return (0, query_dto_1.paginate)(rows.map(toPayoutResponse), total, query);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        pricing_service_1.PricingService,
        settlement_service_1.SettlementService,
        audit_service_1.AuditService,
        payment_processing_service_1.PaymentProcessingService])
], PaymentsService);
function toPaymentResponse(row) {
    return {
        id: row.id,
        bookingId: row.booking_id,
        amount: String(row.amount),
        currency: row.currency,
        platformFee: String(row.platform_fee),
        commissionAmount: String(row.commission_amount),
        tutorPayout: String(row.tutor_payout),
        status: row.status,
        provider: row.provider,
        providerReference: row.provider_reference,
        refundedAmount: row.refunded_amount === null ? null : String(row.refunded_amount),
        paidAt: row.paid_at ? row.paid_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
    };
}
function toPayoutResponse(row) {
    return {
        id: row.id,
        amount: String(row.amount),
        currency: row.currency,
        status: row.status,
        reference: row.reference,
        notes: row.notes,
        requestedAt: row.requested_at.toISOString(),
        settledAt: row.settled_at ? row.settled_at.toISOString() : null,
    };
}
//# sourceMappingURL=payments.service.js.map