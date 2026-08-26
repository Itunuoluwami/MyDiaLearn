CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','rejected','no_show');
CREATE TYPE public.payment_status AS ENUM ('pending','processing','paid','failed','refunded','partially_refunded');
CREATE TYPE public.commission_model AS ENUM ('percentage','fixed','tiered');
CREATE TYPE public.notification_channel AS ENUM ('in_app','email','sms','push');

-- ============ SETTINGS ============
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  group_name TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "settings_anon_read" ON public.platform_settings FOR SELECT TO anon USING (is_public);
CREATE POLICY "settings_auth_read" ON public.platform_settings FOR SELECT TO authenticated USING (is_public OR public.is_admin());
CREATE POLICY "settings_admin_write" ON public.platform_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_payout_currency BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.currencies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.currencies TO authenticated;
GRANT ALL ON public.currencies TO service_role;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "currencies_anon_read" ON public.currencies FOR SELECT TO anon USING (is_active);
CREATE POLICY "currencies_auth_read" ON public.currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "currencies_admin_write" ON public.currencies FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL REFERENCES public.currencies(code) ON DELETE CASCADE,
  quote_currency TEXT NOT NULL REFERENCES public.currencies(code) ON DELETE CASCADE,
  rate NUMERIC(18,8) NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (base_currency, quote_currency, effective_from)
);
GRANT SELECT ON public.exchange_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_rates TO authenticated;
GRANT ALL ON public.exchange_rates TO service_role;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates_anon_read" ON public.exchange_rates FOR SELECT TO anon USING (true);
CREATE POLICY "rates_auth_read" ON public.exchange_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "rates_admin_write" ON public.exchange_rates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model public.commission_model NOT NULL DEFAULT 'percentage',
  percentage NUMERIC(6,3),
  fixed_amount NUMERIC(12,2),
  tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  platform_fee_percentage NUMERIC(6,3) NOT NULL DEFAULT 0,
  platform_fee_fixed NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT REFERENCES public.currencies(code) ON DELETE SET NULL,
  applies_to public.app_role NOT NULL DEFAULT 'tutor',
  agency_id UUID REFERENCES public.tutor_agencies(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_rules TO authenticated;
GRANT ALL ON public.commission_rules TO service_role;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER commission_rules_updated_at BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "commission_auth_read" ON public.commission_rules FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "commission_admin_write" ON public.commission_rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hours_before INTEGER NOT NULL DEFAULT 24,
  refund_percentage NUMERIC(6,3) NOT NULL DEFAULT 100,
  tutor_compensation_percentage NUMERIC(6,3) NOT NULL DEFAULT 0,
  applies_to public.app_role,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cancellation_policies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cancellation_policies TO authenticated;
GRANT ALL ON public.cancellation_policies TO service_role;
ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cancellation_policies_updated_at BEFORE UPDATE ON public.cancellation_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "cancel_anon_read" ON public.cancellation_policies FOR SELECT TO anon USING (is_active);
CREATE POLICY "cancel_auth_read" ON public.cancellation_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "cancel_admin_write" ON public.cancellation_policies FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ AVAILABILITY & BOOKINGS ============
CREATE TABLE public.availability_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT availability_time_order CHECK (end_time > start_time)
);
GRANT SELECT ON public.availability_windows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_windows TO authenticated;
GRANT ALL ON public.availability_windows TO service_role;
ALTER TABLE public.availability_windows ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER availability_updated_at BEFORE UPDATE ON public.availability_windows FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "availability_anon_read" ON public.availability_windows FOR SELECT TO anon USING (is_active);
CREATE POLICY "availability_auth_read" ON public.availability_windows FOR SELECT TO authenticated USING (true);
CREATE POLICY "availability_owner_write" ON public.availability_windows FOR ALL TO authenticated USING (public.owns_tutor(tutor_id) OR public.is_admin()) WITH CHECK (public.owns_tutor(tutor_id) OR public.is_admin());

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET DEFAULT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  education_level_id UUID REFERENCES public.education_levels(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  booking_timezone TEXT NOT NULL DEFAULT 'UTC',
  hourly_rate NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' REFERENCES public.currencies(code) ON DELETE SET DEFAULT,
  total_amount NUMERIC(12,2) NOT NULL,
  commission_rule_id UUID REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  cancellation_policy_id UUID REFERENCES public.cancellation_policies(id) ON DELETE SET NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  student_notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_time_order CHECK (ends_at > starts_at)
);
-- data-layer guarantee: no overlapping active bookings for a tutor or a student
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_tutor_overlap
  EXCLUDE USING gist (
    tutor_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('pending','confirmed','in_progress'));
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_student_overlap
  EXCLUDE USING gist (
    student_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('pending','confirmed','in_progress'));
