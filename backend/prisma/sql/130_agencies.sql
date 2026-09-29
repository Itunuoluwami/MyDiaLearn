-- Tutor agencies.
--
-- An agency signs up with the `agency` role, is verified by DiaLearn
-- (business registration, agency agreement), and adds and manages tutors
-- under its account. Those tutors are verified by DiaLearn like any other,
-- and appear in search only while their agency is verified.
--
-- Money: on each payment the agency's agreed percentage is taken from the
-- tutor's earnings (after DiaLearn's commission) and recorded separately.
-- Tutor and agency each have a balance and request their own payouts; the
-- agency sees every tutor's totals. The percentage is set by admins, from
-- the agency agreement, and starts at 0.
--
-- Additive: new columns default so existing rows are unaffected, and the
-- rule triggers only constrain agency-related changes.

-- 1. Agency record ------------------------------------------------------------

alter table public.tutor_agencies
  add column if not exists revenue_share_percentage numeric(5,2) not null default 0
    constraint tutor_agencies_revenue_share_range
      check (revenue_share_percentage >= 0 and revenue_share_percentage <= 100),
  add column if not exists submitted_at timestamptz;

-- One agency per owner account.
create unique index if not exists tutor_agencies_owner_key on public.tutor_agencies (owner_id);

-- 2. Agency verification progress ----------------------------------------------

create table if not exists public.agency_verification_progress (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.tutor_agencies (id) on delete cascade,
  step_id uuid not null references public.verification_steps (id) on delete cascade,
  status public.verification_status not null default 'pending',
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, step_id)
);

alter table public.agency_verification_progress enable row level security;

drop policy if exists agency_progress_read on public.agency_verification_progress;
create policy agency_progress_read on public.agency_verification_progress
  for select using (
    public.is_admin()
    or exists (select 1 from public.tutor_agencies a where a.id = agency_id and a.owner_id = auth.uid())
  );

drop policy if exists agency_progress_admin_write on public.agency_verification_progress;
create policy agency_progress_admin_write on public.agency_verification_progress
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists agency_verification_progress_updated_at on public.agency_verification_progress;
create trigger agency_verification_progress_updated_at
  before update on public.agency_verification_progress
  for each row execute function public.set_updated_at();

-- 3. Money columns -------------------------------------------------------------

alter table public.payments
  add column if not exists agency_id uuid references public.tutor_agencies (id) on delete set null,
  add column if not exists agency_payout numeric(12,2) not null default 0;

alter table public.payouts alter column tutor_id drop not null;
alter table public.payouts
  add column if not exists agency_id uuid references public.tutor_agencies (id) on delete cascade;

-- A payout is to exactly one payee: a tutor or an agency.
alter table public.payouts drop constraint if exists payouts_one_payee;
alter table public.payouts
  add constraint payouts_one_payee check (num_nonnulls(tutor_id, agency_id) = 1);

create index if not exists payments_agency_idx on public.payments (agency_id) where agency_id is not null;
create index if not exists payouts_agency_idx on public.payouts (agency_id) where agency_id is not null;
create index if not exists tutors_agency_idx on public.tutors (agency_id) where agency_id is not null;

-- 4. Rules ------------------------------------------------------------------------

create or replace function public.current_agency_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.tutor_agencies where owner_id = auth.uid() limit 1
$$;

-- Agencies may edit their own details, but not their verification outcome or
-- their share; those are DiaLearn's. Submitting moves unverified/rejected to
-- pending, the same transition tutors have.
create or replace function public.enforce_agency_rules()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verification_status := 'unverified';
    new.revenue_share_percentage := 0;
    new.submitted_at := null;
    return new;
  end if;

  new.revenue_share_percentage := old.revenue_share_percentage;
  new.owner_id := old.owner_id;

  if new.verification_status is distinct from old.verification_status then
    if old.verification_status in ('unverified', 'rejected')
       and new.verification_status = 'pending' then
      new.verification_status := 'pending';
    else
      new.verification_status := old.verification_status;
      new.submitted_at := old.submitted_at;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists tutor_agencies_rules on public.tutor_agencies;
create trigger tutor_agencies_rules
  before insert or update on public.tutor_agencies
  for each row execute function public.enforce_agency_rules();

