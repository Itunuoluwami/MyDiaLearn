DROP FUNCTION IF EXISTS public.public_tutor_search(text, uuid, uuid, text, uuid, text, numeric, numeric, text, integer, integer);

CREATE OR REPLACE FUNCTION public.public_tutor_search(p_q text DEFAULT NULL::text, p_subject uuid DEFAULT NULL::uuid, p_curriculum uuid DEFAULT NULL::uuid, p_country text DEFAULT NULL::text, p_level uuid DEFAULT NULL::uuid, p_language text DEFAULT NULL::text, p_min_rating numeric DEFAULT NULL::numeric, p_max_price numeric DEFAULT NULL::numeric, p_sort text DEFAULT 'top_rated'::text, p_limit integer DEFAULT 24, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, full_name text, avatar_url text, country_code text, headline text, hourly_rate numeric, currency text, years_experience integer, languages jsonb, rating_avg numeric, rating_count bigint, subjects text[], curricula text[], levels text[], lessons_completed bigint, available_days integer[], availability_timezone text, created_at timestamp with time zone, total_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT
      t.id,
      p.full_name,
      p.avatar_url,
      p.country_code,
      t.headline,
      t.hourly_rate,
      t.currency,
      t.years_experience,
      t.languages,
      t.created_at,
      COALESCE(AVG(r.score) FILTER (WHERE r.is_published), 0)::numeric AS rating_avg,
      COUNT(r.id) FILTER (WHERE r.is_published) AS rating_count,
      COALESCE(
        ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
        '{}'::text[]
      ) AS subjects,
      COALESCE(
        ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL),
        '{}'::text[]
      ) AS curricula,
      COALESCE(
        ARRAY_AGG(DISTINCT el.name) FILTER (WHERE el.name IS NOT NULL),
        '{}'::text[]
      ) AS levels,
      (SELECT COUNT(*) FROM bookings b WHERE b.tutor_id = t.id AND b.status = 'completed') AS lessons_completed,
      COALESCE(
        (SELECT ARRAY_AGG(DISTINCT aw.day_of_week ORDER BY aw.day_of_week)
           FROM availability_windows aw WHERE aw.tutor_id = t.id AND aw.is_active),
        '{}'::integer[]
      ) AS available_days,
      (SELECT aw.timezone FROM availability_windows aw
         WHERE aw.tutor_id = t.id AND aw.is_active LIMIT 1) AS availability_timezone
    FROM tutors t
    JOIN profiles p ON p.id = t.profile_id
    LEFT JOIN ratings r ON r.tutor_id = t.id
    LEFT JOIN tutor_subjects ts ON ts.tutor_id = t.id
    LEFT JOIN subjects s ON s.id = ts.subject_id AND s.is_active
    LEFT JOIN education_levels el ON el.id = ts.education_level_id
    LEFT JOIN curricula c ON c.id = el.curriculum_id
    WHERE t.is_listed
      AND t.verification_status = 'verified'
      AND (p_country IS NULL OR p.country_code = p_country)
      AND (p_max_price IS NULL OR t.hourly_rate IS NULL OR t.hourly_rate <= p_max_price)
      AND (p_language IS NULL OR t.languages ? p_language)
      AND (p_subject IS NULL OR EXISTS (
        SELECT 1 FROM tutor_subjects x WHERE x.tutor_id = t.id AND x.subject_id = p_subject))
      AND (p_level IS NULL OR EXISTS (
        SELECT 1 FROM tutor_subjects x WHERE x.tutor_id = t.id AND x.education_level_id = p_level))
      AND (p_curriculum IS NULL OR EXISTS (
        SELECT 1 FROM tutor_subjects x
        JOIN education_levels el2 ON el2.id = x.education_level_id
        WHERE x.tutor_id = t.id AND el2.curriculum_id = p_curriculum))
      AND (
        p_q IS NULL OR p_q = ''
        OR (COALESCE(t.headline, '') || ' ' || COALESCE(t.biography, '') || ' ' || COALESCE(p.full_name, ''))
             ILIKE '%' || p_q || '%'
        OR EXISTS (
          SELECT 1 FROM tutor_subjects x
          JOIN subjects s2 ON s2.id = x.subject_id
          WHERE x.tutor_id = t.id AND s2.name ILIKE '%' || p_q || '%')
      )
    GROUP BY t.id, p.full_name, p.avatar_url, p.country_code
  ), filtered AS (
    SELECT * FROM base
    WHERE p_min_rating IS NULL OR base.rating_avg >= p_min_rating
  )
  SELECT
    f.id, f.full_name, f.avatar_url, f.country_code, f.headline, f.hourly_rate,
    f.currency, f.years_experience, f.languages, f.rating_avg, f.rating_count,
    f.subjects, f.curricula, f.levels, f.lessons_completed, f.available_days,
    f.availability_timezone, f.created_at, COUNT(*) OVER () AS total_count
  FROM filtered f
  ORDER BY
    (CASE WHEN p_sort = 'price_low' THEN f.hourly_rate END) ASC NULLS LAST,
    (CASE WHEN p_sort = 'price_high' THEN f.hourly_rate END) DESC NULLS LAST,
    (CASE WHEN p_sort = 'experience' THEN f.years_experience END) DESC NULLS LAST,
    (CASE WHEN p_sort = 'newest' THEN f.created_at END) DESC NULLS LAST,
    (CASE WHEN p_sort NOT IN ('price_low', 'price_high', 'experience', 'newest') THEN f.rating_avg END) DESC NULLS LAST,
    f.full_name ASC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 24), 60), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0)
$function$;

GRANT EXECUTE ON FUNCTION public.public_tutor_search(text, uuid, uuid, text, uuid, text, numeric, numeric, text, integer, integer) TO anon, authenticated, service_role;