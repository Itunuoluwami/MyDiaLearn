-- 1. Public tutor card lookup for a set of tutor ids
CREATE OR REPLACE FUNCTION public.public_tutor_cards(p_ids uuid[])
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  country_code text,
  headline text,
  hourly_rate numeric,
  currency text,
  years_experience integer,
  verification_status verification_status,
  timezone text,
  rating_avg numeric,
  rating_count bigint,
  lessons_completed bigint,
  subjects text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id,
         p.full_name,
         p.avatar_url,
         p.country_code,
         t.headline,
         t.hourly_rate,
         t.currency,
         t.years_experience,
         t.verification_status,
         t.timezone,
         (SELECT round(avg(r.score)::numeric, 2) FROM ratings r WHERE r.tutor_id = t.id AND r.is_published),
         (SELECT count(*) FROM ratings r WHERE r.tutor_id = t.id AND r.is_published),
         (SELECT count(*) FROM bookings b WHERE b.tutor_id = t.id AND b.status = 'completed'),
         COALESCE((
           SELECT array_agg(DISTINCT s.name ORDER BY s.name)
           FROM tutor_subjects ts JOIN subjects s ON s.id = ts.subject_id
           WHERE ts.tutor_id = t.id
         ), '{}')
  FROM tutors t
  JOIN profiles p ON p.id = t.profile_id
  WHERE t.id = ANY(p_ids);
$$;

