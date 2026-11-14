import { PinoLogger } from 'nestjs-pino';
import { PlatformSettingsRepository } from './platform-settings.repository';
export declare const SETTING_KEYS: {
    readonly baseCurrency: "money.base_currency";
    readonly allowedDurations: "booking.allowed_durations";
    readonly defaultDuration: "booking.default_duration_minutes";
    readonly maxAdvanceDays: "booking.max_advance_days";
    readonly minNoticeHours: "booking.min_notice_hours";
    readonly payoutMinimum: "payouts.minimum_amount";
    readonly payoutSettlementDays: "payouts.settlement_days";
    readonly payoutScheduleLabel: "payouts.schedule_label";
    readonly nextPayoutDate: "payouts.next_payout_date";
    readonly accountTypes: "auth.account_types";
    readonly countries: "auth.countries";
    readonly otpExpiryMinutes: "auth.otp_expiry_minutes";
};
export declare class PlatformSettingsService {
    private readonly repository;
    private readonly logger;
    private cache;
    private cachedAt;
    constructor(repository: PlatformSettingsRepository, logger: PinoLogger);
    all(): Promise<Map<string, unknown>>;
    invalidate(): void;
    get<T>(key: string, fallback: T): Promise<T>;
    getRequired<T>(key: string): Promise<T>;
    baseCurrency(): Promise<string>;
    allowedDurations(): Promise<number[]>;
    minNoticeHours(): Promise<number>;
    maxAdvanceDays(): Promise<number>;
    payoutMinimum(): Promise<number>;
    update(actorId: string, key: string, value: unknown): Promise<void>;
}
