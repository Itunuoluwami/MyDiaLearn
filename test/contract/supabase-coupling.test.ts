import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A ratchet for the NestJS migration.
 *
 * Every Supabase call in the frontend is a thing the backend will have to own.
 * This test freezes that inventory so it can only change deliberately: adding a
 * new `.rpc()` or `.from()` during the migration fails here, and moving a
 * domain to NestJS fails here too until the corresponding entries are deleted.
 * Either way the diff shows up in review instead of sliding past it.
 *
 * Expect this list to SHRINK. When it is empty, the frontend no longer speaks
 * to Supabase and the migration is done.
 *
 * Four call forms are scanned, because a plain `.rpc(` grep misses ten
 * procedures: types.ts is stale, so admin governance reaches its objects
 * through the untyped `governanceRpc` / `governanceTable` helpers in
 * src/integrations/supabase/governance-types.ts instead.
 */

const SRC = join(import.meta.dirname, "..", "..", "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry)) return [];
    // Generated, and describes the schema rather than calling it.
    if (full.endsWith("routeTree.gen.ts") || full.endsWith("supabase/types.ts")) return [];
    return [full];
  });
}

function collect(pattern: RegExp): Set<string> {
  const found = new Set<string>();
  for (const file of sourceFiles(SRC)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(pattern)) {
      if (match[1]) found.add(match[1]);
    }
  }
  return found;
}

/** `supabase.rpc("x")` and `governanceRpc<T>("x")`. */
const RPC_PATTERN = /(?:\.rpc|governanceRpc(?:<[^>]*>)?)\(\s*"([a-z_]+)"/g;

/** `supabase.from("x")` and `governanceTable<T>("x")`. Storage buckets use
 *  hyphens and so never match this character class. */
const TABLE_PATTERN = /(?:\.from|governanceTable(?:<[^>]*>)?)\(\s*"([a-z_]+)"/g;

const EXPECTED_RPCS = [
  "admin_dashboard_summary",
  "admin_invite_create",
  "admin_invite_redeem",
  "admin_invite_revoke",
  "admin_reject_payout",
  "admin_report_summary",
  "admin_request_action",
  "admin_resolve_dispute",
  "admin_review_action",
  "admin_set_user_permission",
  "admin_set_user_roles",
  "booking_quote",
  "clear_must_change_password",
  "ensure_tutor_record",
  "is_super_admin",
  "my_conversations",
  "my_permissions",
  "parent_child_progress",
  "parent_dashboard_summary",
  "pay_for_booking",
  "public_country_facets",
  "public_curriculum_facets",
  "public_search_suggestions",
  "public_subject_facets",
  "public_tutor_cards",
  "public_tutor_detail",
  "public_tutor_reviews",
  "public_tutor_search",
  "raise_dispute",
  "tutor_available_slots",
  "tutor_bookings",
  "tutor_dashboard_summary",
  "tutor_earnings_records",
  "tutor_earnings_summary",
  "tutor_end_class",
  "tutor_open_class",
  "tutor_rating_categories",
  "tutor_rating_summary",
  "tutor_request_payout",
  "tutor_respond_booking",
  "tutor_reviews",
  "tutor_start_class",
  "tutor_start_conversation",
  "tutor_students",
  "tutor_submit_verification",
];

const EXPECTED_TABLES = [
  "admin_action_requests",
  "admin_invitations",
  "assignments",
  "audit_logs",
  "availability_windows",
  "bookings",
  "cancellation_policies",
  "commission_rules",
  "conversation_participants",
  "currencies",
  "curricula",
  "disputes",
  "education_levels",
  "learning_resources",
  "lesson_notes",
  "messages",
  "notification_templates",
  "notifications",
  "payments",
  "payouts",
  "permissions",
  "platform_settings",
  "profiles",
  "ratings",
  "role_permissions",
  "students",
  "subjects",
  "tutor_agencies",
  "tutor_documents",
  "tutor_subjects",
  "tutor_verification_progress",
  "tutors",
  "user_permissions",
  "user_roles",
  "verification_steps",
];

describe("Supabase coupling inventory", () => {
  it("calls exactly the 45 stored procedures on record", () => {
    expect([...collect(RPC_PATTERN)].sort()).toEqual(EXPECTED_RPCS);
  });

  it("reads exactly the 35 tables and views on record", () => {
    expect([...collect(TABLE_PATTERN)].sort()).toEqual(EXPECTED_TABLES);
  });

  it("confines the service-role client to server-only modules", () => {
    // client.server.ts bypasses RLS entirely. A top-level import from a route
    // or a *.functions.ts file would ship the key into the browser bundle, so
    // every reference must be a dynamic import inside a handler.
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      if (file.endsWith("client.server.ts")) continue;
      const text = readFileSync(file, "utf8");
      if (!text.includes("client.server")) continue;
      const staticImport = /^\s*import\s[^;]*["']@?[^"']*client\.server["']/m.test(text);
      if (staticImport && !file.endsWith(".server.ts")) {
        offenders.push(file.slice(file.indexOf("/src/") + 1));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the service-role key out of anything VITE_-prefixed", () => {
    // VITE_* is inlined into the client bundle at build time.
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toMatch(/VITE_SUPABASE_SERVICE_ROLE|VITE_.*SERVICE_ROLE/);
    }
  });
});
