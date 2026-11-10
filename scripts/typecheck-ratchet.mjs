/**
 * Typecheck as a ratchet, not a gate.
 *
 * The repo carries 19 pre-existing type errors, almost all caused by
 * src/integrations/supabase/types.ts being generated before the 20260903* and
 * 20260907* migrations. Failing CI on them would make it red from day one and
 * train everyone to ignore it. Failing on any INCREASE keeps it useful now and
 * still catches new breakage.
 *
 * When `supabase gen types` is re-run, most of these disappear. Lower BASELINE
 * as they go; at 0, replace this script with a plain `tsc --noEmit`.
 */
import { spawnSync } from "node:child_process";

const BASELINE = 19;

const result = spawnSync("npx", ["tsc", "--noEmit"], { encoding: "utf8" });
const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const errors = output.split("\n").filter((line) => /error TS\d+/.test(line));

const byFile = new Map();
for (const line of errors) {
  const file = line.split("(")[0];
  byFile.set(file, (byFile.get(file) ?? 0) + 1);
}

console.log(`Type errors: ${errors.length} (baseline ${BASELINE})\n`);
for (const [file, count] of [...byFile.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(3)}  ${file}`);
}

if (errors.length > BASELINE) {
  console.error(
    `\nFAIL: ${errors.length - BASELINE} new type error(s). ` +
      `Fix them, or raise BASELINE deliberately with a reason.`,
  );
  process.exit(1);
}

if (errors.length < BASELINE) {
  console.log(
    `\nRatchet: down to ${errors.length}. Lower BASELINE in ` +
      `scripts/typecheck-ratchet.mjs to ${errors.length} to lock the gain in.`,
  );
}

console.log("\nOK");
