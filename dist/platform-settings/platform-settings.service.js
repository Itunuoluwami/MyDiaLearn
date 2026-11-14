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
var PlatformSettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsService = exports.SETTING_KEYS = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const app_exception_1 = require("../common/exceptions/app.exception");
const platform_settings_repository_1 = require("./platform-settings.repository");
const CACHE_TTL_MS = 60_000;
exports.SETTING_KEYS = {
    baseCurrency: 'money.base_currency',
    allowedDurations: 'booking.allowed_durations',
    defaultDuration: 'booking.default_duration_minutes',
    maxAdvanceDays: 'booking.max_advance_days',
    minNoticeHours: 'booking.min_notice_hours',
    payoutMinimum: 'payouts.minimum_amount',
    payoutSettlementDays: 'payouts.settlement_days',
    payoutScheduleLabel: 'payouts.schedule_label',
    nextPayoutDate: 'payouts.next_payout_date',
    accountTypes: 'auth.account_types',
    countries: 'auth.countries',
    otpExpiryMinutes: 'auth.otp_expiry_minutes',
};
let PlatformSettingsService = PlatformSettingsService_1 = class PlatformSettingsService {
    repository;
    logger;
    cache = null;
    cachedAt = 0;
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
        this.logger.setContext(PlatformSettingsService_1.name);
    }
    async all() {
        if (this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS)
            return this.cache;
        const rows = await this.repository.findAll();
        this.cache = new Map(rows.map((row) => [row.key, row.value]));
        this.cachedAt = Date.now();
        return this.cache;
    }
    invalidate() {
        this.cache = null;
    }
    async get(key, fallback) {
        const value = (await this.all()).get(key);
        if (value === undefined || value === null) {
            this.logger.warn({ key }, 'platform_settings row missing; using fallback');
            return fallback;
        }
        return value;
    }
    async getRequired(key) {
        const value = (await this.all()).get(key);
        if (value === undefined || value === null)
            throw new app_exception_1.NotFoundError(`Setting "${key}"`);
        return value;
    }
    baseCurrency() {
        return this.get(exports.SETTING_KEYS.baseCurrency, 'USD');
    }
    allowedDurations() {
        return this.get(exports.SETTING_KEYS.allowedDurations, [30, 45, 60, 90, 120]);
    }
    minNoticeHours() {
        return this.get(exports.SETTING_KEYS.minNoticeHours, 12);
    }
    maxAdvanceDays() {
        return this.get(exports.SETTING_KEYS.maxAdvanceDays, 60);
    }
    payoutMinimum() {
        return this.get(exports.SETTING_KEYS.payoutMinimum, 0);
    }
    async update(actorId, key, value) {
        const row = await this.repository.update(actorId, key, value);
        if (!row)
            throw new app_exception_1.NotFoundError(`Setting "${key}"`);
        this.invalidate();
    }
};
exports.PlatformSettingsService = PlatformSettingsService;
exports.PlatformSettingsService = PlatformSettingsService = PlatformSettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_settings_repository_1.PlatformSettingsRepository,
        nestjs_pino_1.PinoLogger])
], PlatformSettingsService);
//# sourceMappingURL=platform-settings.service.js.map