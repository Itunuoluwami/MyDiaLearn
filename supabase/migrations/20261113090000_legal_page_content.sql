-- Terms and privacy copy, as editable settings rather than page markup.
--
-- Section 41 of the product requirements lists Terms and Privacy among the
-- public pages, and neither existed. The pages now render from these two rows
-- so that whoever owns the wording -- a lawyer, not a developer -- can change
-- it without a deploy, exactly as the homepage copy and notification
-- templates already work.
--
-- The seeded text describes what the platform actually does: what is
-- collected, what is never collected (card details are never seen by
-- DiaLearn), how access is enforced, and how pricing, commission and refunds
-- work. It is deliberately not a finished legal instrument -- the liability
-- and governing-law section says so in as many words -- and
-- `content.legal_reviewed` stays false until someone qualified has signed it
-- off, which is what makes the review banner appear on both pages.
--
-- Idempotent: `on conflict (key) do nothing`, so re-running never overwrites
-- wording that has since been edited.

insert into public.platform_settings (key, value, label, description, group_name, is_public)
values
  (
    'content.privacy_sections',
    '[{"heading": "Who we are", "body": "DiaLearn is operated by Sahara Hub Limited. We connect students living outside Africa with tutors based in Nigeria and other African countries. This notice explains what we hold about you, why, and what you can ask us to do with it."}, {"heading": "What we collect", "body": "Account details you give us: name, email address, phone number, country and timezone. Learner profiles created by a parent: first and last name, date of birth, curriculum, education level, school, learning goals and any special needs the parent chooses to share. Tutor records: biography, qualifications, languages, teaching experience and the verification documents you upload. Activity on the platform: bookings, payments, messages, assignments and submissions, lesson notes, ratings and reviews. Technical records: sign-in events and an audit log of administrative actions."}, {"heading": "What we do not collect", "body": "We never see or store your card details. Payments are handled by our payment provider, and DiaLearn receives only a reference and the outcome. We do not record lessons."}, {"heading": "Why we hold it", "body": "To run the lessons you book: matching you with a tutor, scheduling, taking payment, paying tutors, and giving both sides the classroom, messages and assignments. To keep children safe: verifying tutors, letting parents control what their child can do, and investigating anything reported to us. To meet our legal and accounting obligations."}, {"heading": "Children''s data", "body": "A learner''s profile is created and controlled by their parent or guardian, who decides whether that child can sign in, book lessons or message tutors, and can change this at any time. We ask for the minimum we need to teach a child well. Messages between a learner and a tutor stay inside DiaLearn so there is always a record."}, {"heading": "Who we share it with", "body": "Our payment provider, to take payment and pay tutors. Our email provider, to send booking, payment and verification notices. Our file storage, which holds verification documents and learning materials behind time-limited links. A tutor sees only the learners they teach and only what they need to teach them. We do not sell personal information."}, {"heading": "How we protect it", "body": "Traffic is encrypted in transit. Passwords are hashed with argon2id and never stored in a readable form. Access to data is enforced in the database itself by row-level security, so a request can only reach records that belong to the person making it. Uploaded files are served through signed links that expire. Administrative actions are written to an append-only audit log."}, {"heading": "How long we keep it", "body": "Booking, payment and commission records are kept for as long as our accounting and tax obligations require. Verification documents are kept while a tutor is active on the platform. Messages and lesson records are kept so parents and tutors can refer back to them."}, {"heading": "Your rights", "body": "You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete your account and its data. Email us and we will respond. Where a child''s data is involved, the request should come from the parent or guardian who created the profile."}, {"heading": "Contact", "body": "Write to us through the contact page and mark your message for the attention of the data protection contact."}]'::jsonb,
    'Privacy notice sections',
    'Ordered sections rendered on /privacy. Each item is {heading, body}.',
    'content',
    true
  ),
  (
    'content.terms_sections',
    '[{"heading": "What DiaLearn is", "body": "DiaLearn is a marketplace operated by Sahara Hub Limited. It connects families with independent tutors. Tutors are not employees or agents of Sahara Hub Limited; they contract with you directly, and DiaLearn provides the platform, the payment handling and the verification that sits around that."}, {"heading": "Accounts", "body": "You must give accurate details and keep your password to yourself. A learner under 18 must have an account created and controlled by a parent or guardian, who decides what that learner may do on the platform and is responsible for activity on it."}, {"heading": "Booking and payment", "body": "The price of a lesson is the tutor''s hourly rate for the length you book, plus the payment processing fee shown before you confirm. A lesson is confirmed only when payment has cleared and the tutor has accepted it. The price is fixed at the moment you book: a later change to a tutor''s rate does not change a lesson you have already booked."}, {"heading": "Commission", "body": "DiaLearn takes a commission from each completed lesson. The commission in force is shown to tutors on their earnings page for every lesson, line by line, and may be changed for future lessons."}, {"heading": "Cancellations and refunds", "body": "Refunds follow the cancellation policy attached to the booking, which depends on how far ahead the lesson is cancelled. The current windows are published on the help page and in the booking itself. Where a tutor does not attend, contact us and we will arrange a refund or a credit."}, {"heading": "Tutors", "body": "A tutor may not appear in search until DiaLearn has verified their identity and qualifications. Tutors agree to teach the lessons they accept, to keep to the platform for communication with learners, and to follow our safeguarding expectations. DiaLearn may suspend a tutor whose conduct puts a learner at risk."}, {"heading": "Payouts", "body": "A tutor''s earnings become available according to the settlement policy published on their earnings page. Payouts are requested by the tutor once the available balance reaches the published minimum."}, {"heading": "Conduct", "body": "Do not use DiaLearn to harass anyone, to move a lesson or its payment off the platform, to misrepresent who you are, or to share material you have no right to share. We may suspend an account that does."}, {"heading": "Disputes", "body": "Raise a dispute from the booking it concerns. We will ask both sides for their account, review it, and decide on a refund, a credit or no change."}, {"heading": "Liability and governing law", "body": "These clauses are being prepared with our legal advisers and are not yet published. Until they are, nothing on this page limits any right you have under the law that applies to you."}]'::jsonb,
    'Terms of service sections',
    'Ordered sections rendered on /terms. Each item is {heading, body}.',
    'content',
    true
  ),
  (
    'content.legal_reviewed',
    'false'::jsonb,
    'Legal copy reviewed',
    'Set true once a qualified adviser has approved the terms and privacy wording. While false, both pages show a draft banner.',
    'content',
    true
  )
on conflict (key) do nothing;
