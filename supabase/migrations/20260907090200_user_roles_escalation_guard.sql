-- Close the privilege-escalation path on public.user_roles.
--
-- Before this migration the only write guard was
--   user_roles_admin_write ... using (is_admin()) with check (is_admin())
-- so any admin could grant the admin role to any account including their own,
-- and strip it from every other admin, with no approval and no record.
--
-- Note what actually stopped that in practice: user_roles was never granted
-- anything but SELECT to authenticated (20260826121230:39), so the policy was
-- moot and useUpdateUserRoles() in src/lib/admin-data.ts has been failing with
-- 42501 all along. The hole was latent, not live. It becomes live the moment
-- anyone issues that grant, so it is fixed properly here rather than left to
-- an accident of privileges.
--
-- Three rules. RLS can express the first two; it cannot express the third,
-- because a DELETE policy sees only the row being removed and cannot count what
-- would remain. So the trigger carries all three — it also covers writers that
-- bypass RLS entirely (security definer RPCs and service_role), which is
-- exactly where the last-super-admin rule needs to bite.
--
--   1. granting or revoking admin/super_admin requires is_super_admin()
--   2. nobody may grant themselves a role
--   3. the last remaining super_admin cannot be demoted or deleted
--
-- The table privilege is deliberately NOT granted here. Every role write goes
-- through admin_set_user_roles() or the maker-checker request path, both added
-- in 20260907090700_admin_maker_checker.sql. The policies below are defence in
-- depth for the day someone issues that grant.

drop policy if exists "user_roles_admin_write" on public.user_roles;

-- user_roles.role resolves to OLD in `using` and NEW in `with check`. That is
-- what makes the UPDATE pair correct: a plain admin can neither touch an
-- existing elevated row nor promote a row into an elevated role.
create policy "user_roles_admin_insert" on public.user_roles for insert to authenticated
  with check (
    user_roles.user_id <> auth.uid()
    and case
      when user_roles.role in ('admin', 'super_admin') then public.is_super_admin()
      else public.is_admin()
    end
  );

create policy "user_roles_admin_update" on public.user_roles for update to authenticated
  using (
    user_roles.user_id <> auth.uid()
    and case
      when user_roles.role in ('admin', 'super_admin') then public.is_super_admin()
      else public.is_admin()
    end
  )
  with check (
    user_roles.user_id <> auth.uid()
    and case
      when user_roles.role in ('admin', 'super_admin') then public.is_super_admin()
      else public.is_admin()
    end
  );

-- No user_id <> auth.uid() here on purpose: stepping DOWN from a role is safe
-- and useful. Rule 3 in the trigger is what stops the last super admin doing it.
create policy "user_roles_admin_delete" on public.user_roles for delete to authenticated
  using (
    case
      when user_roles.role in ('admin', 'super_admin') then public.is_super_admin()
      else public.is_admin()
    end
  );

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
begin
  if tg_op = 'DELETE' then
    v_target := old.user_id;
    v_role := old.role;
  else
    v_target := new.user_id;
    v_role := new.role;
  end if;

  -- auth.uid() is null for migrations, the SQL editor, service_role calls and
  -- the GoTrue-owned handle_new_user() path. Those are trusted contexts for the
  -- escalation rules — but NOT for the last-super-admin rule below.
  if auth.uid() is not null then
    -- Scoped to elevated roles on purpose. handle_new_user() self-grants the
    -- signup role, and if auth.uid() is ever populated when that trigger fires
    -- an unscoped rule here would reject every registration on the platform.
    -- Self-granting student/parent/tutor/agency is harmless; escalation is
    -- entirely about admin and super_admin.
    if tg_op = 'INSERT'
       and v_target = auth.uid()
       and v_role in ('admin', 'super_admin') then
      raise exception 'SELF_ROLE_GRANT_FORBIDDEN';
    end if;

    if v_role in ('admin', 'super_admin') and not public.is_super_admin() then
      raise exception 'ELEVATED_ROLE_REQUIRES_SUPER_ADMIN';
    end if;

    if tg_op = 'UPDATE'
       and old.role in ('admin', 'super_admin')
       and not public.is_super_admin() then
      raise exception 'ELEVATED_ROLE_REQUIRES_SUPER_ADMIN';
    end if;
  end if;

  -- Applies to EVERY writer, service_role included: losing the last super admin
  -- is unrecoverable without a direct psql session.
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

drop trigger if exists user_roles_guard on public.user_roles;
create trigger user_roles_guard
  before insert or update or delete on public.user_roles
  for each row execute function public.enforce_user_role_guards();
