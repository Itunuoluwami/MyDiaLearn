INSERT INTO public.platform_settings (key, label, description, group_name, is_public, value)
VALUES
(
  'auth.countries',
  'Countries & dialling codes',
  'Country selector used by sign-up phone numbers. min_digits/max_digits are national number lengths.',
  'auth',
  true,
  '[
    {"code":"NG","name":"Nigeria","flag":"🇳🇬","dial_code":"+234","min_digits":10,"max_digits":10},
    {"code":"GB","name":"United Kingdom","flag":"🇬🇧","dial_code":"+44","min_digits":9,"max_digits":10},
    {"code":"US","name":"United States","flag":"🇺🇸","dial_code":"+1","min_digits":10,"max_digits":10},
    {"code":"CA","name":"Canada","flag":"🇨🇦","dial_code":"+1","min_digits":10,"max_digits":10},
    {"code":"GH","name":"Ghana","flag":"🇬🇭","dial_code":"+233","min_digits":9,"max_digits":9},
    {"code":"KE","name":"Kenya","flag":"🇰🇪","dial_code":"+254","min_digits":9,"max_digits":9},
    {"code":"ZA","name":"South Africa","flag":"🇿🇦","dial_code":"+27","min_digits":9,"max_digits":9},
    {"code":"GM","name":"Gambia","flag":"🇬🇲","dial_code":"+220","min_digits":7,"max_digits":7},
    {"code":"SL","name":"Sierra Leone","flag":"🇸🇱","dial_code":"+232","min_digits":8,"max_digits":8},
    {"code":"CM","name":"Cameroon","flag":"🇨🇲","dial_code":"+237","min_digits":9,"max_digits":9},
    {"code":"EG","name":"Egypt","flag":"🇪🇬","dial_code":"+20","min_digits":9,"max_digits":10},
    {"code":"UG","name":"Uganda","flag":"🇺🇬","dial_code":"+256","min_digits":9,"max_digits":9},
    {"code":"TZ","name":"Tanzania","flag":"🇹🇿","dial_code":"+255","min_digits":9,"max_digits":9},
    {"code":"RW","name":"Rwanda","flag":"🇷🇼","dial_code":"+250","min_digits":9,"max_digits":9},
    {"code":"ET","name":"Ethiopia","flag":"🇪🇹","dial_code":"+251","min_digits":9,"max_digits":9},
    {"code":"IE","name":"Ireland","flag":"🇮🇪","dial_code":"+353","min_digits":9,"max_digits":9},
    {"code":"FR","name":"France","flag":"🇫🇷","dial_code":"+33","min_digits":9,"max_digits":9},
    {"code":"DE","name":"Germany","flag":"🇩🇪","dial_code":"+49","min_digits":10,"max_digits":11},
    {"code":"NL","name":"Netherlands","flag":"🇳🇱","dial_code":"+31","min_digits":9,"max_digits":9},
    {"code":"IT","name":"Italy","flag":"🇮🇹","dial_code":"+39","min_digits":9,"max_digits":10},
    {"code":"ES","name":"Spain","flag":"🇪🇸","dial_code":"+34","min_digits":9,"max_digits":9},
    {"code":"AE","name":"United Arab Emirates","flag":"🇦🇪","dial_code":"+971","min_digits":9,"max_digits":9},
    {"code":"AU","name":"Australia","flag":"🇦🇺","dial_code":"+61","min_digits":9,"max_digits":9},
    {"code":"NZ","name":"New Zealand","flag":"🇳🇿","dial_code":"+64","min_digits":8,"max_digits":10}
  ]'::jsonb
),
(
  'content.auth_panel',
  'Sign-in / sign-up side panel',
  'Imagery and reassuring copy shown beside the sign-in and sign-up forms.',
  'content',
  true,
  '{
    "headline":"Learning starts with the right support.",
    "body":"Connect with trusted African educators and give every learner the support they need to thrive.",
    "quote":"My daughter finally looks forward to her maths lessons. Her tutor understands both her curriculum and her culture.",
    "author":"Adaeze O.",
    "author_role":"Parent in London",
    "image_url":"/__l5e/assets-v1/placeholder/parent-child.jpg"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public;