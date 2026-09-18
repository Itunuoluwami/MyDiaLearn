-- Admin invitations: work-email allowlist plus a hashed one-time password.
--
-- There was no way to onboard an admin except editing the database by hand.
-- This adds the invitation record, the domain allowlist and the two RPCs that
-- bracket the flow. The one step that cannot live in SQL is creating the
-- auth.users row — writing auth.users from a public definer function bypasses
-- GoTrue's password hashing and auth.identities bookkeeping and is unsupported.
-- That step runs in src/lib/admin-invite.functions.ts against the service-role
-- key, between the two RPCs here.
--
-- Full flow:
--   1. server fn calls admin_invite_create() with the CALLER's JWT, so
--      is_super_admin() still gates it. It returns the plaintext OTP exactly
--      once and stores only a bcrypt hash.
--   2. server fn calls auth.admin.inviteUserByEmail() with the OTP in user
--      metadata so the Supabase invite template can render it, then immediately
--      scrubs that metadata key.
--   3. invitee follows the emailed link, lands on /auth/accept-invite with a
--      session, and submits the OTP plus a new password.
--   4. admin_invite_redeem() verifies the hash and expiry, grants the role and
--      the chosen permissions, and sets must_change_password.
--
-- Security notes:
--
-- * pgcrypto lives in the `extensions` schema on Supabase and every function
--   here pins search_path = public, so crypt/gen_salt/gen_random_bytes must be
--   schema-qualified. gen_random_uuid() is core in PG13+ and stays unqualified,
--   matching the existing migrations.
-- * The OTP uses extensions.gen_random_bytes(), not random(). random() is a
--   seeded PRNG and a code drawn from it is predictable.
-- * otp_hash is excluded from the SELECT grant. RLS is row-level and cannot
--   hide a column, so a column grant is the only way to keep the hash out of
--   the API even from a super admin.
-- * email is lower-cased text with a check constraint rather than citext —
--   profiles.email is plain text throughout this schema and citext would be one
--   more extension for the same guarantee.

-- Supabase pre-installs pgcrypto in the extensions schema; this is a safety net
-- for a local `supabase db reset` against a bare Postgres image.
create extension if not exists pgcrypto with schema extensions;

create type public.admin_invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  role public.app_role not null default 'admin',
  permission_keys text[] not null default '{}'::text[],
  otp_hash text not null,
  otp_expires_at timestamptz not null,
  status public.admin_invitation_status not null default 'pending',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_invitations_email_lower check (email = lower(email)),
  constraint admin_invitations_role_elevated check (role in ('admin', 'super_admin'))
);

create index admin_invitations_email_idx on public.admin_invitations (email);
create index admin_invitations_status_idx on public.admin_invitations (status);
create unique index admin_invitations_pending_email_idx
  on public.admin_invitations (email) where status = 'pending';

grant select (
  id, email, invited_by, role, permission_keys, otp_expires_at,
  status, accepted_at, created_at, updated_at
) on public.admin_invitations to authenticated;
grant all on public.admin_invitations to service_role;

alter table public.admin_invitations enable row level security;

create trigger admin_invitations_updated_at before update on public.admin_invitations
  for each row execute function public.set_updated_at();

-- No write policy: every write goes through the definer RPCs below.
create policy "admin_invitations_super_admin_read" on public.admin_invitations for select to authenticated
  using (public.is_super_admin());

drop trigger if exists admin_invitations_audit on public.admin_invitations;
create trigger admin_invitations_audit
  after insert or update on public.admin_invitations
  for each row execute function public.audit_row_change();

insert into public.platform_settings (key, value, label, description, group_name, is_public) values
  ('admin.invite_email_domains', '[]'::jsonb, 'Admin invite domains',
   'Work email domains a super admin may invite new admins from. Empty blocks all invitations.',
   'admin', false)
on conflict (key) do nothing;

-- ============ create ============

