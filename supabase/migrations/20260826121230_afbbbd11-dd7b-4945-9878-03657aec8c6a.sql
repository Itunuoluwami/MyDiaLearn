-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('student','parent','tutor','agency','admin');
CREATE TYPE public.verification_status AS ENUM ('unverified','pending','in_review','verified','rejected','suspended');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  country_code TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  primary_role public.app_role NOT NULL DEFAULT 'student',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- permissions mapping (no hardcoded role branches in app code)
CREATE TABLE public.permissions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, permission_key)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission_key = _permission
  );
$$;

-- ============ TAXONOMY (admin-editable) ============
CREATE TABLE public.curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country_code TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.education_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (curriculum_id, code)
);
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.verification_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  applies_to public.app_role NOT NULL DEFAULT 'tutor',
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.curricula, public.education_levels, public.subjects, public.verification_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curricula, public.education_levels, public.subjects, public.verification_steps TO authenticated;
GRANT ALL ON public.curricula, public.education_levels, public.subjects, public.verification_steps TO service_role;
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_steps ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER curricula_updated_at BEFORE UPDATE ON public.curricula FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER education_levels_updated_at BEFORE UPDATE ON public.education_levels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER verification_steps_updated_at BEFORE UPDATE ON public.verification_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AGENCIES / TUTORS / STUDENTS ============
CREATE TABLE public.tutor_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  registration_number TEXT,
  country_code TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  about TEXT,
  logo_url TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_agencies TO authenticated;
GRANT SELECT ON public.tutor_agencies TO anon;
GRANT ALL ON public.tutor_agencies TO service_role;
ALTER TABLE public.tutor_agencies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tutor_agencies_updated_at BEFORE UPDATE ON public.tutor_agencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES public.tutor_agencies(id) ON DELETE SET NULL,
  headline TEXT,
  biography TEXT,
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  hourly_rate NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  years_experience INTEGER,
  intro_video_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  is_listed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutors TO authenticated;
GRANT SELECT ON public.tutors TO anon;
GRANT ALL ON public.tutors TO service_role;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tutors_updated_at BEFORE UPDATE ON public.tutors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_tutor(_tutor_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tutors t
    LEFT JOIN public.tutor_agencies a ON a.id = t.agency_id
    WHERE t.id = _tutor_id AND (t.profile_id = auth.uid() OR a.owner_id = auth.uid())
  );
