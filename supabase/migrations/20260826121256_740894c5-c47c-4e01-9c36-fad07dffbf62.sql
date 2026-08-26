-- Trigger-only functions: not callable via the API
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Split anon/authenticated reads so anon never evaluates is_admin()
DROP POLICY "curricula_public_read" ON public.curricula;
DROP POLICY "levels_public_read" ON public.education_levels;
DROP POLICY "subjects_public_read" ON public.subjects;
DROP POLICY "vsteps_read" ON public.verification_steps;

CREATE POLICY "curricula_anon_read" ON public.curricula FOR SELECT TO anon USING (is_active);
CREATE POLICY "curricula_auth_read" ON public.curricula FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "levels_anon_read" ON public.education_levels FOR SELECT TO anon USING (is_active);
CREATE POLICY "levels_auth_read" ON public.education_levels FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "subjects_anon_read" ON public.subjects FOR SELECT TO anon USING (is_active);
CREATE POLICY "subjects_auth_read" ON public.subjects FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "vsteps_anon_read" ON public.verification_steps FOR SELECT TO anon USING (is_active);
CREATE POLICY "vsteps_auth_read" ON public.verification_steps FOR SELECT TO authenticated USING (is_active OR public.is_admin());

-- Helper predicates are needed by RLS for signed-in users only
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_tutor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_student(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_tutor(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_student(uuid) TO authenticated, service_role;