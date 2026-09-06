-- Admin Portal Phase 4A: dispute resolution.
--
-- No dispute concept existed anywhere in the schema before this — the
-- Phase 1 dashboard explicitly labeled dispute_rate "available once dispute
-- tracking ships" rather than faking a number. This migration ships it:
-- a disputes table, an intake RPC any party to a booking can call, admin
-- resolution, and a real dispute_rate in admin_dashboard_summary().
--
-- Scope note: this adds the table and the admin-side resolution workflow.
-- No "Report an issue" button is added to the Parent/Student/Tutor portals
-- in this pass — raise_dispute() is safely callable by any authenticated
-- party to a booking, but nothing in those portals' UI calls it yet, so the
-- admin queue starts empty until that follow-up UI ships or a dispute is
-- raised via the RPC directly.

insert into public.permissions (key, label, description, category) values
  ('admin.disputes', 'Resolve disputes', 'Review and resolve disputes raised between users', 'admin');

insert into public.role_permissions (role, permission_key) values
  ('admin', 'admin.disputes');

create type public.dispute_status as enum ('open', 'investigating', 'resolved', 'dismissed');
create type public.dispute_category as enum ('payment', 'conduct', 'quality', 'scheduling', 'other');

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  raised_by uuid references public.profiles(id) on delete set null,
  against_profile_id uuid references public.profiles(id) on delete set null,
  category public.dispute_category not null default 'other',
  status public.dispute_status not null default 'open',
  description text not null,
  resolution_notes text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index disputes_status_idx on public.disputes (status);
create index disputes_booking_id_idx on public.disputes (booking_id);

grant select, update on public.disputes to authenticated;
grant all on public.disputes to service_role;

alter table public.disputes enable row level security;

create trigger disputes_updated_at before update on public.disputes
  for each row execute function public.set_updated_at();

create policy "disputes_involved_read" on public.disputes for select to authenticated
  using (public.is_admin() or raised_by = auth.uid() or against_profile_id = auth.uid());

create policy "disputes_admin_write" on public.disputes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Creation only goes through this RPC (security definer), not a direct
-- insert policy, so every dispute is validated against a real booking the
-- caller is actually party to — the same shape as ensure_tutor_record() /
-- tutor_request_payout() gating writes through a function.
create or replace function public.raise_dispute(
  p_booking_id uuid,
  p_category public.dispute_category,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  v_against uuid;
  v_id uuid;
begin
  if p_description is null or length(trim(p_description)) = 0 then
    raise exception 'DESCRIPTION_REQUIRED';
  end if;

  select bk.*, s.parent_id as student_parent_id, s.profile_id as student_profile_id, t.profile_id as tutor_profile_id
  into b
  from public.bookings bk
  left join public.students s on s.id = bk.student_id
  left join public.tutors t on t.id = bk.tutor_id
  where bk.id = p_booking_id;

  if b is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if auth.uid() not in (
    coalesce(b.booked_by, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(b.student_profile_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(b.student_parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(b.tutor_profile_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) and not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  v_against := case when auth.uid() = b.tutor_profile_id then coalesce(b.student_profile_id, b.booked_by) else b.tutor_profile_id end;

  insert into public.disputes (booking_id, raised_by, against_profile_id, category, description)
  values (p_booking_id, auth.uid(), v_against, p_category, trim(p_description))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.raise_dispute(uuid, public.dispute_category, text) from public, anon;
grant execute on function public.raise_dispute(uuid, public.dispute_category, text) to authenticated;

create or replace function public.admin_resolve_dispute(
  p_dispute_id uuid,
  p_status public.dispute_status,
  p_resolution_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_status not in ('resolved', 'dismissed', 'investigating') then
    raise exception 'INVALID_STATUS';
  end if;

  update public.disputes
  set status = p_status,
      resolution_notes = coalesce(p_resolution_notes, resolution_notes),
      resolved_by = case when p_status in ('resolved', 'dismissed') then auth.uid() else resolved_by end,
      resolved_at = case when p_status in ('resolved', 'dismissed') then now() else resolved_at end
  where id = p_dispute_id;
end;
$$;

revoke all on function public.admin_resolve_dispute(uuid, public.dispute_status, text) from public, anon;
grant execute on function public.admin_resolve_dispute(uuid, public.dispute_status, text) to authenticated;

-- Wire the real dispute_rate into the dashboard now that the table exists,
-- keeping every other column identical to the Phase 1 definition.
create or replace function public.admin_dashboard_summary()
returns table (
  new_students bigint,
  new_parents bigint,
  new_tutors bigint,
  tutor_activation_rate numeric,
  booking_demand bigint,
  gmv numeric,
  gmv_currency text,
  commission_revenue numeric,
  avg_transaction_value numeric,
  classes_per_student numeric,
  repeat_booking_rate numeric,
  mau bigint,
  avg_tutor_rating numeric,
  cancellation_rate numeric,
  no_show_rate numeric,
  dispute_rate numeric
)
language plpgsql
stable security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return;
  end if;

  return query
  with w as (
    select now() - interval '30 days' as since
  ),
  active_profiles as (
    select b.booked_by as profile_id
      from public.bookings b, w
      where b.created_at >= w.since
    union
    select t.profile_id
      from public.bookings b
      join public.tutors t on t.id = b.tutor_id, w
      where b.created_at >= w.since
    union
    select p.payer_id as profile_id
      from public.payments p, w
      where p.created_at >= w.since
  ),
  completed_by_student as (
    select student_id, count(*) as n
    from public.bookings
    where status = 'completed'
    group by student_id
  ),
  paid as (
    select * from public.payments where status = 'paid'
  )
  select
    (select count(*) from public.profiles pr, w
       where pr.primary_role = 'student' and pr.created_at >= w.since),
    (select count(*) from public.profiles pr, w
       where pr.primary_role = 'parent' and pr.created_at >= w.since),
    (select count(*) from public.profiles pr, w
       where pr.primary_role = 'tutor' and pr.created_at >= w.since),
    (select case when count(*) = 0 then null
            else round(100.0 * count(*) filter (where verification_status = 'verified' and is_listed) / count(*), 1)
            end
       from public.tutors),
    (select count(*) from public.bookings b, w where b.created_at >= w.since),
    (select coalesce(sum(amount), 0) from paid),
    (select currency from paid order by paid_at desc nulls last limit 1),
    (select coalesce(sum(commission_amount), 0) from paid),
    (select case when count(*) = 0 then 0 else round(avg(amount), 2) end from paid),
    (select case when count(distinct student_id) = 0 then 0
            else round(count(*) filter (where status = 'completed')::numeric / count(distinct student_id), 2)
            end
       from public.bookings),
    (select case when count(*) = 0 then null
            else round(100.0 * count(*) filter (where n > 1) / count(*), 1)
            end
       from completed_by_student),
    (select count(*) from active_profiles),
    (select round(avg(score), 2) from public.ratings where is_published),
    (select case when count(*) = 0 then null
            else round(100.0 * count(*) filter (where status = 'cancelled') / count(*), 1)
            end
       from public.bookings),
    (select case when count(*) = 0 then null
            else round(100.0 * count(*) filter (where status = 'no_show') / count(*), 1)
            end
       from public.bookings),
    (select case when (select count(*) from public.bookings) = 0 then null
            else round(100.0 * (select count(*) from public.disputes) / (select count(*) from public.bookings), 1)
            end);
end;
$$;
