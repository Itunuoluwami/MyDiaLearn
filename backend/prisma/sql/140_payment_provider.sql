-- Payment provider integration.
--
-- Until now pay_for_booking() recorded an instant 'paid' row: there was no
-- gateway. A real provider charges asynchronously and confirms later, so the
-- charge is split into steps that the API drives through the provider port:
--
--   payment_prepare()      checks the payer and the booking, computes the fee
--                          split exactly as before, and opens a 'pending'
--                          payment (reusing an open attempt, so a double
--                          click or retry cannot open two)
--   payment_mark_paid()    records a confirmed charge; idempotent; refuses an
--                          amount or currency that differs from the booking
--   payment_mark_failed()  closes an attempt the provider declined
--
-- pay_for_booking() becomes prepare + mark_paid with the 'simulated'
-- provider, so its behaviour and its callers are unchanged, and the fee
-- split lives in exactly one function.
--
-- Also: payment_events (every provider interaction and webhook, deduplicated
-- by the provider's event id) and payment_refunds (a ledger row for every
-- refund recorded on a payment, whichever path recorded it, processed through
-- the provider once, keyed for idempotency).
--
-- No card data is stored anywhere: providers hold it; we keep references.

-- 1. Payment columns --------------------------------------------------------

alter table public.payments
  add column if not exists failure_reason text,
  add column if not exists verified_at timestamptz;

-- At most one open attempt and one successful charge per booking.
create unique index if not exists payments_one_open_attempt
  on public.payments (booking_id) where status in ('pending', 'processing');
create unique index if not exists payments_one_paid
  on public.payments (booking_id) where status = 'paid';
create index if not exists payments_provider_reference_idx
  on public.payments (provider, provider_reference) where provider_reference is not null;

-- 2. Audit trail of provider interactions --------------------------------------

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments (id) on delete set null,
  refund_id uuid,
  provider text not null,
  -- The provider's own event id for webhooks; null for calls we made.
  provider_event_id text,
  source text not null check (source in ('api', 'webhook')),
  event_type text not null,
  status text,
  amount numeric(12,2),
  currency text,
  -- Sanitised provider data only: references, statuses, amounts. Never card data.
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists payment_events_provider_event_key
  on public.payment_events (provider, provider_event_id) where provider_event_id is not null;
create index if not exists payment_events_payment_idx on public.payment_events (payment_id);

alter table public.payment_events enable row level security;
drop policy if exists payment_events_admin_read on public.payment_events;
create policy payment_events_admin_read on public.payment_events
  for select using (public.is_admin());

-- 3. Refund ledger ---------------------------------------------------------------

create table if not exists public.payment_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null,
  -- One ledger row per cumulative refund level of a payment: recording the
  -- same refund twice cannot create a second provider refund.
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  provider text,
  provider_refund_reference text,
  failure_reason text,
  attempts integer not null default 0,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists payment_refunds_pending_idx
  on public.payment_refunds (status) where status = 'pending';

alter table public.payment_refunds enable row level security;
drop policy if exists payment_refunds_admin_read on public.payment_refunds;
create policy payment_refunds_admin_read on public.payment_refunds
  for select using (public.is_admin());

drop trigger if exists payment_refunds_updated_at on public.payment_refunds;
create trigger payment_refunds_updated_at before update on public.payment_refunds
  for each row execute function public.set_updated_at();

-- Every increase in a payment's refunded_amount — from the approval
-- dispatcher's payment.refund, from admin_cancel_booking(), from anywhere —
-- becomes one pending ledger row for the difference.
create or replace function public.record_payment_refund()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_delta numeric;
begin
  v_delta := coalesce(new.refunded_amount, 0) - coalesce(old.refunded_amount, 0);
  if v_delta > 0 then
    insert into public.payment_refunds (payment_id, amount, currency, idempotency_key, provider)
    values (new.id, v_delta, new.currency,
            new.id::text || ':' || coalesce(new.refunded_amount, 0)::text, new.provider)
    on conflict (idempotency_key) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists payments_record_refund on public.payments;
create trigger payments_record_refund
  after update of refunded_amount on public.payments
  for each row execute function public.record_payment_refund();

