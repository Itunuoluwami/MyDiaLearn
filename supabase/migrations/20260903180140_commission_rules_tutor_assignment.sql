-- Admin Portal Phase 1: commission rules become assignable to a specific
-- tutor (not just a whole role or a whole agency), and the tiered-by-volume
-- model actually affects pricing instead of always computing zero commission.
--
-- tiers is a JSON array of { "min": number, "max": number | null, "percentage": number }
-- volume thresholds, keyed on the tutor's completed bookings in the trailing
-- 30 days. The admin Commission tab writes this shape; nothing here invents
-- a new table, this only extends the existing commission_rules row and the
-- existing booking_quote() pricing function.

alter table public.commission_rules
  add column if not exists tutor_id uuid references public.tutors(id) on delete cascade;

create index if not exists commission_rules_tutor_id_idx on public.commission_rules (tutor_id);

create or replace function public.booking_quote(p_tutor_id uuid, p_duration_minutes integer)
returns table (
  currency text,
  hourly_rate numeric,
  duration_minutes integer,
  lesson_amount numeric,
  platform_fee numeric,
  processing_fee numeric,
  commission_amount numeric,
  total_amount numeric,
  commission_rule_id uuid,
  cancellation_policy_id uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
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

  if rule is not null then
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
$$;
