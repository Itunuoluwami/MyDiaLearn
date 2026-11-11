-- Notification copy for the two verification decisions that had none.
--
-- `tutor.verification_updated` already covers a single step changing — "Your
-- verification step X is now Y" — but the decision a tutor actually waits for
-- is the overall one, and nothing said it. The admin screens have raised
-- `tutor.verification_approved` and `tutor.verification_rejected` in the audit
-- log since the maker-checker work; these are the matching templates, so the
-- tutor hears the outcome instead of discovering it by reloading a page.
--
-- In-app only, deliberately. Which events also send email is an admin decision
-- expressed by adding an email row, and EMAIL_TRIGGERS in the API is the
-- allow-list that has to agree with it; neither should change silently here.
--
-- Copy lives in this table precisely so it can be reworded without a deploy.
-- `on conflict do nothing` keeps the migration safe to re-run and leaves any
-- wording an admin has already edited alone.

insert into public.notification_templates
  (trigger_key, channel, audience, subject, body, variables, description)
values
  (
    'tutor.verification_approved',
    'in_app',
    'tutor',
    'You''re verified',
    'Your profile has been approved. You''re now listed in tutor search and families can book you.',
    '[]',
    'Sent when an admin approves a tutor''s verification.'
  ),
  (
    'tutor.verification_rejected',
    'in_app',
    'tutor',
    'Your verification needs changes',
    'Our team reviewed your profile and needs some changes before approving it. Open your verification page to see what to fix.',
    '[]',
    'Sent when an admin rejects a tutor''s verification.'
  )
on conflict do nothing;
