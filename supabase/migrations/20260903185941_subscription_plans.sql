-- Admin Portal Phase 4C: System configuration — subscription/package tier
-- catalog. Mirrors the subjects/curricula pattern exactly (public read of
-- active rows, admin write) so it's an admin-editable lookup table like the
-- others, ready for a future purchase flow to read from.
--
-- Scope note: this is the plan catalog only — there is no billing/purchase
-- flow anywhere in this codebase for a parent or agency to actually buy a
-- plan, so this table has no consumers yet. It's the same relationship
-- content.hero_video_url or brand.tagline have today: admin-editable,
-- correct, and waiting for a UI to read it. Group class settings (the third
-- item in "System configuration") are a few platform_settings keys, added
-- via the admin Settings page rather than a new table, since it's
-- configuration (on/off, a capacity number) not a new entity.

create type public.billing_interval as enum ('weekly', 'monthly', 'quarterly', 'yearly');

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  billing_interval public.billing_interval not null default 'monthly',
  price numeric(12, 2) not null,
  currency text not null default 'USD',
  lessons_included integer,
  hours_included numeric(6, 2),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.subscription_plans to anon;
grant select, insert, update, delete on public.subscription_plans to authenticated;
grant all on public.subscription_plans to service_role;

alter table public.subscription_plans enable row level security;

create trigger subscription_plans_updated_at before update on public.subscription_plans
  for each row execute function public.set_updated_at();

create policy "subscription_plans_public_read" on public.subscription_plans for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "subscription_plans_admin_write" on public.subscription_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
