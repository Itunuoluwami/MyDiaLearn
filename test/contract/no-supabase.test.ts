import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The end of the Supabase coupling ratchet.
 *
 * This file used to carry an inventory of every `.rpc()` and `.from()` call the
 * frontend made — 45 stored procedures and 35 tables — and fail in both
 * directions, so new coupling could not appear quietly and a domain could not
 * be called migrated until its entries were deleted. That list is now empty:
 * the frontend speaks only to the NestJS API, `src/integrations/supabase/` is
 * gone and `@supabase/supabase-js` is no longer a dependency.
 *
 * What is left is the guard in the other direction. The inventory could only
 * ever shrink; from here the count is zero, and these tests fail if anything
 * reintroduces a Supabase client, a direct PostgREST call, or a secret that
 * would be inlined into the browser bundle.
 */

const SRC = join(import.meta.dirname, "..", "..", "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry)) return [];
    if (full.endsWith("routeTree.gen.ts")) return [];
    return [full];
  });
}

/** `supabase.rpc("x")` or the old untyped `governanceRpc<T>("x")` helper. */
const RPC_PATTERN = /(?:\.rpc|governanceRpc(?:<[^>]*>)?)\(\s*"([a-z_]+)"/g;

/** `supabase.from("x")` or the old untyped `governanceTable<T>("x")` helper. */
const TABLE_PATTERN = /(?:\.from|governanceTable(?:<[^>]*>)?)\(\s*"([a-z_]+)"/g;

function collect(pattern: RegExp): string[] {
  const found = new Set<string>();
  for (const file of sourceFiles(SRC)) {
    for (const match of readFileSync(file, "utf8").matchAll(pattern)) {
      if (match[1]) found.add(match[1]);
    }
  }
  return [...found].sort();
}

/** Files that may name Supabase in prose explaining why it is gone. */
function offendingLines(file: string, pattern: RegExp): string[] {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => pattern.test(line) && !/^\s*(?:\/\/|\*|\/\*)/.test(line));
}

describe("the frontend no longer speaks to Supabase", () => {
  it("calls no stored procedures", () => {
    expect(collect(RPC_PATTERN)).toEqual([]);
  });

  it("reads no tables or views directly", () => {
    expect(collect(TABLE_PATTERN)).toEqual([]);
  });

  it("imports no Supabase client", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const hits = offendingLines(file, /@supabase\/|integrations\/supabase/);
      if (hits.length > 0) offenders.push(file.slice(file.indexOf("/src/") + 1));
    }
    expect(offenders).toEqual([]);
  });

  it("keeps secrets out of anything VITE_-prefixed", () => {
    // VITE_* is inlined into the client bundle at build time.
    for (const file of sourceFiles(SRC)) {
      expect(readFileSync(file, "utf8")).not.toMatch(
        /VITE_[A-Z_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY|PASSWORD)/,
      );
    }
  });
});
