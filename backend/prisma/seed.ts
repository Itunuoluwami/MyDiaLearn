/**
 * Reference-data seed.
 *
 * Most of DiaLearn's catalogue is created by the SQL migrations themselves —
 * subjects, curricula, education levels, currencies, cancellation policies,
 * verification steps and commission rules all arrive with the schema. Comparing
 * a freshly built database against the Supabase project shows identical content
 * for every one of them; only the generated UUIDs differ, because
 * gen_random_uuid() ran separately in each.
 *
 * The exception is platform_settings. Eleven `content.*` rows exist in Supabase
 * that no migration creates: the homepage hero copy, testimonials, trust
 * signals, country labels, persona options and the class-preview media. That is
 * admin-authored content, it exists nowhere else, and losing it would blank
 * large parts of the marketing site.
 *
 * So this seed does one narrow thing: it inserts rows whose NATURAL KEY is
 * absent, and lets the database assign its own primary keys. Matching on the
 * natural key rather than the UUID is what makes it safe to run against a
 * database whose ids were generated independently.
 *
 * Idempotent. Inserts only; never updates or deletes.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

/** Tables to reconcile, and the column that identifies a row by meaning. */
const NATURAL_KEYS: Record<string, string> = {
  currencies: 'code',
  subjects: 'slug',
  education_levels: 'name',
  cancellation_policies: 'name',
  commission_rules: 'name',
  platform_settings: 'key',
};

async function main(): Promise<void> {
  const env = process.env.APP_ENV ?? 'development';
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');

  const dataDir = join(__dirname, 'reference-data');
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 20000 });
  await client.connect();

  console.log(`Reconciling reference data (APP_ENV=${env})\n`);
  let totalInserted = 0;

  try {
    for (const [table, key] of Object.entries(NATURAL_KEYS)) {
      let exported: Record<string, unknown>[];
      try {
        exported = JSON.parse(readFileSync(join(dataDir, `${table}.json`), 'utf8'));
      } catch {
        console.log(`  ${table.padEnd(24)} no export file, skipped`);
        continue;
      }
      if (!exported.length || !(key in exported[0])) {
        console.log(`  ${table.padEnd(24)} no "${key}" column in export, skipped`);
        continue;
      }

      // Column types decide how a value is encoded. Guessing from the
      // JavaScript type is wrong for jsonb: a plain string like "Welcome" is
      // not valid JSON until it is quoted, so it has to be stringified too.
      const typed = await client.query<{ column_name: string; data_type: string }>(
        `select column_name, data_type from information_schema.columns
         where table_schema = 'public' and table_name = $1`,
        [table],
      );
      const jsonColumns = new Set(
        typed.rows
          .filter((r) => r.data_type === 'jsonb' || r.data_type === 'json')
          .map((r) => r.column_name),
      );

      const live = await client.query(`select "${key}" from public.${table}`);
      const present = new Set(live.rows.map((r) => String(r[key])));
      const missing = exported.filter((row) => !present.has(String(row[key])));

      if (!missing.length) {
        console.log(`  ${table.padEnd(24)} up to date (${live.rowCount} rows)`);
        continue;
      }

      let inserted = 0;
      for (const row of missing) {
        // Drop the source id so this database assigns its own. Carrying a
        // foreign UUID across would only invite mismatches against rows the
        // migrations already created.
        const { id: _ignored, ...rest } = row as { id?: unknown };
        const columns = Object.keys(rest);
        const values = columns.map((column) => {
          const value = (rest as Record<string, unknown>)[column];
          if (value === null) return null;
          // json/jsonb: always re-encode, including primitives.
          if (jsonColumns.has(column)) return JSON.stringify(value);
          // Postgres arrays map natively; other objects need encoding.
          if (typeof value === 'object' && !Array.isArray(value)) return JSON.stringify(value);
          return value;
        });

        const result = await client.query(
          `insert into public.${table} (${columns.map((c) => `"${c}"`).join(', ')})
           values (${columns.map((_, i) => `$${i + 1}`).join(', ')})
           on conflict do nothing`,
          values,
        );
        inserted += result.rowCount ?? 0;
      }

      totalInserted += inserted;
      console.log(
        `  ${table.padEnd(24)} ${inserted} inserted (${missing.length} missing, ${live.rowCount} already present)`,
      );
    }

    console.log(`\n${totalInserted} row(s) inserted.`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
