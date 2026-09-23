import { Module } from '@nestjs/common';

/**
 * Tutor agencies.
 *
 * Scope is unresolved. The schema has tutor_agencies, tutors.agency_id,
 * commission_rules.agency_id and an `agency` member of the app_role enum, but
 * there is no agency UI anywhere in the frontend and no agency RPC.
 *
 * So this module exists to mark the boundary, not to be filled in. Building
 * endpoints here would mean inventing business rules, which migration rule 10
 * forbids. See question Q2 in the architecture audit.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class AgenciesModule {}
