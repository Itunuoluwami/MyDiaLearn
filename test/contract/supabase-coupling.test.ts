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
  "admin_invite_create",
  "admin_invite_redeem",
  "clear_must_change_password",
  "is_super_admin",
];

const EXPECTED_TABLES = ["profiles"];

describe("Supabase coupling inventory", () => {
  it("calls exactly the 4 stored procedures on record", () => {
    expect([...collect(RPC_PATTERN)].sort()).toEqual(EXPECTED_RPCS);
  });

  it("reads exactly the 1 tables and views on record", () => {
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
