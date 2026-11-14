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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const platform_settings_service_1 = require("../../platform-settings/platform-settings.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
let PricingService = class PricingService {
    prisma;
    settings;
    constructor(prisma, settings) {
        this.prisma = prisma;
        this.settings = settings;
    }
    async quote(callerId, input) {
        const allowed = await this.settings.allowedDurations();
        if (!allowed.includes(input.durationMinutes)) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `Lessons must be one of ${allowed.join(', ')} minutes.`, 400, { allowedDurations: allowed });
        }
        const rows = await this.prisma.withUser(callerId, async (tx) => tx.$queryRaw `select * from public.booking_quote(${input.tutorId}::uuid, ${input.durationMinutes})`);
        const row = rows[0];
        if (!row) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_FOUND, 'No price is available for this tutor.', 404);
        }
        return {
            currency: row.currency,
            hourlyRate: String(row.hourly_rate),
            durationMinutes: row.duration_minutes,
            lessonAmount: String(row.lesson_amount),
            platformFee: String(row.platform_fee),
            processingFee: String(row.processing_fee),
            commissionAmount: String(row.commission_amount),
            totalAmount: String(row.total_amount),
            commissionRuleId: row.commission_rule_id,
            cancellationPolicyId: row.cancellation_policy_id,
        };
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        platform_settings_service_1.PlatformSettingsService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map