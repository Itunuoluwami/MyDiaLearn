import { Module } from '@nestjs/common';

/**
 * Student portal and learner records.
 *
 * Replaces the students table reads, the student dashboard, materials, history
 * and assignment submission paths in src/lib/student-data.ts.
 *
 * Note students are not always accounts: a parent-managed learner may have no
 * login of their own, so a student id and a profile id are not interchangeable.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class StudentsModule {}
