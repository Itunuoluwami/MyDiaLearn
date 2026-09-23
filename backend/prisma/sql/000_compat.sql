-- Supabase compatibility layer for a plain PostgreSQL server.
--
-- The 35 files in supabase/migrations are written against Supabase's runtime:
-- an `auth` schema, an `auth.uid()` function, a `storage` schema, and three
-- roles (anon, authenticated, service_role) that PostgREST switches between.
-- None of that exists on a normal server.
--
-- This file supplies the minimum needed for those migrations to apply. It is
-- not an emulation of Supabase — it is the seam that lets the existing schema
-- keep working while the backend takes over, and it shrinks as domains migrate.

-- ---------------------------------------------------------------------------
-- extensions
-- ---------------------------------------------------------------------------
-- btree_gist backs the exclusion constraint that stops a tutor being
-- double-booked. Supabase installs pgcrypto into an `extensions` schema and
-- one migration calls extensions.gen_random_bytes() by that qualified name, so
-- the schema has to exist under the same name.
create schema if not exists extensions;
-- Created directly in `extensions` rather than moved there afterwards. One
-- migration does `ALTER EXTENSION btree_gist SET SCHEMA extensions`, which
-- needs ownership of the extension's internal types (gbtreekey4 and friends)
-- and fails for a non-superuser. Putting it in the right schema up front makes
-- that statement unnecessary; the runner strips it.
create extension if not exists btree_gist with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- auth schema
-- ---------------------------------------------------------------------------
create schema if not exists auth;

-- Identity, owned by this database rather than GoTrue. Phase 2's AuthModule
-- writes here. Columns are the subset the existing FKs and triggers rely on.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The load-bearing shim. 124 call sites across 19 migrations depend on this.
--
-- Supabase derives the caller from the request JWT. Here the backend sets the
-- same GUC per transaction (SET LOCAL request.jwt.claims), which is exactly why
-- Phase 1 built PrismaService on the pg driver adapter rather than Prisma's
-- managed connection. Returns NULL when unset, so a policy denies rather than
-- matching everything.
create or replace function auth.uid()
returns uuid
language plpgsql
stable
as $$
declare
  raw text;
begin
  raw := current_setting('request.jwt.claims', true);
  if raw is null or raw = '' then
    return null;
  end if;
  -- Defensive on purpose. current_setting returns an empty string once a
  -- SET LOCAL has been rolled back, and ''::jsonb raises rather than returning
  -- null. Left unguarded, any query touching an RLS policy outside a claims
  -- transaction would ERROR instead of simply denying — turning a missing
  -- caller into a 500 rather than a 403.
  begin
    return nullif(raw::jsonb ->> 'sub', '')::uuid;
  exception
    when others then
      return null;
  end;
end;
$$;

create or replace function auth.role()
returns text
language plpgsql
stable
as $$
declare
  raw text;
begin
  raw := current_setting('request.jwt.claims', true);
  if raw is null or raw = '' then
    return 'authenticated';
  end if;
  begin
    return coalesce(nullif(raw::jsonb ->> 'role', ''), 'authenticated');
  exception
    when others then
      return 'authenticated';
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- storage schema
-- ---------------------------------------------------------------------------
-- Present only so the 21 storage.objects policies in two migrations can be
-- created. Files themselves are not stored here — that is StorageProvider's
-- job, and the authorization those policies express moves into the files
-- module before a signed URL is issued.
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', false),
  ('tutor-documents', 'tutor-documents', false),
  ('learning-resources', 'learning-resources', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- storage helpers
-- ---------------------------------------------------------------------------
-- Supabase's path helper, used by four storage policies as
-- `(storage.foldername(name))[1]`. Returns the folder segments of an object
-- key, excluding the filename — so 'submissions/<uuid>/essay.pdf' yields
-- {submissions,<uuid>}.
create or replace function storage.foldername(name text)
returns text[]
language plpgsql
immutable
as $$
declare
  parts text[];
begin
  parts := string_to_array(name, '/');
  return parts[1 : array_length(parts, 1) - 1];
end;
$$;