-- Tutor rules, extended. The original body is unchanged for non-admins; two
-- agency rules are added and apply to everyone, admins included:
--   * only the agency's owner (or an admin) may attach a tutor to it or
--     detach one from it;
--   * an agency tutor is never listed while the agency is not verified.
create or replace function public.enforce_tutor_verification_rules()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' and new.agency_id is not null
       and not exists (select 1 from public.tutor_agencies a
                       where a.id = new.agency_id and a.owner_id = auth.uid()) then
      raise exception 'AGENCY_LINK_FORBIDDEN';
    end if;

    if tg_op = 'UPDATE' and new.agency_id is distinct from old.agency_id
       and not (
         (old.agency_id is null and exists (select 1 from public.tutor_agencies a
                                            where a.id = new.agency_id and a.owner_id = auth.uid()))
         or (new.agency_id is null and exists (select 1 from public.tutor_agencies a
                                               where a.id = old.agency_id and a.owner_id = auth.uid()))
       ) then
      raise exception 'AGENCY_LINK_FORBIDDEN';
    end if;

    if tg_op = 'INSERT' then
      new.verification_status := 'unverified';
      new.is_listed := false;
    else
      if new.verification_status is distinct from old.verification_status then
        if old.verification_status in ('unverified','rejected')
           and new.verification_status in ('pending','in_review') then
          new.verification_status := 'pending';
        else
          new.verification_status := old.verification_status;
        end if;
      end if;

      if new.verification_status <> 'verified' then
        new.is_listed := false;
      end if;
    end if;
  end if;

  if new.agency_id is not null and new.is_listed
     and not exists (select 1 from public.tutor_agencies a
                     where a.id = new.agency_id and a.verification_status = 'verified' and a.is_active) then
    new.is_listed := false;
  end if;

  return new;
end $$;

-- Keep listings in step with the agency: verifying it lists its verified
-- tutors; anything else (rejected, suspended, deactivated) unlists them.
create or replace function public.sync_agency_tutor_listing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.verification_status is distinct from old.verification_status
     or new.is_active is distinct from old.is_active then
    if new.verification_status = 'verified' and new.is_active then
      update public.tutors set is_listed = true, updated_at = now()
      where agency_id = new.id and verification_status = 'verified' and not is_listed;
    else
      update public.tutors set is_listed = false, updated_at = now()
      where agency_id = new.id and is_listed;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists tutor_agencies_listing_sync on public.tutor_agencies;
create trigger tutor_agencies_listing_sync
  after update on public.tutor_agencies
  for each row execute function public.sync_agency_tutor_listing();

-- 5. Payment split ---------------------------------------------------------
-- Same body as the live pay_for_booking(); only the agency share is added.

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
    'paid', 'simulated', now(), v_agency_id, v_agency_payout
  )
  returning * into v_payment;

  -- confirm_booking_on_payment() (existing trigger) confirms the booking
  -- automatically here if the tutor already accepted; tutor_respond_booking()
  -- confirms it the other way round if acceptance comes after payment.
  return v_payment;
end;
$function$;

-- 6. Agency functions ------------------------------------------------------------

-- The owner submits the agency for review: one progress row per active agency
-- step, and the agency moves to pending.
create or replace function public.agency_submit_verification()
returns public.verification_status
language plpgsql security definer set search_path = public as $$
declare
  v_agency uuid := public.current_agency_id();
  v_status public.verification_status;
begin
  if v_agency is null then raise exception 'NOT_AN_AGENCY'; end if;

  select verification_status into v_status from public.tutor_agencies where id = v_agency;
  if v_status in ('verified', 'suspended', 'pending', 'in_review') then
    return v_status;
  end if;

  insert into public.agency_verification_progress (agency_id, step_id, status)
  select v_agency, vs.id, 'pending'
  from public.verification_steps vs
  where vs.is_active and vs.applies_to = 'agency'
  on conflict (agency_id, step_id) do update set status = 'pending', updated_at = now()
    where agency_verification_progress.status in ('unverified', 'rejected');

  update public.tutor_agencies
    set verification_status = 'pending', submitted_at = now(), updated_at = now()
  where id = v_agency;

  select verification_status into v_status from public.tutor_agencies where id = v_agency;
  return v_status;
end $$;

