import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { NotFoundError } from '../common/exceptions/app.exception';
import { PlatformSettingsRepository } from './platform-settings.repository';

/**
 * Typed access to admin-managed configuration.
 *
 * DiaLearn's operating rules — allowed lesson durations, minimum notice,
 * payout thresholds, the base currency — are rows in platform_settings, edited
 * by admins through the portal. Migration rule 11 forbids hardcoding any of
 * them, so every service that needs one reads it here.
 *
 * Cached briefly. These are read on nearly every booking request and change
 * perhaps monthly; a short TTL keeps an edit taking effect quickly without a
 * query per call. Explicit invalidation on write makes the common case
 * immediate.
 */
const CACHE_TTL_MS = 60_000;

export const SETTING_KEYS = {
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
} as const;

@Injectable()
export class PlatformSettingsService {
  private cache: Map<string, unknown> | null = null;
  private cachedAt = 0;

  constructor(
    private readonly repository: PlatformSettingsRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PlatformSettingsService.name);
  }

  async all(): Promise<Map<string, unknown>> {
    if (this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS) return this.cache;
    const rows = await this.repository.findAll();
    this.cache = new Map(rows.map((row) => [row.key, row.value]));
    this.cachedAt = Date.now();
    return this.cache;
  }

  invalidate(): void {
    this.cache = null;
  }

  /**
   * Reads a setting, falling back only when the row is absent.
   *
   * The fallback is a last resort for a database that predates a setting, not
   * a default to rely on — a caller that always falls back has hardcoded the
   * value in a less visible place.
   */
  async get<T>(key: string, fallback: T): Promise<T> {
    const value = (await this.all()).get(key);
    if (value === undefined || value === null) {
      this.logger.warn({ key }, 'platform_settings row missing; using fallback');
      return fallback;
    }
    return value as T;
  }

  async getRequired<T>(key: string): Promise<T> {
    const value = (await this.all()).get(key);
    if (value === undefined || value === null) throw new NotFoundError(`Setting "${key}"`);
    return value as T;
  }

  // Convenience accessors for the settings several modules share.

  baseCurrency(): Promise<string> {
    return this.get(SETTING_KEYS.baseCurrency, 'USD');
  }

  allowedDurations(): Promise<number[]> {
    return this.get(SETTING_KEYS.allowedDurations, [30, 45, 60, 90, 120]);
  }

  minNoticeHours(): Promise<number> {
    return this.get(SETTING_KEYS.minNoticeHours, 12);
  }

  maxAdvanceDays(): Promise<number> {
    return this.get(SETTING_KEYS.maxAdvanceDays, 60);
  }

  payoutMinimum(): Promise<number> {
    return this.get(SETTING_KEYS.payoutMinimum, 0);
  }

  async update(actorId: string, key: string, value: unknown): Promise<void> {
    const row = await this.repository.update(actorId, key, value);
    if (!row) throw new NotFoundError(`Setting "${key}"`);
    this.invalidate();
  }
}
