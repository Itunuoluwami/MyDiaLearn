/**
 * Builds DiaLearn's schema on a plain PostgreSQL server from the existing
 * supabase/migrations SQL, over the compatibility layer in
 * prisma/sql/000_compat.sql.
 *
 *   npm run db:schema:dryrun   report only; always rolls back
 *   npm run db:schema:apply    commit, refusing a non-empty public schema
 *
 * Why this exists rather than `pg_dump` from Supabase: the migrations are
 * already in the repository and reproduce the schema exactly, so nothing has
 * to be extracted from the Supabase project at all.
 *
 * Two adjustments make them apply off-platform, both handled by rewriteRoles():
 * role targets become PUBLIC because a non-superuser cannot CREATE ROLE, and
 * `ALTER EXTENSION btree_gist SET SCHEMA` is dropped because moving an
 * extension needs ownership of its internal types. Policy PREDICATES — the
 * part that enforces tenancy — are untouched.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const migrationsDir = join(repoRoot, 'supabase', 'migrations');
const compatPath = join(here, '..', 'prisma', 'sql', '000_compat.sql');

const STRIP_ROLES = process.argv.includes('--strip-roles');
const APPLY = process.argv.includes('--apply');

/**
 * We are not superuser and cannot CREATE ROLE, so `GRANT ... TO authenticated`
 * and `CREATE POLICY ... TO anon` fail on a role that does not exist. With
 * --strip-roles those role targets are rewritten to PUBLIC, which is sound
 * here: the backend connects as a single owning user, and the policy
 * PREDICATES — the part that actually enforces tenancy — are unchanged.
 */
const ROLE_LIST = '(?:anon|authenticated|service_role|public)';

function rewriteRoles(sql) {
  if (!STRIP_ROLES) return sql;
  return (
    sql
      // GRANT ... TO authenticated  /  CREATE POLICY ... TO anon, authenticated
      .replace(
        new RegExp(`\\bto\\s+${ROLE_LIST}(?:\\s*,\\s*${ROLE_LIST})*`, 'gi'),
        'to public',
      )
      // REVOKE ... FROM public, anon  /  REVOKE ... FROM authenticated
      .replace(
        new RegExp(`\\bfrom\\s+${ROLE_LIST}(?:\\s*,\\s*${ROLE_LIST})*(?=\\s*;)`, 'gi'),
        'from public',
      )
      // The compat layer already creates btree_gist in `extensions`; moving it
      // needs ownership of gbtreekey4 and fails for a non-superuser.
      .replace(/alter\s+extension\s+btree_gist\s+set\s+schema\s+\w+\s*;/gi, '')
  );
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000,
});

const failures = [];
let applied = 0;

await client.connect();

if (APPLY) {
  // Refuse to run against anything that already holds objects. This script
  // builds a schema; it must never be pointed at a populated database.
  const { rows } = await client.query(
    `select count(*)::int n from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE'`,
  );
  if (rows[0].n > 0) {
    console.error(
      `Refusing to apply: public schema already holds ${rows[0].n} table(s). ` +
        'This script only builds an empty database.',
    );
    await client.end();
    process.exit(1);
  }
  console.log('APPLY MODE — changes will be committed.\n');
} else {
  const { rows } = await client.query(
    `select count(*)::int n from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE'`,
  );
  if (rows[0].n > 0) {
    console.log(
      `NOTE: the public schema already holds ${rows[0].n} table(s), so every\n` +
        '      "already exists" failure below is expected. A dry run is only\n' +
        '      meaningful against an empty database.\n',
    );
  }
  await client.query('BEGIN');
}

try {
  await client.query(readFileSync(compatPath, 'utf8'));
  console.log(`compat layer:      applied  (strip-roles=${STRIP_ROLES})\n`);

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = rewriteRoles(readFileSync(join(migrationsDir, file), 'utf8'));
    try {
      // In apply mode each migration is its own transaction. That is not a
      // detail: PostgreSQL refuses to use an enum value in the transaction
      // that added it (55P04), and 20260907090000 adds 'super_admin' which the
      // next four migrations then reference. A savepoint is not enough — the
      // ALTER TYPE has to actually commit.
      await client.query(APPLY ? 'BEGIN' : 'SAVEPOINT m');
      await client.query(sql);
      await client.query(APPLY ? 'COMMIT' : 'RELEASE SAVEPOINT m');
      applied += 1;
      console.log(`  ok    ${file}`);
    } catch (error) {
      await client.query(APPLY ? 'ROLLBACK' : 'ROLLBACK TO SAVEPOINT m');
      failures.push({ file, code: error.code, message: error.message.split('\n')[0] });
      console.log(
        `  FAIL  ${file}  [${error.code}] ${error.message.split('\n')[0].slice(0, 95)}`,
      );
    }
  }

  console.log(`\napplied ${applied}/${files.length} migrations`);

  const counts = await client.query(`
    select
      (select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE')::int tables,
      (select count(*) from information_schema.views where table_schema='public')::int views,
      (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public')::int functions,
      (select count(*) from pg_policies where schemaname in ('public','storage'))::int policies,
      (select count(*) from pg_trigger where not tgisinternal)::int triggers,
      (select count(*) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e')::int enums
  `);
  console.log('resulting objects:', JSON.stringify(counts.rows[0]));

  if (failures.length) {
    console.log('\nfailure codes:', [...new Set(failures.map((f) => f.code))].join(', '));
  }
} finally {
  if (!APPLY) {
    await client.query('ROLLBACK');
    console.log('\ndry run — rolled back, database unchanged');
  } else {
    console.log('\ncommitted');
  }
  await client.end();
}

process.exit(failures.length ? 1 : 0);
