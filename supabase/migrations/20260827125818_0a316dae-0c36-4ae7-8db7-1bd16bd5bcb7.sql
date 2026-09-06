revoke execute on function public.current_tutor_id() from public, anon;
revoke execute on function public.tutor_dashboard_summary() from public, anon;
revoke execute on function public.tutor_bookings(timestamptz, timestamptz, public.booking_status[], integer, integer) from public, anon;
revoke execute on function public.tutor_students(integer, integer) from public, anon;
revoke execute on function public.tutor_respond_booking(uuid, boolean) from public, anon;
revoke execute on function public.tutor_submit_verification() from public, anon;
revoke execute on function public.ensure_tutor_record() from public, anon;
revoke execute on function public.enforce_tutor_verification_rules() from public, anon, authenticated;