$$;

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  curriculum_id UUID REFERENCES public.curricula(id) ON DELETE SET NULL,
  education_level_id UUID REFERENCES public.education_levels(id) ON DELETE SET NULL,
  school_name TEXT,
  learning_goals TEXT,
  special_needs TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  avatar_url TEXT,
  can_self_login BOOLEAN NOT NULL DEFAULT false,
  can_book_lessons BOOLEAN NOT NULL DEFAULT false,
  can_message_tutors BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT students_owner_present CHECK (parent_id IS NOT NULL OR profile_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.can_access_student(_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = _student_id AND (s.parent_id = auth.uid() OR s.profile_id = auth.uid())
  );
$$;

CREATE TABLE public.tutor_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  education_level_id UUID REFERENCES public.education_levels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, subject_id, education_level_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_subjects TO authenticated;
GRANT SELECT ON public.tutor_subjects TO anon;
GRANT ALL ON public.tutor_subjects TO service_role;
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tutor_verification_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.verification_steps(id) ON DELETE CASCADE,
  status public.verification_status NOT NULL DEFAULT 'pending',
  document_url TEXT,
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, step_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_verification_progress TO authenticated;
GRANT ALL ON public.tutor_verification_progress TO service_role;
ALTER TABLE public.tutor_verification_progress ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tvp_updated_at BEFORE UPDATE ON public.tutor_verification_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ POLICIES ============
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "permissions_read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions_admin_write" ON public.permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "role_permissions_read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_permissions_admin_write" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "curricula_public_read" ON public.curricula FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "curricula_admin_write" ON public.curricula FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "levels_public_read" ON public.education_levels FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "levels_admin_write" ON public.education_levels FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "subjects_public_read" ON public.subjects FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "subjects_admin_write" ON public.subjects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "vsteps_read" ON public.verification_steps FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "vsteps_admin_write" ON public.verification_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "agencies_public_read" ON public.tutor_agencies FOR SELECT TO anon, authenticated USING (verification_status = 'verified' AND is_active);
CREATE POLICY "agencies_owner_read" ON public.tutor_agencies FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "agencies_owner_insert" ON public.tutor_agencies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'agency'));
CREATE POLICY "agencies_owner_update" ON public.tutor_agencies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_admin()) WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "agencies_admin_delete" ON public.tutor_agencies FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "tutors_public_read" ON public.tutors FOR SELECT TO anon, authenticated USING (is_listed AND verification_status = 'verified');
CREATE POLICY "tutors_owner_read" ON public.tutors FOR SELECT TO authenticated USING (public.owns_tutor(id) OR public.is_admin());
CREATE POLICY "tutors_owner_insert" ON public.tutors FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid() AND public.has_role(auth.uid(), 'tutor'));
CREATE POLICY "tutors_owner_update" ON public.tutors FOR UPDATE TO authenticated USING (public.owns_tutor(id) OR public.is_admin()) WITH CHECK (public.owns_tutor(id) OR public.is_admin());
CREATE POLICY "tutors_admin_delete" ON public.tutors FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "students_read" ON public.students FOR SELECT TO authenticated USING (parent_id = auth.uid() OR profile_id = auth.uid() OR public.is_admin());
CREATE POLICY "students_parent_insert" ON public.students FOR INSERT TO authenticated WITH CHECK ((parent_id = auth.uid() AND public.has_role(auth.uid(), 'parent')) OR profile_id = auth.uid() OR public.is_admin());
CREATE POLICY "students_parent_update" ON public.students FOR UPDATE TO authenticated USING (parent_id = auth.uid() OR profile_id = auth.uid() OR public.is_admin()) WITH CHECK (parent_id = auth.uid() OR profile_id = auth.uid() OR public.is_admin());
CREATE POLICY "students_parent_delete" ON public.students FOR DELETE TO authenticated USING (parent_id = auth.uid() OR public.is_admin());

CREATE POLICY "tutor_subjects_public_read" ON public.tutor_subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tutor_subjects_owner_write" ON public.tutor_subjects FOR ALL TO authenticated USING (public.owns_tutor(tutor_id) OR public.is_admin()) WITH CHECK (public.owns_tutor(tutor_id) OR public.is_admin());

CREATE POLICY "tvp_read" ON public.tutor_verification_progress FOR SELECT TO authenticated USING (public.owns_tutor(tutor_id) OR public.is_admin());
CREATE POLICY "tvp_owner_write" ON public.tutor_verification_progress FOR ALL TO authenticated USING (public.owns_tutor(tutor_id) OR public.is_admin()) WITH CHECK (public.owns_tutor(tutor_id) OR public.is_admin());

