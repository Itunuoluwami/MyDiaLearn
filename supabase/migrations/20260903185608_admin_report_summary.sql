-- Admin Portal Phase 3: exportable reports.
-- admin_report_summary(from, to) is a date-range-parameterized sibling of
-- admin_dashboard_summary() — same aggregation shapes, but scoped to a
-- caller-chosen window instead of the dashboard's fixed trailing 30 days,
-- so the Reports page can answer "how did October look" not just "now".

create or replace function public.admin_report_summary(p_from timestamptz, p_to timestamptz)
returns table (
  new_students bigint,
  new_parents bigint,
  new_tutors bigint,
  bookings_count bigint,
  completed_count bigint,
  cancelled_count bigint,
  no_show_count bigint,
  gmv numeric,
  gmv_currency text,
  commission_revenue numeric,
  avg_transaction_value numeric,
  active_users bigint,
  avg_tutor_rating numeric
)
language plpgsql
stable security definer
set search_path = public
as $$
declare
  v_from timestamptz := coalesce(p_from, now() - interval '30 days');
  v_to timestamptz := coalesce(p_to, now());
begin
  if not public.is_admin() then
    return;
  end if;

  return query
  with bk as (
    select * from public.bookings where created_at >= v_from and created_at < v_to
  ),
  paid as (
    select * from public.payments where status = 'paid' and coalesce(paid_at, created_at) >= v_from and coalesce(paid_at, created_at) < v_to
  ),
  active_profiles as (
    select b.booked_by as profile_id from bk
    union
    select t.profile_id from bk join public.tutors t on t.id = bk.tutor_id
    union
    select p.payer_id as profile_id from paid p
  )
  select
    (select count(*) from public.profiles pr where pr.primary_role = 'student' and pr.created_at >= v_from and pr.created_at < v_to),
    (select count(*) from public.profiles pr where pr.primary_role = 'parent' and pr.created_at >= v_from and pr.created_at < v_to),
    (select count(*) from public.profiles pr where pr.primary_role = 'tutor' and pr.created_at >= v_from and pr.created_at < v_to),
    (select count(*) from bk),
    (select count(*) from bk where status = 'completed'),
    (select count(*) from bk where status = 'cancelled'),
    (select count(*) from bk where status = 'no_show'),
    (select coalesce(sum(amount), 0) from paid),
    (select currency from paid order by coalesce(paid_at, created_at) desc limit 1),
    (select coalesce(sum(commission_amount), 0) from paid),
    (select case when count(*) = 0 then 0 else round(avg(amount), 2) end from paid),
    (select count(*) from active_profiles),
    (select round(avg(score), 2) from public.ratings where is_published and created_at >= v_from and created_at < v_to);
end;
$$;

revoke all on function public.admin_report_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_report_summary(timestamptz, timestamptz) to authenticated;
