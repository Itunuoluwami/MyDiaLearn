-- Public browse/discovery API: security-definer readers that expose ONLY
-- safe columns for verified, listed tutors. profiles stays unreadable to anon.

CREATE OR REPLACE FUNCTION public.public_tutor_search(
  p_q text DEFAULT NULL,
  p_subject uuid DEFAULT NULL,
  p_curriculum uuid DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_level uuid DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_min_rating numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_sort text DEFAULT 'top_rated',
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  country_code text,
  headline text,
  hourly_rate numeric,
  currency text,
  years_experience integer,
  languages jsonb,
  rating_avg numeric,
  rating_count bigint,
  subjects text[],
  created_at timestamptz,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
      ) AS subjects
    FROM tutors t
    JOIN profiles p ON p.id = t.profile_id
    LEFT JOIN ratings r ON r.tutor_id = t.id
    LEFT JOIN tutor_subjects ts ON ts.tutor_id = t.id
    LEFT JOIN subjects s ON s.id = ts.subject_id AND s.is_active
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
        JOIN education_levels el ON el.id = x.education_level_id
        WHERE x.tutor_id = t.id AND el.curriculum_id = p_curriculum))
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
    f.subjects, f.created_at, COUNT(*) OVER () AS total_count
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
$$;

CREATE OR REPLACE FUNCTION public.public_tutor_detail(p_tutor_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  country_code text,
  headline text,
  biography text,
  qualifications jsonb,
  languages jsonb,
  hourly_rate numeric,
  currency text,
  years_experience integer,
  intro_video_url text,
  timezone text,
  agency_name text,
  rating_avg numeric,
  rating_count bigint,
  subjects text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    p.full_name,
    p.avatar_url,
    p.country_code,
    t.headline,
    t.biography,
    t.qualifications,
    t.languages,
    t.hourly_rate,
    t.currency,
    t.years_experience,
    t.intro_video_url,
    t.timezone,
    a.name AS agency_name,
    COALESCE(AVG(r.score) FILTER (WHERE r.is_published), 0)::numeric AS rating_avg,
    COUNT(r.id) FILTER (WHERE r.is_published) AS rating_count,
    COALESCE(ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}'::text[]) AS subjects
  FROM tutors t
  JOIN profiles p ON p.id = t.profile_id
  LEFT JOIN tutor_agencies a ON a.id = t.agency_id AND a.is_active
  LEFT JOIN ratings r ON r.tutor_id = t.id
  LEFT JOIN tutor_subjects ts ON ts.tutor_id = t.id
  LEFT JOIN subjects s ON s.id = ts.subject_id AND s.is_active
  WHERE t.id = p_tutor_id
    AND t.is_listed
    AND t.verification_status = 'verified'
  GROUP BY t.id, p.full_name, p.avatar_url, p.country_code, a.name
$$;

CREATE OR REPLACE FUNCTION public.public_tutor_reviews(p_tutor_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  score smallint,
  comment text,
  created_at timestamptz,
  reviewer_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.score,
    r.comment,
    r.created_at,
    COALESCE(NULLIF(SPLIT_PART(COALESCE(p.full_name, ''), ' ', 1), ''), 'DiaLearn family') AS reviewer_name
  FROM ratings r
  JOIN tutors t ON t.id = r.tutor_id
  LEFT JOIN profiles p ON p.id = r.rater_id
  WHERE r.tutor_id = p_tutor_id
    AND r.is_published
    AND t.is_listed
    AND t.verification_status = 'verified'
  ORDER BY r.created_at DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 10), 50), 1)
$$;

CREATE OR REPLACE FUNCTION public.public_subject_facets()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  icon text,
  category text,
  tutor_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id, s.name, s.slug, s.icon, s.category,
    COUNT(DISTINCT t.id) AS tutor_count
  FROM subjects s
  LEFT JOIN tutor_subjects ts ON ts.subject_id = s.id
  LEFT JOIN tutors t ON t.id = ts.tutor_id AND t.is_listed AND t.verification_status = 'verified'
  WHERE s.is_active
  GROUP BY s.id, s.name, s.slug, s.icon, s.category, s.sort_order
  ORDER BY s.sort_order, s.name
$$;

CREATE OR REPLACE FUNCTION public.public_curriculum_facets()
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  country_code text,
  description text,
  tutor_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id, c.name, c.code, c.country_code, c.description,
    COUNT(DISTINCT t.id) AS tutor_count
  FROM curricula c
  LEFT JOIN education_levels el ON el.curriculum_id = c.id
  LEFT JOIN tutor_subjects ts ON ts.education_level_id = el.id
  LEFT JOIN tutors t ON t.id = ts.tutor_id AND t.is_listed AND t.verification_status = 'verified'
  WHERE c.is_active
  GROUP BY c.id, c.name, c.code, c.country_code, c.description, c.sort_order
  ORDER BY c.sort_order, c.name
$$;

CREATE OR REPLACE FUNCTION public.public_country_facets()
RETURNS TABLE (
  country_code text,
  tutor_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.country_code, COUNT(*) AS tutor_count
  FROM tutors t
  JOIN profiles p ON p.id = t.profile_id
  WHERE t.is_listed
    AND t.verification_status = 'verified'
    AND p.country_code IS NOT NULL
  GROUP BY p.country_code
  ORDER BY COUNT(*) DESC, p.country_code
$$;

CREATE OR REPLACE FUNCTION public.public_search_suggestions(p_q text, p_limit integer DEFAULT 8)
RETURNS TABLE (
  kind text,
  id uuid,
  label text,
  sublabel text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM (
    SELECT 'subject'::text AS kind, s.id, s.name AS label, COALESCE(s.category, 'Subject') AS sublabel
    FROM subjects s
    WHERE s.is_active AND p_q IS NOT NULL AND p_q <> '' AND s.name ILIKE '%' || p_q || '%'
    UNION ALL
    SELECT 'curriculum'::text AS kind, c.id, c.name AS label, COALESCE(c.code, 'Curriculum') AS sublabel
    FROM curricula c
    WHERE c.is_active AND p_q IS NOT NULL AND p_q <> '' AND (c.name ILIKE '%' || p_q || '%' OR c.code ILIKE '%' || p_q || '%')
  ) suggestions
  ORDER BY kind, label
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 8), 20), 1)
$$;

REVOKE ALL ON FUNCTION public.public_tutor_search(text, uuid, uuid, text, uuid, text, numeric, numeric, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_tutor_detail(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_tutor_reviews(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_subject_facets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_curriculum_facets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_country_facets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_search_suggestions(text, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.public_tutor_search(text, uuid, uuid, text, uuid, text, numeric, numeric, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_tutor_detail(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_tutor_reviews(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_subject_facets() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_curriculum_facets() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_country_facets() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_search_suggestions(text, integer) TO anon, authenticated;