-- ============ SIGNUP TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  BEGIN
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.app_role;
  EXCEPTION WHEN others THEN
    _role := 'student';
  END;
  IF _role = 'admin' THEN _role := 'student'; END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, country_code, timezone, primary_role)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'full_name',''),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'country_code',''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'timezone',''), 'UTC'),
    _role
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED: permissions + role mapping + starter taxonomy ============
INSERT INTO public.permissions (key, label, description, category) VALUES
  ('tutors.search','Search tutors','Browse and search the tutor marketplace','marketplace'),
  ('bookings.create','Create bookings','Book lessons with a tutor','bookings'),
  ('bookings.cancel','Cancel bookings','Cancel an existing booking','bookings'),
  ('bookings.view_own','View own bookings','View bookings you are part of','bookings'),
  ('students.manage','Manage linked students','Create and manage child student profiles','family'),
  ('payments.manage','Manage payments','Pay for lessons and manage payment methods','payments'),
  ('payouts.view','View payouts','See earnings and payout history','payments'),
  ('tutor_profile.manage','Manage tutor profile','Edit tutor profile, rate and qualifications','tutor'),
  ('agency.manage','Manage agency','Manage agency profile and its tutors','agency'),
  ('sessions.host','Host class sessions','Run and complete lesson sessions','teaching'),
  ('ratings.create','Leave ratings','Rate a tutor after a lesson','marketplace'),
  ('admin.settings','Manage platform settings','Edit subjects, curricula, commissions, templates','admin'),
  ('admin.users','Manage users','View and manage all user accounts','admin'),
  ('admin.verification','Review verifications','Approve or reject tutor verification','admin');

INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('student','tutors.search'),('student','bookings.view_own'),('student','ratings.create'),
  ('parent','tutors.search'),('parent','bookings.create'),('parent','bookings.cancel'),('parent','bookings.view_own'),
  ('parent','students.manage'),('parent','payments.manage'),('parent','ratings.create'),
  ('tutor','tutor_profile.manage'),('tutor','bookings.view_own'),('tutor','sessions.host'),('tutor','payouts.view'),
  ('agency','agency.manage'),('agency','tutor_profile.manage'),('agency','bookings.view_own'),('agency','payouts.view'),
  ('admin','admin.settings'),('admin','admin.users'),('admin','admin.verification'),('admin','tutors.search');

INSERT INTO public.curricula (name, code, country_code, sort_order) VALUES
  ('British (IGCSE / A-Level)','british','GB',1),
  ('American (Common Core / AP)','american','US',2),
  ('Nigerian (WAEC / NECO)','nigerian','NG',3),
  ('Kenyan (CBC)','kenyan','KE',4),
  ('International Baccalaureate','ib',NULL,5),
  ('Canadian','canadian','CA',6);

INSERT INTO public.education_levels (curriculum_id, name, code, sort_order)
SELECT c.id, l.name, l.code, l.sort_order
FROM public.curricula c
CROSS JOIN (VALUES
  ('Primary','primary',1),
  ('Lower Secondary','lower_secondary',2),
  ('Upper Secondary','upper_secondary',3),
  ('Pre-University','pre_university',4)
) AS l(name, code, sort_order);

INSERT INTO public.subjects (name, slug, category, sort_order) VALUES
  ('Mathematics','mathematics','Core',1),
  ('English Language','english-language','Core',2),
  ('Physics','physics','Sciences',3),
  ('Chemistry','chemistry','Sciences',4),
  ('Biology','biology','Sciences',5),
  ('Further Mathematics','further-mathematics','Sciences',6),
  ('French','french','Languages',7),
  ('Yoruba','yoruba','Languages',8),
  ('Swahili','swahili','Languages',9),
  ('Computer Science','computer-science','Technology',10),
  ('Economics','economics','Humanities',11),
  ('History','history','Humanities',12),
  ('African Studies','african-studies','Humanities',13);

INSERT INTO public.verification_steps (name, code, description, applies_to, is_required, sort_order) VALUES
  ('Identity document','identity','Government-issued ID verification','tutor',true,1),
  ('Academic qualifications','qualifications','Degree or teaching certificates','tutor',true,2),
  ('Teaching experience','experience','References or proof of experience','tutor',true,3),
  ('Background check','background_check','Criminal record / child safety check','tutor',true,4),
  ('Intro video review','intro_video','Recorded introduction reviewed by DiaLearn','tutor',false,5),
  ('Live interview','interview','Video interview with the DiaLearn team','tutor',true,6),
  ('Business registration','business_registration','Agency incorporation documents','agency',true,1),
  ('Agency agreement','agency_agreement','Signed partner agreement','agency',true,2);