-- 2. Parent dashboard KPI summary (scoped to the signed-in user)
CREATE OR REPLACE FUNCTION public.parent_dashboard_summary()
RETURNS TABLE (
  active_students bigint,
  active_tutors bigint,
  upcoming_classes bigint,
  completed_lessons bigint,
  learning_minutes bigint,
  month_spend numeric,
  month_spend_currency text,
  outstanding_amount numeric,
  outstanding_currency text,
  outstanding_count bigint,
  attendance_rate numeric,
  pending_approvals bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  kids AS (
    SELECT s.id FROM students s, me WHERE s.parent_id = me.uid AND s.is_active
  ),
  bk AS (
    SELECT b.* FROM bookings b, me
    WHERE b.student_id IN (SELECT id FROM kids) OR b.booked_by = me.uid
  ),
  pay AS (
    SELECT p.* FROM payments p, me WHERE p.payer_id = me.uid
  ),
  att AS (
    SELECT cs.student_attended
    FROM class_sessions cs
    WHERE cs.booking_id IN (SELECT id FROM bk) AND cs.student_attended IS NOT NULL
  )
  SELECT
    (SELECT count(*) FROM kids),
    (SELECT count(DISTINCT tutor_id) FROM bk WHERE status IN ('pending','confirmed','in_progress','completed')),
    (SELECT count(*) FROM bk WHERE starts_at >= now() AND status IN ('pending','confirmed','in_progress')),
    (SELECT count(*) FROM bk WHERE status = 'completed'),
    (SELECT COALESCE(sum(duration_minutes), 0) FROM bk WHERE status = 'completed'),
    (SELECT COALESCE(sum(amount), 0) FROM pay
      WHERE status IN ('paid','settled'::text::payment_status) AND paid_at >= date_trunc('month', now())),
    (SELECT currency FROM pay ORDER BY created_at DESC LIMIT 1),
    (SELECT COALESCE(sum(amount), 0) FROM pay WHERE status IN ('pending','processing','failed')),
    (SELECT currency FROM pay WHERE status IN ('pending','processing','failed') ORDER BY created_at DESC LIMIT 1),
    (SELECT count(*) FROM pay WHERE status IN ('pending','processing','failed')),
    (SELECT CASE WHEN count(*) = 0 THEN NULL
                 ELSE round(100.0 * count(*) FILTER (WHERE student_attended) / count(*), 1) END FROM att),
    (SELECT count(*) FROM bk WHERE status = 'pending' AND booked_by <> (SELECT uid FROM me));
$$;

-- 3. Per-child learning progress by subject
CREATE OR REPLACE FUNCTION public.parent_child_progress(p_student_id uuid)
RETURNS TABLE (
  subject_id uuid,
  subject_name text,
  completed_lessons bigint,
  scheduled_lessons bigint,
  learning_minutes bigint,
  attended_count bigint,
  missed_count bigint,
  cancelled_count bigint,
  avg_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id,
         COALESCE(s.name, 'Unassigned subject'),
         count(*) FILTER (WHERE b.status = 'completed'),
         count(*) FILTER (WHERE b.status IN ('pending','confirmed','in_progress')),
         COALESCE(sum(b.duration_minutes) FILTER (WHERE b.status = 'completed'), 0),
         count(*) FILTER (WHERE cs.student_attended IS TRUE),
         count(*) FILTER (WHERE cs.student_attended IS FALSE OR b.status = 'no_show'),
         count(*) FILTER (WHERE b.status = 'cancelled'),
         round(avg(r.score)::numeric, 2)
  FROM bookings b
  LEFT JOIN subjects s ON s.id = b.subject_id
  LEFT JOIN class_sessions cs ON cs.booking_id = b.id
  LEFT JOIN ratings r ON r.booking_id = b.id
  WHERE b.student_id = p_student_id
    AND public.can_access_student(p_student_id)
  GROUP BY s.id, s.name
  ORDER BY 2;
$$;

-- 4. Tutor available slots, clash-free, with the tutor's own timezone
CREATE OR REPLACE FUNCTION public.tutor_available_slots(
  p_tutor_id uuid,
  p_from timestamptz DEFAULT now(),
  p_days integer DEFAULT 14,
  p_duration_minutes integer DEFAULT 60
)
RETURNS TABLE (starts_at timestamptz, ends_at timestamptz, tutor_timezone text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w record;
  i integer;
  local_day date;
  slot_start timestamptz;
  slot_end timestamptz;
  window_end timestamptz;
  dur integer := COALESCE(NULLIF(p_duration_minutes, 0), 60);
BEGIN
  IF dur < 15 THEN dur := 15; END IF;
  FOR i IN 0..GREATEST(COALESCE(p_days, 14), 1) - 1 LOOP
    FOR w IN
      SELECT aw.day_of_week, aw.start_time, aw.end_time, aw.timezone
      FROM availability_windows aw
      WHERE aw.tutor_id = p_tutor_id AND aw.is_active
    LOOP
      local_day := ((p_from AT TIME ZONE w.timezone)::date) + i;
      CONTINUE WHEN EXTRACT(dow FROM local_day)::int <> w.day_of_week;
      slot_start := (local_day + w.start_time) AT TIME ZONE w.timezone;
      window_end := (local_day + w.end_time) AT TIME ZONE w.timezone;
      LOOP
        slot_end := slot_start + make_interval(mins => dur);
        EXIT WHEN slot_end > window_end;
        IF slot_start > now() AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.tutor_id = p_tutor_id
            AND b.status NOT IN ('cancelled','rejected')
            AND tstzrange(b.starts_at, b.ends_at) && tstzrange(slot_start, slot_end)
        ) THEN
          starts_at := slot_start;
          ends_at := slot_end;
          tutor_timezone := w.timezone;
          RETURN NEXT;
        END IF;
        slot_start := slot_end;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

-- 5. Config-driven booking price quote
CREATE OR REPLACE FUNCTION public.booking_quote(p_tutor_id uuid, p_duration_minutes integer)
RETURNS TABLE (
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t record;
  rule record;
  dur integer := COALESCE(NULLIF(p_duration_minutes, 0), 60);
  lesson numeric := 0;
  pf numeric := 0;
  proc numeric := 0;
  comm numeric := 0;
  proc_pct numeric := 0;
  proc_fixed numeric := 0;
BEGIN
  SELECT tt.hourly_rate, tt.currency, tt.agency_id INTO t FROM tutors tt WHERE tt.id = p_tutor_id;
  IF t IS NULL OR t.hourly_rate IS NULL THEN RETURN; END IF;

  lesson := round(t.hourly_rate * dur / 60.0, 2);

  SELECT cr.* INTO rule
  FROM commission_rules cr
  WHERE cr.is_active
    AND cr.applies_to = 'tutor'
    AND (cr.agency_id IS NULL OR cr.agency_id = t.agency_id)
    AND (cr.currency IS NULL OR cr.currency = t.currency)
    AND cr.effective_from <= now()
    AND (cr.effective_to IS NULL OR cr.effective_to > now())
  ORDER BY (cr.agency_id IS NOT NULL) DESC, cr.priority DESC
  LIMIT 1;

  IF rule IS NOT NULL THEN
    pf := round(lesson * COALESCE(rule.platform_fee_percentage, 0) / 100.0, 2)
          + COALESCE(rule.platform_fee_fixed, 0);
    comm := CASE rule.model
      WHEN 'percentage' THEN round(lesson * COALESCE(rule.percentage, 0) / 100.0, 2)
      WHEN 'fixed' THEN COALESCE(rule.fixed_amount, 0)
      ELSE 0
    END;
  END IF;

  SELECT COALESCE((value #>> '{}')::numeric, 0) INTO proc_pct
  FROM platform_settings WHERE key = 'payments.processing_fee_percentage';
  SELECT COALESCE((value #>> '{}')::numeric, 0) INTO proc_fixed
  FROM platform_settings WHERE key = 'payments.processing_fee_fixed';
  proc := round(lesson * COALESCE(proc_pct, 0) / 100.0, 2) + COALESCE(proc_fixed, 0);

  currency := t.currency;
  hourly_rate := t.hourly_rate;
  duration_minutes := dur;
  lesson_amount := lesson;
  platform_fee := pf;
  processing_fee := proc;
  commission_amount := comm;
  total_amount := lesson + pf + proc;
  commission_rule_id := rule.id;
  SELECT cp.id INTO cancellation_policy_id
  FROM cancellation_policies cp
  WHERE cp.is_active AND cp.is_default
  ORDER BY cp.created_at LIMIT 1;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_tutor_cards(uuid[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.parent_dashboard_summary() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.parent_child_progress(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tutor_available_slots(uuid, timestamptz, integer, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.booking_quote(uuid, integer) TO anon, authenticated, service_role;