CREATE INDEX bookings_tutor_starts_idx ON public.bookings (tutor_id, starts_at);
CREATE INDEX bookings_student_starts_idx ON public.bookings (student_id, starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.can_access_booking(_booking_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = _booking_id
      AND (b.booked_by = auth.uid()
        OR public.can_access_student(b.student_id)
        OR public.owns_tutor(b.tutor_id))
  );
$$;
REVOKE ALL ON FUNCTION public.can_access_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_booking(uuid) TO authenticated, service_role;

CREATE POLICY "bookings_read" ON public.bookings FOR SELECT TO authenticated
  USING (booked_by = auth.uid() OR public.can_access_student(student_id) OR public.owns_tutor(tutor_id) OR public.is_admin());
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (booked_by = auth.uid() AND (public.can_access_student(student_id) OR public.is_admin()));
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE TO authenticated
  USING (booked_by = auth.uid() OR public.can_access_student(student_id) OR public.owns_tutor(tutor_id) OR public.is_admin())
  WITH CHECK (booked_by = auth.uid() OR public.can_access_student(student_id) OR public.owns_tutor(tutor_id) OR public.is_admin());
CREATE POLICY "bookings_admin_delete" ON public.bookings FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  meeting_url TEXT,
  meeting_provider TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  student_attended BOOLEAN,
  tutor_attended BOOLEAN,
  tutor_notes TEXT,
  homework TEXT,
  recording_url TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_sessions TO authenticated;
GRANT ALL ON public.class_sessions TO service_role;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER class_sessions_updated_at BEFORE UPDATE ON public.class_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "sessions_read" ON public.class_sessions FOR SELECT TO authenticated USING (public.can_access_booking(booking_id) OR public.is_admin());
CREATE POLICY "sessions_write" ON public.class_sessions FOR ALL TO authenticated USING (public.can_access_booking(booking_id) OR public.is_admin()) WITH CHECK (public.can_access_booking(booking_id) OR public.is_admin());

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' REFERENCES public.currencies(code) ON DELETE SET DEFAULT,
  platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tutor_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rule_id UUID REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  exchange_rate NUMERIC(18,8),
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_reference TEXT,
  paid_at TIMESTAMPTZ,
  refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "payments_read" ON public.payments FOR SELECT TO authenticated
  USING (payer_id = auth.uid() OR (tutor_id IS NOT NULL AND public.owns_tutor(tutor_id)) OR public.is_admin());
CREATE POLICY "payments_admin_write" ON public.payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER ratings_updated_at BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "ratings_anon_read" ON public.ratings FOR SELECT TO anon USING (is_published);
CREATE POLICY "ratings_auth_read" ON public.ratings FOR SELECT TO authenticated
  USING (is_published OR rater_id = auth.uid() OR public.owns_tutor(tutor_id) OR public.is_admin());
CREATE POLICY "ratings_insert_own" ON public.ratings FOR INSERT TO authenticated WITH CHECK (rater_id = auth.uid());
CREATE POLICY "ratings_update_own" ON public.ratings FOR UPDATE TO authenticated USING (rater_id = auth.uid() OR public.is_admin()) WITH CHECK (rater_id = auth.uid() OR public.is_admin());
CREATE POLICY "ratings_delete" ON public.ratings FOR DELETE TO authenticated USING (rater_id = auth.uid() OR public.is_admin());

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_key TEXT NOT NULL,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  audience public.app_role,
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trigger_key, channel, audience)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO authenticated;
GRANT ALL ON public.notification_templates TO service_role;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "templates_admin_all" ON public.notification_templates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  trigger_key TEXT,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  link TEXT,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_admin_write" ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SEED ============
INSERT INTO public.currencies (code, name, symbol, is_active, is_payout_currency, sort_order) VALUES
  ('USD','US Dollar','$',true,true,1),
  ('GBP','British Pound','£',true,false,2),
  ('EUR','Euro','€',true,false,3),
  ('CAD','Canadian Dollar','CA$',true,false,4),
  ('NGN','Nigerian Naira','₦',true,true,5),
  ('KES','Kenyan Shilling','KSh',true,true,6),
  ('GHS','Ghanaian Cedi','₵',true,true,7),
  ('ZAR','South African Rand','R',true,true,8);

