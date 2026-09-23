import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { PlatformSettingsService } from '../../platform-settings/platform-settings.service';
import { AppException, ErrorCode } from '../../common/exceptions/app.exception';

export interface BookingQuote {
  currency: string;
  hourlyRate: string;
  durationMinutes: number;
  lessonAmount: string;
  platformFee: string;
  processingFee: string;
  commissionAmount: string;
  totalAmount: string;
  commissionRuleId: string | null;
  /**
   * Captured onto the booking so the policy in force at booking time governs
   * a later cancellation, even if an admin edits the policy in between.
   */
  cancellationPolicyId: string | null;
}

/**
 * What a lesson costs.
 *
 * Delegates to the database's booking_quote(), which resolves the applicable
 * commission_rules row, applies the platform fee and returns the split. That
 * is not laziness: the rule set supports percentage, fixed and tiered models,
 * scoping by tutor, agency and subject, priority ordering and effective dates.
 * Reimplementing it in TypeScript would mean two definitions of what a lesson
 * costs, and the second one would be wrong eventually.
 *
 * Migration rule 11 in one sentence: no number in this file.
 *
 * Amounts are returned as strings. They are NUMERIC in the database and
 * JavaScript's number cannot hold them exactly — rounding money through a
 * float is how settlement reports stop reconciling.
 */
@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: PlatformSettingsService,
  ) {}

  /**
   * Quotes a lesson, validating the duration against admin configuration.
   *
   * The duration check happens here rather than in a DTO because the allowed
   * set is a platform_settings row an admin edits, not a constant.
   */
  async quote(
    callerId: string,
    input: { tutorId: string; durationMinutes: number },
  ): Promise<BookingQuote> {
    const allowed = await this.settings.allowedDurations();
    if (!allowed.includes(input.durationMinutes)) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `Lessons must be one of ${allowed.join(', ')} minutes.`,
        400,
        { allowedDurations: allowed },
      );
    }

    const rows = await this.prisma.withUser(
      callerId,
      async (tx) =>
        tx.$queryRaw<
          {
            currency: string;
            hourly_rate: string;
            duration_minutes: number;
            lesson_amount: string;
            platform_fee: string;
            processing_fee: string;
            commission_amount: string;
            total_amount: string;
            commission_rule_id: string | null;
            cancellation_policy_id: string | null;
          }[]
        >`select * from public.booking_quote(${input.tutorId}::uuid, ${input.durationMinutes})`,
    );

    const row = rows[0];
    if (!row) {
      throw new AppException(
        ErrorCode.NOT_FOUND,
        'No price is available for this tutor.',
        404,
      );
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
}
