GRANT SELECT ON public.commission_rules TO anon;

CREATE POLICY commission_anon_read ON public.commission_rules
FOR SELECT TO anon
USING (is_active AND agency_id IS NULL);