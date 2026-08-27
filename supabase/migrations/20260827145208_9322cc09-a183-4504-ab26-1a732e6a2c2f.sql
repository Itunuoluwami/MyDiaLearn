revoke all on function public.prevent_booking_overlap() from public, anon, authenticated;
revoke all on function public.confirm_booking_on_payment() from public, anon, authenticated;
revoke all on function public.notify_assignment_assigned() from public, anon, authenticated;
revoke all on function public.notify_message_received() from public, anon, authenticated;
revoke all on function public.render_template(text, jsonb) from public, anon, authenticated;
revoke all on function public.in_conversation(uuid) from public, anon;
grant execute on function public.in_conversation(uuid) to authenticated;
