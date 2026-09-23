import { Module } from '@nestjs/common';

/**
 * Tutor profiles, availability, verification and earnings.
 *
 * Replaces tutor_dashboard_summary(), tutor_students(), tutor_reviews(),
 * tutor_available_slots(), tutor_submit_verification(), tutor_earnings_summary(),
 * tutor_earnings_records(), tutor_request_payout(), ensure_tutor_record(),
 * current_tutor_id() and owns_tutor(), plus the tutors, tutor_subjects,
 * tutor_documents, availability_windows and tutor_verification_progress tables.
 *
 * Two database invariants must survive the move: tutors_admin_only_hourly_rate
 * (a tutor cannot set their own rate) and tutors_enforce_verification. The
 * recommendation is to keep both triggers in PostgreSQL as defence in depth even
 * once this module duplicates the checks.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class TutorsModule {}
