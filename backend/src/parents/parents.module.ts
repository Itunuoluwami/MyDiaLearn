import { Module } from '@nestjs/common';

/**
 * Parent portal.
 *
 * Replaces parent_dashboard_summary() and parent_child_progress(), and the
 * parent-side reads in src/lib/parent-data.ts.
 *
 * Owns the parent-child relationship expressed by students.parent_id and the
 * can_access_student() predicate — the check deciding whether a parent may see a
 * given learner. That predicate currently lives in the database and applies
 * automatically; here it must be applied explicitly by every query.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class ParentsModule {}
