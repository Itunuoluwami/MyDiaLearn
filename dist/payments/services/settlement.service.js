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
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const platform_settings_service_1 = require("../../platform-settings/platform-settings.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
let SettlementService = class SettlementService {
    prisma;
    settings;
    constructor(prisma, settings) {
        this.prisma = prisma;
        this.settings = settings;
    }
    async policy() {
        const [minimumAmount, settlementDays, scheduleLabel, nextPayoutDate, currency] = await Promise.all([
            this.settings.payoutMinimum(),
            this.settings.get(platform_settings_service_1.SETTING_KEYS.payoutSettlementDays, 0),
            this.settings.get(platform_settings_service_1.SETTING_KEYS.payoutScheduleLabel, ''),
            this.settings.get(platform_settings_service_1.SETTING_KEYS.nextPayoutDate, null),
            this.settings.baseCurrency(),
        ]);
        return { minimumAmount, settlementDays, scheduleLabel, nextPayoutDate, currency };
    }
    async earnings(tutorUserId) {
        const rows = await this.prisma.withUser(tutorUserId, async (tx) => tx.$queryRaw `
        select * from public.tutor_earnings_summary()
      `);
        const row = rows[0];
        if (!row)
            return null;
        const str = (v) => String(v ?? '0');
        const text = (v) => (v === null || v === undefined ? null : String(v));
        return {
            currency: String(row.currency ?? ''),
            grossRevenue: str(row.gross_revenue),
            platformCommission: str(row.platform_commission),
            paymentFees: str(row.payment_fees),
            netEarnings: str(row.net_earnings),
            pendingEarnings: str(row.pending_earnings),
            paidOut: str(row.paid_out),
            pendingPayouts: str(row.pending_payouts),
            availableBalance: str(row.available_balance),
            minimumPayout: str(row.minimum_payout),
            nextPayoutDate: text(row.next_payout_date),
            scheduleLabel: text(row.schedule_label),
        };
    }
    async assertPayoutAllowed(amount) {
        const { minimumAmount, currency } = await this.policy();
        if (amount < minimumAmount) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `The minimum payout is ${minimumAmount} ${currency}.`, 400, { minimumAmount, currency });
        }
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        platform_settings_service_1.PlatformSettingsService])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map