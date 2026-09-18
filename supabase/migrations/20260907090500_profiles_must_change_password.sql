-- Force a password change on first login, and lock down the privileged columns
-- of public.profiles.
--
-- Two things happen here.
--
-- 1. must_change_password. An invited admin arrives with a credential someone
--    else generated, so the app must refuse to let them work until they have
--    replaced it. admin_invite_redeem() sets this; the admin route guard
--    redirects on it; clear_must_change_password() clears it after
--    supabase.auth.updateUser({ password }) succeeds.
--
-- 2. Column-level UPDATE grants. profiles has had blanket
--    `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated` since the first
--    migration, and profiles_update_own lets a user write their own row — which
--    means a user could set their own must_change_password to false, or an
--    admin could flip is_active outside the approval path. RLS is row-level and
--    cannot express "not this column", so the fix is a column grant.
--
--    Column grants bind only `authenticated`. security definer RPCs run as the
--    owner and service_role is unaffected, so admin_invite_redeem() and the
--    maker-checker dispatcher keep writing the locked columns normally.
--
--    Every column the app actually writes stays writable — grep-confirmed
--    against settings.tsx, account.tsx, tutor.settings.tsx and
--    tutor.onboarding.tsx, which between them write full_name, phone,
--    country_code, preferred_currency, timezone and onboarding_completed.
--    updated_at is assigned by the profiles_updated_at BEFORE trigger, which is
--    not subject to the caller's column privileges.

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- Metadata-only on PG11+ — no table rewrite.

revoke update on public.profiles from authenticated;

grant update (
  email,
  full_name,
  phone,
  avatar_url,
  country_code,
  timezone,
  preferred_currency,
  onboarding_completed
) on public.profiles to authenticated;

-- Deliberately excluded: id, primary_role, is_active, must_change_password,
-- created_at, updated_at.

create or replace function public.clear_must_change_password()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  update public.profiles
  set must_change_password = false
  where id = auth.uid();

  perform public.log_audit(
    'profile.password_changed',
    'profiles',
    auth.uid(),
    null,
    null,
    '{}'::jsonb
  );
end;
$$;

revoke all on function public.clear_must_change_password() from public, anon;
grant execute on function public.clear_must_change_password() to authenticated;