create or replace function public.admin_invite_create(
  p_email text,
  p_role public.app_role default 'admin',
  p_permission_keys text[] default '{}'::text[],
  p_ttl_minutes integer default 4320
)
returns table (
  invitation_id uuid,
  otp text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_domain text;
  v_allowed jsonb;
  v_otp text;
  v_ttl integer := greatest(5, least(20160, coalesce(p_ttl_minutes, 4320)));
  v_id uuid;
  v_expires timestamptz;
begin
  if not public.is_super_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  if p_role not in ('admin', 'super_admin') then
    raise exception 'INVALID_ROLE';
  end if;

  v_domain := split_part(v_email, '@', 2);

  select ps.value into v_allowed
  from public.platform_settings ps
  where ps.key = 'admin.invite_email_domains';

  if v_allowed is null or jsonb_typeof(v_allowed) <> 'array' or jsonb_array_length(v_allowed) = 0 then
    raise exception 'INVITE_DOMAIN_ALLOWLIST_EMPTY';
  end if;

  if not exists (
    select 1 from jsonb_array_elements_text(v_allowed) d(domain)
    where lower(btrim(d.domain)) = v_domain
  ) then
    raise exception 'EMAIL_DOMAIN_NOT_ALLOWED';
  end if;

  if exists (
    select 1 from unnest(coalesce(p_permission_keys, '{}'::text[])) k
    where k not in (select pm.key from public.permissions pm)
  ) then
    raise exception 'UNKNOWN_PERMISSION_KEY';
  end if;

  -- One live invitation per address. This must run before the insert or the
  -- partial unique index rejects a re-invite.
  update public.admin_invitations
  set status = 'revoked'
  where email = v_email and status = 'pending';

  v_otp := upper(encode(extensions.gen_random_bytes(5), 'hex'));
  v_expires := now() + make_interval(mins => v_ttl);

  insert into public.admin_invitations (
    email, invited_by, role, permission_keys, otp_hash, otp_expires_at
  ) values (
    v_email,
    auth.uid(),
    p_role,
    coalesce(p_permission_keys, '{}'::text[]),
    extensions.crypt(v_otp, extensions.gen_salt('bf', 10)),
    v_expires
  )
  returning id into v_id;

  perform public.log_audit(
    'admin_invitation.create',
    'admin_invitations',
    v_id,
    null,
    jsonb_build_object('email', v_email, 'role', p_role, 'permission_keys', p_permission_keys),
    jsonb_build_object('ttl_minutes', v_ttl)
  );

  invitation_id := v_id;
  otp := v_otp;
  expires_at := v_expires;
  return next;
end;
$$;

revoke all on function public.admin_invite_create(text, public.app_role, text[], integer) from public, anon;
grant execute on function public.admin_invite_create(text, public.app_role, text[], integer) to authenticated;

-- ============ revoke ============

create or replace function public.admin_invite_revoke(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.admin_invitations
  set status = 'revoked'
  where id = p_invitation_id and status = 'pending';

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;
end;
$$;

revoke all on function public.admin_invite_revoke(uuid) from public, anon;
grant execute on function public.admin_invite_revoke(uuid) to authenticated;

-- ============ redeem ============

create or replace function public.admin_invite_redeem(p_email text, p_otp text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_uid uuid := auth.uid();
  inv public.admin_invitations;
  k text;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- The redeemer must be signed in as the invited address.
  if lower(coalesce((select pr.email from public.profiles pr where pr.id = v_uid), '')) <> v_email then
    raise exception 'EMAIL_MISMATCH';
  end if;

  select * into inv
  from public.admin_invitations
  where email = v_email and status = 'pending'
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  if inv.otp_expires_at < now() then
    update public.admin_invitations set status = 'expired' where id = inv.id;
    raise exception 'INVITATION_EXPIRED';
  end if;

  if inv.otp_hash is distinct from extensions.crypt(coalesce(p_otp, ''), inv.otp_hash) then
    raise exception 'INVALID_OTP';
  end if;

  -- ORDER MATTERS. Mark accepted BEFORE granting the role: the user_roles guard
  -- trigger looks for exactly this row to permit the one legitimate self-grant
  -- of an elevated role. Insert the role first and the trigger raises
  -- SELF_ROLE_GRANT_FORBIDDEN.
  update public.admin_invitations
  set status = 'accepted', accepted_at = now()
  where id = inv.id;

  insert into public.user_roles (user_id, role)
  values (v_uid, inv.role)
  on conflict (user_id, role) do nothing;

  update public.profiles
  set primary_role = inv.role,
      is_active = true,
      must_change_password = true
  where id = v_uid;

  foreach k in array coalesce(inv.permission_keys, '{}'::text[]) loop
    insert into public.user_permissions (user_id, permission_key, granted, granted_by)
    values (v_uid, k, true, inv.invited_by)
    on conflict (user_id, permission_key) do update set granted = true;
  end loop;

  perform public.log_audit(
    'admin_invitation.redeem',
    'admin_invitations',
    inv.id,
    null,
    jsonb_build_object('user_id', v_uid, 'role', inv.role, 'permission_keys', inv.permission_keys),
    '{}'::jsonb
  );

  return inv.id;
end;
$$;

revoke all on function public.admin_invite_redeem(text, text) from public, anon;
grant execute on function public.admin_invite_redeem(text, text) to authenticated;

-- ============ guard trigger, invitation-aware ============

-- Re-emitted now that admin_invitations exists. The v_invited clause is the
-- single exemption to the self-grant and super-admin-required rules: a verified
-- invitation redeemed in the last minute. Nothing else can produce that row —
-- authenticated has no INSERT or UPDATE privilege on admin_invitations at all,
-- and the only writer is a definer RPC that checks the bcrypt OTP first.
create or replace function public.enforce_user_role_guards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target uuid;
  v_role public.app_role;
  v_remaining integer;
  v_invited boolean := false;
begin
  if tg_op = 'DELETE' then
    v_target := old.user_id;
    v_role := old.role;
  else
    v_target := new.user_id;
    v_role := new.role;
  end if;

  if auth.uid() is not null then
    if tg_op in ('INSERT', 'UPDATE') and v_role in ('admin', 'super_admin') then
      v_invited := exists (
        select 1
        from public.admin_invitations ai
        join public.profiles p on lower(p.email) = ai.email
        where p.id = v_target
          and ai.role = v_role
          and ai.status = 'accepted'
          and ai.accepted_at >= now() - interval '1 minute'
      );
    end if;

    -- Scoped to elevated roles on purpose. handle_new_user() self-grants the
    -- signup role, and if auth.uid() is ever populated when that trigger fires
    -- an unscoped rule here would reject every registration on the platform.
    if tg_op = 'INSERT'
       and v_target = auth.uid()
       and v_role in ('admin', 'super_admin')
       and not v_invited then
      raise exception 'SELF_ROLE_GRANT_FORBIDDEN';
    end if;

    if v_role in ('admin', 'super_admin')
       and not public.is_super_admin()
       and not v_invited then
      raise exception 'ELEVATED_ROLE_REQUIRES_SUPER_ADMIN';
    end if;

    if tg_op = 'UPDATE'
       and old.role in ('admin', 'super_admin')
       and not public.is_super_admin()
       and not v_invited then
      raise exception 'ELEVATED_ROLE_REQUIRES_SUPER_ADMIN';
    end if;
  end if;

  -- Applies to EVERY writer, service_role included.
  if (tg_op = 'DELETE' and old.role = 'super_admin')
     or (tg_op = 'UPDATE' and old.role = 'super_admin' and new.role is distinct from old.role) then
    select count(*) into v_remaining
    from public.user_roles
    where role = 'super_admin' and user_id <> old.user_id;

    if v_remaining = 0 then
      raise exception 'LAST_SUPER_ADMIN_PROTECTED';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_user_role_guards() from public, anon, authenticated;
