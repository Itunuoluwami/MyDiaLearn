-- Pay-per-lesson checkout.
--
-- This project has no subscription/billing plan (that's the point of the
-- next migration in this batch, which removes the subscription_plans table
-- shipped in Phase 4C) — families pay per lesson, and a booking must not
-- move to "confirmed" until that payment lands. The database rails for this
-- were already built (bookings.tutor_accepted_at, tutor_respond_booking()
-- only confirms once a paid payment exists, confirm_booking_on_payment()
-- confirms once the tutor has accepted, tutor_bookings() already reads and
-- displays payment_status to the tutor, tutor.classes.tsx already shows an
-- "awaiting payment" banner) but nothing anywhere ever actually inserted a
-- payments row — `payments` only grants writes to admins
-- (payments_admin_write), so a parent/student had no way to pay at all.
--
-- pay_for_booking() is that missing write path: a payer-gated RPC (mirrors
-- the auth check in can_access_booking()/raise_dispute()) that records a
-- payment for a booking they're party to. There's still no live payment
-- gateway wired into this codebase, so this simulates an instant successful
-- charge rather than pretending to collect card details — it's the same
-- "admin-editable/caller-triggered now, real gateway later" shape as
-- provider/provider_reference already sitting unused on this table.

create or replace function public.pay_for_booking(p_booking_id uuid)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_lesson numeric;
  v_platform_fee numeric := 0;
  v_commission numeric := 0;
  v_tutor_payout numeric;
  v_payment public.payments;
  rule record;
  tier record;
  recent_volume integer := 0;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if not (
    v_booking.booked_by = auth.uid()
    or public.can_access_student(v_booking.student_id)
    or public.is_admin()
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'BOOKING_NOT_PAYABLE';
  end if;

  if exists (select 1 from public.payments where booking_id = p_booking_id and status = 'paid') then
    raise exception 'ALREADY_PAID';
  end if;

  -- Fee/commission breakdown, for reporting only — `amount` charged is the
  -- booking's own total_amount, captured at booking_quote() time, so a rule
  -- change afterwards never retroactively changes what this charge is for.
  v_lesson := round(v_booking.hourly_rate * v_booking.duration_minutes / 60.0, 2);

  if v_booking.commission_rule_id is not null then
    select cr.* into rule from public.commission_rules cr where cr.id = v_booking.commission_rule_id;
  end if;

  if rule is not null then
    v_platform_fee := round(v_lesson * coalesce(rule.platform_fee_percentage, 0) / 100.0, 2)
      + coalesce(rule.platform_fee_fixed, 0);

    if rule.model = 'tiered' then
      select count(*) into recent_volume
      from public.bookings b
      where b.tutor_id = v_booking.tutor_id
        and b.status = 'completed'
        and b.created_at >= now() - interval '30 days';

      select (t.value->>'percentage')::numeric as percentage into tier
      from jsonb_array_elements(coalesce(rule.tiers, '[]'::jsonb)) as t(value)
      where recent_volume >= coalesce((t.value->>'min')::numeric, 0)
        and (t.value->>'max' is null or recent_volume <= (t.value->>'max')::numeric)
      order by coalesce((t.value->>'min')::numeric, 0) desc
      limit 1;

      v_commission := round(v_lesson * coalesce(tier.percentage, 0) / 100.0, 2);
    else
      v_commission := case rule.model
        when 'percentage' then round(v_lesson * coalesce(rule.percentage, 0) / 100.0, 2)
        when 'fixed' then coalesce(rule.fixed_amount, 0)
        else 0
      end;
    end if;
  end if;

  v_tutor_payout := greatest(v_lesson - v_commission, 0);

  insert into public.payments (
    booking_id, payer_id, tutor_id, amount, currency, platform_fee, commission_amount,
    tutor_payout, commission_rule_id, status, provider, paid_at
  ) values (
    v_booking.id, auth.uid(), v_booking.tutor_id, v_booking.total_amount, v_booking.currency,
    v_platform_fee, v_commission, v_tutor_payout, v_booking.commission_rule_id,
    'paid', 'simulated', now()
  )
  returning * into v_payment;

  -- confirm_booking_on_payment() (existing trigger) confirms the booking
  -- automatically here if the tutor already accepted; tutor_respond_booking()
  -- confirms it the other way round if acceptance comes after payment.
  return v_payment;
end;
$$;

revoke all on function public.pay_for_booking(uuid) from public, anon;
grant execute on function public.pay_for_booking(uuid) to authenticated;
