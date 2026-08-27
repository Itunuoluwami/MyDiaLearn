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
  WHERE t.id = ANY(p_ids)
    AND (
      (t.is_listed AND t.verification_status = 'verified')
      OR EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.tutor_id = t.id
          AND (b.booked_by = auth.uid() OR public.can_access_student(b.student_id))
      )
    );
$$;