INSERT INTO public.commission_rules (name, model, percentage, platform_fee_percentage, currency, applies_to, priority, notes) VALUES
  ('Default tutor commission','percentage',18.000,2.500,'USD','tutor',0,'Applies when no more specific rule matches'),
  ('Agency partner commission','percentage',12.000,2.500,'USD','agency',10,'Reduced rate for verified agency partners');

INSERT INTO public.cancellation_policies (name, hours_before, refund_percentage, tutor_compensation_percentage, description, is_default) VALUES
  ('Flexible (24 hours)',24,100,0,'Full refund when cancelled at least 24 hours before the lesson',true),
  ('Late cancellation (under 24 hours)',0,50,50,'Half refund; tutor is compensated for reserved time',false);

INSERT INTO public.notification_templates (trigger_key, channel, audience, subject, body, variables, description) VALUES
  ('account.otp_verification','email',NULL,'Verify your DiaLearn email','Hello {{full_name}}, your DiaLearn verification code is {{otp_code}}. It expires in {{expiry_minutes}} minutes.','["full_name","otp_code","expiry_minutes"]','Sent when a new account needs email verification'),
  ('account.welcome','email',NULL,'Welcome to DiaLearn','Welcome {{full_name}}! Your {{role}} account is ready. Learn. Grow. Go Global.','["full_name","role"]','Sent after successful verification'),
  ('student.linked','in_app','parent',NULL,'{{student_name}} has been added to your family account.','["student_name"]','Sent to a parent after linking a child profile'),
  ('booking.created','in_app','tutor',NULL,'New booking request from {{student_name}} for {{subject}} on {{starts_at}}.','["student_name","subject","starts_at"]','Sent to a tutor on a new booking request'),
  ('booking.confirmed','email','parent','Your lesson is confirmed','{{tutor_name}} confirmed the {{subject}} lesson for {{student_name}} on {{starts_at}}.','["tutor_name","subject","student_name","starts_at"]','Sent when a tutor confirms a booking'),
  ('booking.cancelled','in_app',NULL,NULL,'The {{subject}} lesson on {{starts_at}} was cancelled. {{refund_note}}','["subject","starts_at","refund_note"]','Sent to all participants when a booking is cancelled'),
  ('booking.reminder','email',NULL,'Your lesson starts soon','Reminder: {{subject}} with {{tutor_name}} starts at {{starts_at}}.','["subject","tutor_name","starts_at"]','Sent before a lesson begins'),
  ('payment.succeeded','email','parent','Payment received','We received {{amount}} {{currency}} for the {{subject}} lesson.','["amount","currency","subject"]','Sent after a successful payment'),
  ('payout.sent','email','tutor','Your payout is on the way','A payout of {{amount}} {{currency}} has been sent.','["amount","currency"]','Sent when a tutor payout is processed'),
  ('tutor.verification_updated','in_app','tutor',NULL,'Your verification step "{{step_name}}" is now {{status}}.','["step_name","status"]','Sent when a verification step changes status');

INSERT INTO public.platform_settings (key, value, label, description, group_name, is_public) VALUES
  ('brand.tagline','"Learn. Grow. Go Global."','Brand tagline','Shown across the public site','branding',true),
  ('booking.default_duration_minutes','60','Default lesson duration','Default lesson length in minutes','booking',true),
  ('booking.allowed_durations','[30,45,60,90,120]','Allowed lesson durations','Selectable lesson lengths in minutes','booking',true),
  ('booking.min_notice_hours','12','Minimum booking notice','How far ahead a lesson must be booked','booking',true),
  ('booking.max_advance_days','60','Maximum booking horizon','How far ahead lessons can be booked','booking',true),
  ('auth.otp_expiry_minutes','10','OTP expiry','Minutes before an email verification code expires','auth',false),
  ('auth.account_types','["student","parent","tutor","agency"]','Self-serve account types','Account types that can be created at sign-up','auth',true),
  ('money.base_currency','"USD"','Base currency','Currency used for internal accounting','money',true),
  ('content.trending_searches','["IGCSE Maths","WAEC English","A-Level Physics","Yoruba for beginners"]','Trending searches','Editable trending searches on the public site','content',true),
  ('content.hero_video_url','""','Hero video URL','Embedded video on the public home page','content',true);