-- The agency's own balance: its share of paid lessons, less its payouts.
create or replace function public.agency_earnings_summary()
returns table (
  currency text, gross_revenue numeric, agency_earnings numeric, pending_earnings numeric,
  paid_out numeric, pending_payouts numeric, available_balance numeric,
  revenue_share_percentage numeric, minimum_payout numeric,
  next_payout_date text, schedule_label text
)
language plpgsql stable security definer set search_path = public as $$
declare v_agency uuid := public.current_agency_id();
begin
  if v_agency is null then return; end if;
  return query
  with p as (select * from public.payments where agency_id = v_agency),
  paid as (select * from p where status = 'paid'),
  po as (select * from public.payouts where agency_id = v_agency)
  select
    coalesce((select pd.currency from paid pd order by pd.paid_at desc limit 1),
             (select value #>> '{}' from public.platform_settings where key = 'money.base_currency'), 'USD'),
    coalesce((select sum(amount) from paid), 0),
    coalesce((select sum(agency_payout) from paid), 0),
    coalesce((select sum(agency_payout) from p where status in ('pending', 'processing')), 0),
    coalesce((select sum(amount) from po where status = 'paid'), 0),
    coalesce((select sum(amount) from po where status in ('requested', 'processing')), 0),
    coalesce((select sum(agency_payout) from paid), 0)
      - coalesce((select sum(amount) from po where status in ('requested', 'processing', 'paid')), 0),
    (select a.revenue_share_percentage from public.tutor_agencies a where a.id = v_agency),
    (select (value #>> '{}')::numeric from public.platform_settings where key = 'payouts.minimum_amount'),
    (select value #>> '{}' from public.platform_settings where key = 'payouts.next_payout_date'),
    (select value #>> '{}' from public.platform_settings where key = 'payouts.schedule_label');
end $$;

-- Same rules as tutor_request_payout(): positive, at least the minimum, and
-- no more than the available balance.
create or replace function public.agency_request_payout(p_amount numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_agency uuid := public.current_agency_id(); v_avail numeric; v_min numeric; v_cur text; v_id uuid;
begin
  if v_agency is null then raise exception 'NOT_AN_AGENCY'; end if;
  select available_balance, minimum_payout, currency into v_avail, v_min, v_cur
  from public.agency_earnings_summary();
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  if coalesce(v_min, 0) > 0 and p_amount < v_min then raise exception 'BELOW_MINIMUM'; end if;
  if p_amount > coalesce(v_avail, 0) then raise exception 'INSUFFICIENT_BALANCE'; end if;
  insert into public.payouts (agency_id, amount, currency) values (v_agency, p_amount, v_cur)
  returning id into v_id;
  return v_id;
end $$;

-- Every tutor's totals, for the agency's team view.
create or replace function public.agency_tutor_earnings()
returns table (
  tutor_id uuid, full_name text, verification_status text, is_listed boolean,
  lessons_completed bigint, gross_amount numeric, tutor_earnings numeric,
  agency_earnings numeric, tutor_paid_out numeric, currency text
)
language plpgsql stable security definer set search_path = public as $$
declare v_agency uuid := public.current_agency_id();
begin
  if v_agency is null then return; end if;
  return query
  select t.id, pr.full_name, t.verification_status::text, t.is_listed,
         (select count(*) from public.bookings b where b.tutor_id = t.id and b.status = 'completed'),
         coalesce((select sum(p.amount) from public.payments p where p.tutor_id = t.id and p.status = 'paid'), 0),
         coalesce((select sum(p.tutor_payout) from public.payments p where p.tutor_id = t.id and p.status = 'paid'), 0),
         coalesce((select sum(p.agency_payout) from public.payments p
                   where p.tutor_id = t.id and p.agency_id = v_agency and p.status = 'paid'), 0),
         coalesce((select sum(po.amount) from public.payouts po where po.tutor_id = t.id and po.status = 'paid'), 0),
         t.currency
  from public.tutors t
  left join public.profiles pr on pr.id = t.profile_id
  where t.agency_id = v_agency
  order by pr.full_name;
end $$;

-- Only the API calls these; Supabase clients never did.
revoke all on function public.agency_submit_verification() from public;
revoke all on function public.agency_earnings_summary() from public;
revoke all on function public.agency_request_payout(numeric) from public;
revoke all on function public.agency_tutor_earnings() from public;
