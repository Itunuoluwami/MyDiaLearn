-- Admin dashboard KPI summary RPC.
-- Aggregates existing profiles/bookings/payments/tutors/ratings tables — no new
-- tables. Mirrors the shape/style of parent_dashboard_summary() and
-- tutor_dashboard_summary(), but is gated by is_admin() instead of scoped to
-- auth.uid(), since this reads platform-wide figures.
--
-- dispute_rate is returned as null: there is no disputes table yet (planned for
-- a later phase). The admin dashboard UI labels it accordingly rather than
-- showing a fabricated number.

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
    null::numeric;
end;
$$;

grant execute on function public.admin_dashboard_summary() to authenticated;
revoke execute on function public.admin_dashboard_summary() from public, anon;