-- 4. Payment steps -----------------------------------------------------------------
-- payment_prepare(): the body of pay_for_booking(), with the open-attempt reuse
-- added and the row opened as 'pending' for the named provider.

CREATE OR REPLACE FUNCTION public.payment_prepare(p_booking_id uuid, p_provider text)
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
  v_agency_id uuid;
  v_agency_share numeric := 0;
  v_agency_payout numeric := 0;
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

  -- An open attempt for this booking is reused, so a retry or double click
  -- cannot open a second one. An attempt by another payer or provider, or
  -- for a stale amount, is closed and replaced.
  select * into v_payment from public.payments
  where booking_id = p_booking_id and status in ('pending', 'processing')
  order by created_at desc limit 1
  for update;
  if found then
    if v_payment.provider = p_provider and v_payment.payer_id = auth.uid()
       and v_payment.amount = v_booking.total_amount then
      return v_payment;
    end if;
    update public.payments set status = 'failed', failure_reason = 'superseded'
    where id = v_payment.id;
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

  -- Agency tutors: the agency's agreed percentage comes out of the tutor's
  -- earnings (after DiaLearn's commission) and is recorded separately, so
  -- each side has its own balance and its own payouts.
  select a.id, a.revenue_share_percentage into v_agency_id, v_agency_share
  from public.tutors t join public.tutor_agencies a on a.id = t.agency_id
  where t.id = v_booking.tutor_id;
  if v_agency_id is not null and coalesce(v_agency_share, 0) > 0 then
    v_agency_payout := round(v_tutor_payout * v_agency_share / 100.0, 2);
    v_tutor_payout := v_tutor_payout - v_agency_payout;
  end if;

  insert into public.payments (
    booking_id, payer_id, tutor_id, amount, currency, platform_fee, commission_amount,
    tutor_payout, commission_rule_id, status, provider, paid_at, agency_id, agency_payout
  ) values (
    v_booking.id, auth.uid(), v_booking.tutor_id, v_booking.total_amount, v_booking.currency,
    v_platform_fee, v_commission, v_tutor_payout, v_booking.commission_rule_id,
    'pending', p_provider, null, v_agency_id, v_agency_payout
  )
  returning * into v_payment;

  -- Pending until the provider confirms; payment_mark_paid() then confirms
  -- the booking through confirm_booking_on_payment(), as before.
  return v_payment;
end;
$function$;

create or replace function public.payment_mark_paid(
  p_payment_id uuid, p_provider_reference text, p_amount numeric, p_currency text
) returns public.payments
language plpgsql security definer set search_path = public as $$
declare v public.payments;
begin
  select * into v from public.payments where id = p_payment_id for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;

  -- Idempotent: confirming a confirmed payment changes nothing.
  if v.status in ('paid', 'partially_refunded', 'refunded') then
    return v;
  end if;
  if v.status not in ('pending', 'processing') then
    raise exception 'PAYMENT_NOT_PENDING';
  end if;

  -- The provider must have taken exactly what the booking was priced at.
  if p_amount is distinct from v.amount
     or upper(coalesce(p_currency, '')) is distinct from upper(v.currency) then
    raise exception 'PAYMENT_AMOUNT_MISMATCH';
  end if;

  if exists (select 1 from public.payments
             where booking_id = v.booking_id and status = 'paid' and id <> v.id) then
    raise exception 'ALREADY_PAID';
  end if;

  update public.payments
    set status = 'paid', paid_at = now(), verified_at = now(), failure_reason = null,
        provider_reference = coalesce(p_provider_reference, provider_reference)
  where id = v.id
  returning * into v;

  -- confirm_booking_on_payment() confirms the booking from here, as before.
  return v;
end $$;

create or replace function public.payment_mark_failed(p_payment_id uuid, p_reason text)
returns public.payments
language plpgsql security definer set search_path = public as $$
declare v public.payments;
begin
  select * into v from public.payments where id = p_payment_id for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;
  if v.status in ('pending', 'processing') then
    update public.payments
      set status = 'failed', failure_reason = left(coalesce(p_reason, 'failed'), 500)
    where id = v.id
    returning * into v;
  end if;
  return v;
end $$;

-- 5. pay_for_booking(), kept for existing callers: the simulated provider's
-- instant charge, now through the same two steps the API uses.
create or replace function public.pay_for_booking(p_booking_id uuid)
returns public.payments
language plpgsql security definer set search_path = public as $$
declare v public.payments;
begin
  v := public.payment_prepare(p_booking_id, 'simulated');
  return public.payment_mark_paid(v.id, 'sim_' || v.id::text, v.amount, v.currency);
end $$;

-- Confirming or failing a charge is the server's decision alone.
revoke all on function public.payment_mark_paid(uuid, text, numeric, text) from public;
revoke all on function public.payment_mark_failed(uuid, text) from public;

-- 6. admin_cancel_booking() never refunded.
-- It tested `if pay is not null` after loading the paid payment. On a
-- PL/pgSQL record that is true only when every column is non-null, and a paid
-- payment always has some null columns (refunded_amount, failure_reason), so
-- the refund branch never ran: bookings were cancelled with no refund
-- recorded. Same body; only that test becomes FOUND.

CREATE OR REPLACE FUNCTION public.admin_cancel_booking(p_booking_id uuid, p_reason text, p_refund_percentage numeric DEFAULT NULL::numeric)
 RETURNS TABLE(refund_amount numeric, refund_currency text, policy_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  if found then
    amt := round(pay.amount * pct / 100.0, 2);
    if amt > 0 then
      update public.payments
      set refunded_amount = amt,
          status = case when amt >= pay.amount then 'refunded' else 'partially_refunded' end::public.payment_status
      where id = pay.id;
    end if;
    refund_currency := pay.currency;
  end if;

  refund_amount := amt;
  return next;
end;
$function$;

-- 7. No refund could ever be applied.
-- Both refund paths set payments.status from a CASE of text literals, which
-- PostgreSQL types as text; payments.status is the payment_status enum, so
-- the UPDATE failed ("expression is of type text"). An approved refund
-- request always failed. Same bodies; the CASE is cast to payment_status.

CREATE OR REPLACE FUNCTION public.admin_execute_action(p_action text, p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_payment public.payments;
  v_amount numeric;
begin
  case p_action

    when 'payment.refund' then
      select * into v_payment from public.payments
      where id = (p_payload ->> 'payment_id')::uuid
      for update;
      if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;
      if v_payment.status not in ('paid', 'partially_refunded') then
        raise exception 'PAYMENT_NOT_REFUNDABLE';
      end if;
      v_amount := least(greatest((p_payload ->> 'amount')::numeric, 0), v_payment.amount);
      update public.payments
      set refunded_amount = v_amount,
          status = case when v_amount >= v_payment.amount then 'refunded' else 'partially_refunded' end::public.payment_status
      where id = v_payment.id;

    when 'booking.cancel_with_refund' then
      -- Reuses the existing RPC rather than duplicating the cancellation_policies
      -- refund maths.
      perform public.admin_cancel_booking(
        (p_payload ->> 'booking_id')::uuid,
        coalesce(nullif(p_payload ->> 'reason', ''), 'Cancelled by DiaLearn admin'),
        nullif(p_payload ->> 'refund_percentage', '')::numeric
      );

    when 'payout.settle' then
      update public.payouts
      set status = 'paid',
          settled_at = now(),
          reference = coalesce(nullif(p_payload ->> 'reference', ''), reference)
      where id = (p_payload ->> 'payout_id')::uuid
        and status in ('requested', 'processing');
      if not found then raise exception 'PAYOUT_NOT_SETTLEABLE'; end if;

    when 'user_roles.grant_elevated' then
      if coalesce((p_payload ->> 'revoke')::boolean, false) then
        delete from public.user_roles
        where user_id = (p_payload ->> 'user_id')::uuid
          and role = (p_payload ->> 'role')::public.app_role;
      else
        insert into public.user_roles (user_id, role)
        values ((p_payload ->> 'user_id')::uuid, (p_payload ->> 'role')::public.app_role)
        on conflict (user_id, role) do nothing;
      end if;

    when 'profile.suspend' then
      update public.profiles
      set is_active = (p_payload ->> 'is_active')::boolean
      where id = (p_payload ->> 'profile_id')::uuid;
      if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

    else
      raise exception 'UNSUPPORTED_ACTION';
  end case;
end;
$function$;
