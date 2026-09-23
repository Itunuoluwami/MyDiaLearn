-- Backend-owned authentication tables.
--
-- Additive only: nothing here alters or drops an object created by
-- supabase/migrations. These are the pieces GoTrue provided for free and which
-- NestJS must now own — refresh-token storage with rotation, single-use
-- verification and reset tokens, and the counters behind account lockout.
--
-- Idempotent. Safe to re-run.

-- ---------------------------------------------------------------------------
-- auth.users — columns GoTrue had and the compat table did not
-- ---------------------------------------------------------------------------
alter table auth.users
  add column if not exists last_sign_in_at    timestamptz,
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists locked_until       timestamptz,
  add column if not exists password_changed_at timestamptz;

-- Email is the login identifier and must be unique case-insensitively.
-- Addresses are normalised to lowercase before insert, so a plain unique index
-- would let "Ada@x.com" and "ada@x.com" coexist.
create unique index if not exists users_email_lower_key
  on auth.users (lower(email));

-- ---------------------------------------------------------------------------
-- auth.refresh_tokens
-- ---------------------------------------------------------------------------
-- Rotation with reuse detection.
--
-- Every refresh issues a new token and revokes the one presented, both tagged
-- with a shared `family_id`. Presenting an already-revoked token means it was
-- captured and replayed, so the entire family is revoked at once and the
-- session dies — the legitimate holder is logged out too, which is the point.
--
-- Only a SHA-256 hash is stored. A leaked database must not hand over usable
-- sessions, and the raw token is never needed again after issuance.
create table if not exists auth.refresh_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  token_hash   text not null unique,
  family_id    uuid not null,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  revoked_reason text,
  replaced_by  uuid references auth.refresh_tokens(id) on delete set null,
  user_agent   text,
  ip           text,
  created_at   timestamptz not null default now()
);

create index if not exists refresh_tokens_user_idx   on auth.refresh_tokens (user_id);
create index if not exists refresh_tokens_family_idx on auth.refresh_tokens (family_id);
create index if not exists refresh_tokens_expiry_idx on auth.refresh_tokens (expires_at)
  where revoked_at is null;

-- ---------------------------------------------------------------------------
-- auth.verification_tokens
-- ---------------------------------------------------------------------------
-- One table for both email verification and password reset, distinguished by
-- `purpose`. They have identical mechanics — single use, short lived, hashed —
-- and splitting them would duplicate the consume-and-expire logic that is the
-- only part worth getting right.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_purpose') then
    create type auth.verification_purpose as enum ('email_verification', 'password_reset');
  end if;
end
$$;

create table if not exists auth.verification_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  purpose     auth.verification_purpose not null,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists verification_tokens_user_purpose_idx
  on auth.verification_tokens (user_id, purpose)
  where consumed_at is null;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- The application connects as the owning role, so these are a no-op today.
-- They are written out so that introducing a least-privilege application role
-- later is a grant, not an archaeology exercise.
grant usage on schema auth to public;
