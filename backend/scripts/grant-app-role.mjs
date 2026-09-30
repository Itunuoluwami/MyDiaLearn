#!/usr/bin/env node
/**
 * Grants the restricted database login what the API needs — and nothing that
 * lets it escape row-level security.
 *
 *   node scripts/grant-app-role.mjs <login-name>            # print the SQL
 *   node scripts/grant-app-role.mjs <login-name> --apply    # run it as the owner
 *
 * The login itself is created in the SmarterASP control panel (the owner
 * account cannot CREATE ROLE there). Runs against DATABASE_URL from .env, as
 * the owner. Idempotent: safe to re-run after new tables or functions.
 *
 * Why this is enough for RLS to bind: the login does not own the tables and
 * has no BYPASSRLS, and every policy in this database targets PUBLIC (the
 * schema build rewrote Supabase's anon/authenticated targets). Afterwards the
 * script checks both conditions and refuses to report success otherwise.
 */
import 'dotenv/config';
import pg from 'pg';

const [login, flag] = process.argv.slice(2);
if (!login || !/^[a-z_][a-z0-9_]{0,62}$/.test(login)) {
  console.error('Usage: node scripts/grant-app-role.mjs <login-name> [--apply]');
  process.exit(1);
}
const role = `"${login}"`;

const sql = [
  `grant usage on schema public, auth, storage to ${role}`,
  `grant select, insert, update, delete on all tables in schema public to ${role}`,
  `grant select on all tables in schema auth to ${role}`,
  `grant usage, select on all sequences in schema public to ${role}`,
  `grant execute on all functions in schema public, auth to ${role}`,
];

if (flag !== '--apply') {
  console.log(sql.map((s) => `${s};`).join('\n'));
  console.log('\n-- Dry run. Re-run with --apply to execute as the owner in DATABASE_URL.');
  process.exit(0);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const exists = await client.query(
    'select rolbypassrls, rolsuper from pg_roles where rolname = $1',
    [login],
  );
  if (!exists.rowCount)
    throw new Error(`Login ${login} does not exist. Create it in the control panel first.`);
  if (exists.rows[0].rolbypassrls || exists.rows[0].rolsuper) {
    throw new Error(`${login} can bypass row-level security; it is not a restricted login.`);
  }

  await client.query('begin');
  for (const statement of sql) await client.query(statement);
  await client.query('commit');

  const owned = await client.query(
    `select count(*)::int n from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and pg_get_userbyid(c.relowner) = $1`,
    [login],
  );
  if (owned.rows[0].n)
    throw new Error(`${login} owns ${owned.rows[0].n} tables; RLS would not bind it.`);
  console.log(`Granted. ${login} is restricted: no table ownership, no BYPASSRLS.`);
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
