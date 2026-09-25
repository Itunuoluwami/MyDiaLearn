-- Commission and platform fee were never applied.
--
-- booking_quote() and pay_for_booking() guarded the fee block with
-- `if rule is not null`. On a PL/pgSQL record, IS NOT NULL is true only
-- when *every* column is non-null, so any rule with an unused column (a
-- percentage rule has no fixed_amount) was treated as "no rule": families
-- were quoted without the platform fee and tutors were credited the whole
-- lesson, commission 0.
--
-- Same bodies as the live functions; only the guard changes — rule.id in
-- booking_quote (the select always runs), a FOUND flag in pay_for_booking
-- (where the select is conditional and rule may be unassigned).

CREATE OR REPLACE FUNCTION public.booking_quote(p_tutor_id uuid, p_duration_minutes integer)
 RETURNS TABLE(currency text, hourly_rate numeric, duration_minutes integer, lesson_amount numeric, platform_fee numeric, processing_fee numeric, commission_amount numeric, total_amount numeric, commission_rule_id uuid, cancellation_policy_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  t record;
  rule record;
  tier record;
  dur integer := coalesce(nullif(p_duration_minutes, 0), 60);
  lesson numeric := 0;
  pf numeric := 0;
  proc numeric := 0;
  comm numeric := 0;
  proc_pct numeric := 0;
  proc_fixed numeric := 0;
  recent_volume integer := 0;
begin
  select tt.hourly_rate, tt.currency, tt.agency_id into t from tutors tt where tt.id = p_tutor_id;
  if t is null or t.hourly_rate is null then return; end if;

  lesson := round(t.hourly_rate * dur / 60.0, 2);

  select cr.* into rule
  from commission_rules cr
  where cr.is_active
    and cr.applies_to = 'tutor'
    and (cr.tutor_id is null or cr.tutor_id = p_tutor_id)
    and (cr.agency_id is null or cr.agency_id = t.agency_id)
    and (cr.currency is null or cr.currency = t.currency)
    and cr.effective_from <= now()
    and (cr.effective_to is null or cr.effective_to > now())
  order by (cr.tutor_id is not null) desc, (cr.agency_id is not null) desc, cr.priority desc
  limit 1;

  if rule.id is not null then
    pf := round(lesson * coalesce(rule.platform_fee_percentage, 0) / 100.0, 2)
          + coalesce(rule.platform_fee_fixed, 0);

    if rule.model = 'tiered' then
      select count(*) into recent_volume
      from bookings b
      where b.tutor_id = p_tutor_id
        and b.status = 'completed'
        and b.created_at >= now() - interval '30 days';

      select (t.value->>'percentage')::numeric as percentage into tier
      from jsonb_array_elements(coalesce(rule.tiers, '[]'::jsonb)) as t(value)
      where recent_volume >= coalesce((t.value->>'min')::numeric, 0)
        and (t.value->>'max' is null or recent_volume <= (t.value->>'max')::numeric)
      order by coalesce((t.value->>'min')::numeric, 0) desc
      limit 1;

      comm := round(lesson * coalesce(tier.percentage, 0) / 100.0, 2);
    else
      comm := case rule.model
        when 'percentage' then round(lesson * coalesce(rule.percentage, 0) / 100.0, 2)
        when 'fixed' then coalesce(rule.fixed_amount, 0)
        else 0
      end;
    end if;
  end if;

  select coalesce((value #>> '{}')::numeric, 0) into proc_pct
  from platform_settings where key = 'payments.processing_fee_percentage';
  select coalesce((value #>> '{}')::numeric, 0) into proc_fixed
  from platform_settings where key = 'payments.processing_fee_fixed';
  proc := round(lesson * coalesce(proc_pct, 0) / 100.0, 2) + coalesce(proc_fixed, 0);

  currency := t.currency;
  hourly_rate := t.hourly_rate;
  duration_minutes := dur;
  lesson_amount := lesson;
  platform_fee := pf;
  processing_fee := proc;
  commission_amount := comm;
  total_amount := lesson + pf + proc;
  commission_rule_id := rule.id;
  select cp.id into cancellation_policy_id
  from cancellation_policies cp
  where cp.is_active and cp.is_default
  order by cp.created_at limit 1;
  return next;
end;
$function$;

CREATE OR REPLACE FUNCTION public.pay_for_booking(p_booking_id uuid)
 RETURNS payments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_has_rule boolean := false;
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
    v_has_rule := found;
  end if;

  if v_has_rule then
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
$function$;
