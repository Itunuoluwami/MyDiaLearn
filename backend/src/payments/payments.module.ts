import { Module } from '@nestjs/common';

/**
 * Charges, commission, payouts and settlement.
 *
 * Replaces pay_for_booking(), tutor_request_payout(), admin_reject_payout() and
 * the payments/payouts/commission_rules reads.
 *
 * The fee split is not a formula to re-derive: it reads commission_rules, honours
 * the 'tiered' model over a 30-day completed-booking window, and charges
 * bookings.total_amount as captured at booking_quote() time so that a later rule
 * change never retroactively alters an existing charge. Reproduce it exactly.
 *
 * Money never moves through business logic directly — it goes through
 * PaymentProvider. Today that is the simulated adapter, matching current
 * behaviour.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class PaymentsModule {}
