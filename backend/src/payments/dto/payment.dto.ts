import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsUUID, Max, Min } from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

export class QuoteBookingDto {
  @IsUUID('4')
  tutorId!: string;

  /**
   * Bounds only. The permitted set is a platform_settings row an admin edits,
   * so PricingService checks membership — a DTO cannot know the answer.
   */
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;
}

export class PayForBookingDto {
  @IsUUID('4')
  bookingId!: string;
}

export class RequestPayoutDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}

export class ListPaymentsQueryDto extends PaginationQueryDto {}

/**
 * Response shape.
 *
 * `provider_reference` is exposed because support needs it to trace a charge,
 * but nothing else from the provider is. Amounts stay strings: they are
 * NUMERIC in the database, and rounding money through a JavaScript float is
 * how settlement reports stop reconciling.
 */
export interface PaymentResponse {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  platformFee: string;
  commissionAmount: string;
  tutorPayout: string;
  status: string;
  provider: string | null;
  providerReference: string | null;
  refundedAmount: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PayoutResponse {
  id: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  notes: string | null;
  requestedAt: string;
  settledAt: string | null;
}
