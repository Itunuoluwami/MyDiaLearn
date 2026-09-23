import { Module } from '@nestjs/common';

/**
 * Booking lifecycle, classroom sessions and teaching artefacts.
 *
 * Replaces booking_quote(), tutor_respond_booking(), tutor_bookings(),
 * tutor_open_class(), tutor_start_class(), tutor_end_class(),
 * admin_cancel_booking(), raise_dispute() and admin_resolve_dispute().
 *
 * Two triggers guard this domain and must not be dropped:
 * prevent_booking_overlap() stops a tutor being double-booked, and
 * confirm_booking_on_payment() is half of the rule that a lesson only becomes
 * 'confirmed' once the tutor has accepted AND a paid payments row exists. That
 * rule is split across a trigger and tutor_respond_booking(); both halves have to
 * move together or neither does.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class BookingsModule {}
