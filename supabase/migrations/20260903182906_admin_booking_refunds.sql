-- Admin Portal Phase 2: booking management, payment monitoring, refunds and
-- payout oversight.
--
-- 1. Seeds the admin.bookings / admin.payments / admin.payouts permission
--    keys (mirrors the admin.settings/admin.users/admin.verification seed in
--    20260826121230...sql) so the three new admin pages can gate on them.
-- 2. Adds admin_cancel_booking() — the first place in this codebase that
--    actually applies cancellation_policies.refund_percentage to a payment.
--    Nothing else here computes or records a refund today.

insert into public.permissions (key, label, description, category) values
  ('admin.bookings', 'Manage bookings', 'View, override and cancel bookings across the platform', 'admin'),
  ('admin.payments', 'Monitor payments', 'View transactions, flag issues and issue refunds', 'admin'),
  ('admin.payouts', 'Manage payouts', 'Approve or reject tutor payout requests', 'admin');

insert into public.role_permissions (role, permission_key) values
  ('admin', 'admin.bookings'),
  ('admin', 'admin.payments'),
  ('admin', 'admin.payouts');

create or replace function public.admin_cancel_booking(
  p_booking_id uuid,
  p_reason text,
  p_refund_percentage numeric default null
)
returns table (
  refund_amount numeric,
  refund_currency text,
  policy_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  pct numeric;
  pay record;
  amt numeric := 0;
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into b from public.bookings where id = p_booking_id;
  if b is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;
  if b.status in ('cancelled', 'completed', 'rejected') then
    raise exception 'BOOKING_NOT_CANCELLABLE';
  end if;

  if p_refund_percentage is not null then
    pct := greatest(0, least(100, p_refund_percentage));
    select name into policy_name from public.cancellation_policies where id = b.cancellation_policy_id;
  else
    select cp.refund_percentage, cp.name into pct, policy_name
    from public.cancellation_policies cp
    where cp.id = b.cancellation_policy_id;

    if pct is null then
      select cp.refund_percentage, cp.name into pct, policy_name
      from public.cancellation_policies cp
      where cp.is_default and cp.is_active
      order by cp.created_at
      limit 1;
    end if;
    pct := coalesce(pct, 100);
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = auth.uid(),
      cancellation_reason = p_reason
  where id = p_booking_id;

  select * into pay from public.payments where booking_id = p_booking_id and status = 'paid' limit 1;
  if pay is not null then
    amt := round(pay.amount * pct / 100.0, 2);
    if amt > 0 then
      update public.payments
      set refunded_amount = amt,
          status = case when amt >= pay.amount then 'refunded' else 'partially_refunded' end
      where id = pay.id;
    end if;
    refund_currency := pay.currency;
  end if;

  refund_amount := amt;
  return next;
end;
$$;

revoke all on function public.admin_cancel_booking(uuid, text, numeric) from public, anon;
grant execute on function public.admin_cancel_booking(uuid, text, numeric) to authenticated;
