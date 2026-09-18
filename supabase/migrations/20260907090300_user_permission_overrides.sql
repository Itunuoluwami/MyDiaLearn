-- Per-admin permission overrides.
--
-- public.role_permissions maps a permission to a ROLE, never to a user, and it
-- is populated only by migration seeds — no screen edits it. The consequence is
-- that every admin holds the identical fixed bundle, so there is no way to make
-- a payouts-only admin, a read-only auditor, or a moderator who cannot touch
-- money. This adds the missing user dimension.
--
-- Precedence, highest first:
--   1. super_admin  -> holds everything, implicitly
--   2. explicit user deny   (user_permissions.granted = false)
--   3. explicit user grant  (user_permissions.granted = true)
--   4. role grant           (role_permissions)
--
-- has_permission() keeps its exact signature, so none of its existing callers
-- change, and create or replace preserves the ACL granted in 20260826121256.
-- With no user_permissions rows and no super admin it returns precisely what it
-- returned before — the change is a strict extension.
--
-- Why is it still `sql stable security definer`: security definer is what stops
-- policy recursion (it executes as the owner, for whom RLS is not enforced, so
-- reading user_roles from inside a user_roles policy does not re-evaluate that
-- policy). Keeping it `sql` keeps it inlinable and usable in RLS. All four
-- branches are index-backed — user_roles UNIQUE(user_id, role),
-- user_permissions UNIQUE(user_id, permission_key), role_permissions
-- UNIQUE(role, permission_key) — and the case short-circuits, so no branch ever
-- sequential-scans.

create table public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  granted boolean not null default true,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, permission_key)
);

create index user_permissions_user_id_idx on public.user_permissions (user_id);

grant select on public.user_permissions to authenticated;
grant all on public.user_permissions to service_role;

alter table public.user_permissions enable row level security;

-- No updated_at column, so no user_permissions_updated_at trigger.

create policy "user_permissions_select_own" on public.user_permissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "user_permissions_super_admin_write" on public.user_permissions for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create or replace function public.has_permission(_user_id uuid, _permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.user_roles ur
      where ur.user_id = _user_id and ur.role = 'super_admin'
    ) then true
    when exists (
      select 1 from public.user_permissions up
      where up.user_id = _user_id and up.permission_key = _permission and not up.granted
    ) then false
    when exists (
      select 1 from public.user_permissions up
      where up.user_id = _user_id and up.permission_key = _permission and up.granted
    ) then true
    else exists (
      select 1 from public.user_roles ur
      join public.role_permissions rp on rp.role = ur.role
      where ur.user_id = _user_id and rp.permission_key = _permission
    )
  end;
$$;

-- Resolves the caller's whole permission set server-side in one round trip.
-- src/hooks/use-auth.tsx computed this in the browser by reading
-- role_permissions directly, which cannot see user-level overrides and cannot
-- know that super admins hold everything.
create or replace function public.my_permissions()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then array[]::text[]
    when exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    ) then (
      select coalesce(array_agg(p.key order by p.key), array[]::text[])
      from public.permissions p
    )
    else (
      select coalesce(array_agg(g.k order by g.k), array[]::text[])
      from (
        select rp.permission_key as k
        from public.user_roles ur
        join public.role_permissions rp on rp.role = ur.role
        where ur.user_id = auth.uid()
        union
        select up.permission_key
        from public.user_permissions up
        where up.user_id = auth.uid() and up.granted
      ) g
      where not exists (
        select 1 from public.user_permissions d
        where d.user_id = auth.uid()
          and d.permission_key = g.k
          and not d.granted
      )
    )
  end;
$$;

revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated, service_role;

-- Grant or revoke a single permission for one admin. Super admin only; the
-- table policy says the same thing, but routing through an RPC is what lets the
-- change be audited with an actor and a reason.
create or replace function public.admin_set_user_permission(
  p_user_id uuid,
  p_permission_key text,
  p_granted boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if not exists (select 1 from public.permissions where key = p_permission_key) then
    raise exception 'UNKNOWN_PERMISSION_KEY';
  end if;

  if p_granted is null then
    -- null clears the override and falls back to the role grant
    delete from public.user_permissions
    where user_id = p_user_id and permission_key = p_permission_key;
  else
    insert into public.user_permissions (user_id, permission_key, granted, granted_by)
    values (p_user_id, p_permission_key, p_granted, auth.uid())
    on conflict (user_id, permission_key)
      do update set granted = excluded.granted, granted_by = excluded.granted_by;
  end if;
end;
$$;

revoke all on function public.admin_set_user_permission(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_user_permission(uuid, text, boolean) to authenticated;
