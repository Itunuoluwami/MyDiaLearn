import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import {
  PlatformSettingsService,
  SETTING_KEYS,
} from '../../platform-settings/platform-settings.service';
import { AppException, ErrorCode } from '../../common/exceptions/app.exception';

export interface SettlementPolicy {
  minimumAmount: number;
  settlementDays: number;
  scheduleLabel: string;
  nextPayoutDate: string | null;
  currency: string;
}

/**
 * tutor_earnings_summary(), field for field. Money stays a string (NUMERIC).
 * The schedule fields are the function's own wording of the admin-configured
 * payout policy, passed through rather than re-derived.
 */
export interface EarningsSummary {
  currency: string;
  grossRevenue: string;
  platformCommission: string;
  paymentFees: string;
  netEarnings: string;
  pendingEarnings: string;
  paidOut: string;
  pendingPayouts: string;
  availableBalance: string;
  minimumPayout: string;
  nextPayoutDate: string | null;
  scheduleLabel: string | null;
}

/**
 * When and how a tutor gets paid.
 *
 * The policy — minimum payout, settlement delay, schedule wording — is entirely
 * admin-configured in platform_settings. Nothing here is a constant, which is
 * the point: changing the payout threshold must be an admin edit, not a deploy.
 */
@Injectable()
export class SettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: PlatformSettingsService,
  ) {}

  async policy(): Promise<SettlementPolicy> {
    const [minimumAmount, settlementDays, scheduleLabel, nextPayoutDate, currency] =
      await Promise.all([
        this.settings.payoutMinimum(),
        this.settings.get<number>(SETTING_KEYS.payoutSettlementDays, 0),
        this.settings.get<string>(SETTING_KEYS.payoutScheduleLabel, ''),
        this.settings.get<string | null>(SETTING_KEYS.nextPayoutDate, null),
        this.settings.baseCurrency(),
      ]);

    return { minimumAmount, settlementDays, scheduleLabel, nextPayoutDate, currency };
  }

  /** A tutor's own earnings, via the existing tutor_earnings_summary(). */
  async earnings(tutorUserId: string): Promise<EarningsSummary | null> {
    const rows = await this.prisma.withUser(
      tutorUserId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.tutor_earnings_summary()
      `,
    );
    const row = rows[0];
    if (!row) return null;

    const str = (v: unknown) => String(v ?? '0');
    const text = (v: unknown) => (v === null || v === undefined ? null : String(v));
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

  /**
   * Checks a payout request against the configured threshold before it reaches
   * the database.
   *
   * tutor_request_payout() enforces its own rules; this exists so the caller
   * gets a message naming the actual minimum rather than a raised exception,
   * and so the threshold is read from configuration in exactly one place.
   */
  async assertPayoutAllowed(amount: number): Promise<void> {
    const { minimumAmount, currency } = await this.policy();
    if (amount < minimumAmount) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `The minimum payout is ${minimumAmount} ${currency}.`,
        400,
        { minimumAmount, currency },
      );
    }
  }
}
