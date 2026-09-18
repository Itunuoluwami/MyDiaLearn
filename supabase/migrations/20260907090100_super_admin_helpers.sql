-- Super admin tier, step 2 of 2: helpers, seeds and the bootstrap grant.
--
-- Until now public.app_role topped out at 'admin' and public.is_admin() was a
-- single flat boolean, so there was no capability a super admin could hold that
-- an admin could not — nothing for the tier to mean. This migration gives it
-- meaning and, critically, does so WITHOUT touching a single existing policy.
--
-- The mechanism is that is_admin() is WIDENED rather than replaced: it now
-- returns true for role in ('admin','super_admin'). Every admin gate in the
-- schema is written against is_admin() — payments_admin_write,
-- settings_admin_write, messages_admin_moderate, disputes_admin_write,
-- "Admins manage payouts", and the guards inside admin_cancel_booking(),
-- admin_resolve_dispute(), admin_dashboard_summary(), admin_report_summary()
-- and enforce_admin_only_hourly_rate(). Widening makes super admins inherit all
-- of it as a strict superset. Narrowing or replacing it would lock a
-- super-admin-only account out of the entire portal.
--
-- create or replace preserves a function's ACL, so the
-- `grant execute ... to authenticated, service_role` that 20260826121256 issued
-- for is_admin() survives and must not be re-issued.
--
-- Out of scope here: the escalation guard on user_roles (next migration) and
-- per-user permission overrides (the one after).

-- ============ permissions ============

insert into public.permissions (key, label, description, category) values
  ('admin.audit', 'View audit log', 'Read the immutable admin action audit trail', 'admin'),
  ('admin.approvals', 'Review admin approvals', 'Approve or reject pending admin actions', 'admin'),
  ('admin.admins', 'Manage admins', 'Invite admins and assign their roles and permissions', 'admin')
on conflict (key) do nothing;

-- super_admin holds every permission implicitly through has_permission() and
-- my_permissions() once the next migrations land, but the role_permissions rows
-- are seeded anyway so a super admin is never permission-less in the window
-- before the client switches to my_permissions().
insert into public.role_permissions (role, permission_key)
select 'super_admin'::public.app_role, p.key
from public.permissions p
where p.category = 'admin'
on conflict (role, permission_key) do nothing;

insert into public.role_permissions (role, permission_key) values
  ('admin', 'admin.approvals')
on conflict (role, permission_key) do nothing;

-- admin.audit and admin.admins are deliberately NOT granted to the plain
-- 'admin' role. They are the first permissions meant to be handed out
-- per-person through user_permissions.

-- ============ helpers ============

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- ============ signup hardening ============

-- Unchanged except for the downgrade line, which now covers 'super_admin' as
-- well as 'admin'. Re-emitted in full because create or replace needs the whole
-- body; its `revoke all ... from public, anon, authenticated` (20260826121256)
-- is preserved.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role public.app_role;
begin
  begin
    _role := coalesce(new.raw_user_meta_data ->> 'role', 'student')::public.app_role;
  exception when others then
    _role := 'student';
  end;

  -- Nobody may mint themselves an elevated role at signup. Admin access is
  -- granted only by admin_invite_redeem() or an approved role request.
  if _role in ('admin', 'super_admin') then
    _role := 'student';
  end if;

  insert into public.profiles (id, email, full_name, phone, country_code, timezone, primary_role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'country_code', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC'),
    _role
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, _role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

-- ============ bootstrap ============

-- The first super admin. This must run BEFORE the next migration installs the
-- escalation guard, because the guard requires an existing super admin to
-- authorise any elevated grant — with none, the tier would be unreachable.
--
-- This is a one-time bootstrap, not a hardcoded identity: once this account
-- holds super_admin it can grant the tier to anyone else and revoke its own
-- from the Admins screen. The only floor is that enforce_user_role_guards()
-- refuses to remove the last remaining super admin.
--
-- No-op when the account does not exist yet (fresh database, or the address
-- has not signed up): re-run this statement, or grant from the SQL editor.
insert into public.user_roles (user_id, role)
select u.id, 'super_admin'::public.app_role
from auth.users u
where lower(u.email) = 'adebisiadetutu99@gmail.com'
on conflict (user_id, role) do nothing;

update public.profiles p
set primary_role = 'super_admin'
from auth.users u
where u.id = p.id
  and lower(u.email) = 'adebisiadetutu99@gmail.com'
  and p.primary_role <> 'super_admin';
