CREATE OR REPLACE FUNCTION public.parent_dashboard_summary()
 RETURNS TABLE(active_students bigint, active_tutors bigint, upcoming_classes bigint, completed_lessons bigint, learning_minutes bigint, month_spend numeric, month_spend_currency text, outstanding_amount numeric, outstanding_currency text, outstanding_count bigint, attendance_rate numeric, pending_approvals bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      WHERE status = 'paid' AND paid_at >= date_trunc('month', now())),
    (SELECT currency FROM pay ORDER BY created_at DESC LIMIT 1),
    (SELECT COALESCE(sum(amount), 0) FROM pay WHERE status IN ('pending','processing','failed')),
    (SELECT currency FROM pay WHERE status IN ('pending','processing','failed') ORDER BY created_at DESC LIMIT 1),
    (SELECT count(*) FROM pay WHERE status IN ('pending','processing','failed')),
    (SELECT CASE WHEN count(*) = 0 THEN NULL
                 ELSE round(100.0 * count(*) FILTER (WHERE student_attended) / count(*), 1) END FROM att),
    (SELECT count(*) FROM bk WHERE status = 'pending' AND booked_by <> (SELECT uid FROM me));
$function$;