-- Email for every event that previously only appeared in-app.
--
-- Seven triggers had an `in_app` row and no `email` row, so anyone who was not
-- looking at the app when something happened to them simply never found out: a
-- tutor did not know a lesson had been requested or cancelled, and a learner
-- did not know homework had been set. Each of these mirrors the in-app wording
-- for the same key and uses the same variables, so the two channels cannot
-- drift into saying different things about one event.
--
-- `EMAIL_TRIGGERS` in the API is the matching allow-list; sendTemplate refuses
-- a key that is not on it. Both halves change together or neither works.
--
-- Copy lives here so it can be reworded without a deploy.
--
-- Re-runnable, but NOT via `on conflict do nothing`: the unique constraint is
-- (trigger_key, channel, audience) and two of these rows have a null audience,
-- which in PostgreSQL never conflicts with another null. `on conflict` would
-- silently insert a second copy every time this ran. The explicit `not exists`
-- below treats null as the same audience, which is what was meant.

insert into public.notification_templates
  (trigger_key, channel, audience, subject, body, variables, description)
select v.trigger_key, v.channel::public.notification_channel,
       v.audience::public.app_role,
       v.subject, v.body, v.variables::jsonb, v.description
from (values
  (
    'booking.created', 'email', 'tutor',
    'New lesson request from {{student_name}}',
    'New booking request from {{student_name}} for {{subject}} on {{starts_at}}. Accept or decline it from your classes page.',
    '["student_name","subject","starts_at"]',
    'Sent to the tutor when a family requests a lesson.'
  ),
  (
    'booking.cancelled', 'email', null,
    'A lesson was cancelled',
    'The {{subject}} lesson on {{starts_at}} was cancelled. {{refund_note}}',
    '["subject","starts_at","refund_note"]',
    'Sent when a booking is cancelled.'
  ),
  (
    'tutor.verification_updated', 'email', 'tutor',
    'Your verification was reviewed',
    'Your verification step "{{step_name}}" is now {{status}}.',
    '["step_name","status"]',
    'Sent to the tutor when one verification step is reviewed.'
  ),
  (
    'tutor.verification_approved', 'email', 'tutor',
    'You''re verified',
    'Your profile has been approved. You''re now listed in tutor search and families can book you.',
    '[]',
    'Sent to the tutor when an admin approves their verification.'
  ),
  (
    'tutor.verification_rejected', 'email', 'tutor',
    'Your verification needs changes',
    'Our team reviewed your profile and needs some changes before approving it. Open your verification page to see what to fix.',
    '[]',
    'Sent to the tutor when an admin rejects their verification.'
  ),
  (
    'assignment.assigned', 'email', 'student',
    'New assignment: {{title}}',
    '{{tutor_name}} assigned "{{title}}". Due {{due_at}}.',
    '["title","tutor_name","due_at"]',
    'Sent to the learner when a tutor sets homework.'
  ),
  (
    'message.received', 'email', null,
    'New message from {{sender_name}}',
    '{{sender_name}} sent you a message: {{preview}}',
    '["sender_name","preview"]',
    'Sent when a new message arrives in a conversation.'
  )
) as v(trigger_key, channel, audience, subject, body, variables, description)
where not exists (
  select 1 from public.notification_templates t
  where t.trigger_key = v.trigger_key
    and t.channel::text = v.channel
    and t.audience is not distinct from v.audience::public.app_role
);
