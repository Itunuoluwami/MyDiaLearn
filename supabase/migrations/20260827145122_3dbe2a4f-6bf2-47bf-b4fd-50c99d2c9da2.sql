-- ============ enums ============
create type public.resource_type as enum ('pdf','video','link','document','image','other');
create type public.assignment_status as enum ('draft','assigned','submitted','reviewed');
create type public.payout_status as enum ('requested','processing','paid','rejected','cancelled');

-- ============ bookings: payment-gated confirmation + overlap guard ============
alter table public.bookings add column if not exists tutor_accepted_at timestamptz;

create or replace function public.prevent_booking_overlap()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('confirmed','in_progress') then
    if exists (
      select 1 from public.bookings b
      where b.tutor_id = new.tutor_id
        and b.id <> new.id
        and b.status in ('confirmed','in_progress')
        and tstzrange(b.starts_at, b.ends_at) && tstzrange(new.starts_at, new.ends_at)
    ) then
      raise exception 'BOOKING_OVERLAP';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists bookings_prevent_overlap on public.bookings;
create trigger bookings_prevent_overlap before insert or update on public.bookings
for each row execute function public.prevent_booking_overlap();

-- accepting a request requires a validated payment before it becomes confirmed
create or replace function public.tutor_respond_booking(p_booking_id uuid, p_accept boolean)
returns booking_status language plpgsql security definer set search_path = public as $$
declare
  v_tutor uuid := public.current_tutor_id();
  v_row public.bookings;
  v_paid boolean;
begin
  if v_tutor is null then raise exception 'NOT_A_TUTOR'; end if;

  select * into v_row from public.bookings
  where id = p_booking_id and tutor_id = v_tutor for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_row.status <> 'pending' then raise exception 'BOOKING_NOT_PENDING'; end if;

  if not p_accept then
    update public.bookings set status = 'rejected', updated_at = now() where id = v_row.id;
    return 'rejected'::public.booking_status;
  end if;

  if exists (
    select 1 from public.bookings b
    where b.tutor_id = v_tutor and b.id <> v_row.id
      and b.status in ('confirmed','in_progress')
      and tstzrange(b.starts_at, b.ends_at) && tstzrange(v_row.starts_at, v_row.ends_at)
  ) then
    raise exception 'BOOKING_OVERLAP';
  end if;

  select exists (
    select 1 from public.payments p where p.booking_id = v_row.id and p.status = 'paid'
  ) into v_paid;

  update public.bookings
    set tutor_accepted_at = now(),
        status = case when v_paid then 'confirmed'::public.booking_status else v_row.status end,
        updated_at = now()
  where id = v_row.id;

  return case when v_paid then 'confirmed'::public.booking_status else 'pending'::public.booking_status end;
end $$;

-- payment success confirms an accepted booking
create or replace function public.confirm_booking_on_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and new.booking_id is not null then
    update public.bookings b
      set status = 'confirmed', updated_at = now()
    where b.id = new.booking_id
      and b.status = 'pending'
      and b.tutor_accepted_at is not null;
  end if;
  return new;
end $$;

drop trigger if exists payments_confirm_booking on public.payments;
create trigger payments_confirm_booking after insert or update of status on public.payments
for each row execute function public.confirm_booking_on_payment();

-- ============ lesson notes ============
create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  covered text,
  understanding text,
  improvements text,
  next_steps text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.lesson_notes to authenticated;
grant all on public.lesson_notes to service_role;
alter table public.lesson_notes enable row level security;
create policy "Tutors manage their lesson notes" on public.lesson_notes for all to authenticated
  using (public.owns_tutor(tutor_id)) with check (public.owns_tutor(tutor_id));
create policy "Families read lesson notes" on public.lesson_notes for select to authenticated
  using (public.can_access_booking(booking_id));
create policy "Admins read lesson notes" on public.lesson_notes for select to authenticated
  using (public.is_admin());
create trigger lesson_notes_updated_at before update on public.lesson_notes
for each row execute function public.set_updated_at();

-- ============ learning resources ============
create table public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  title text not null,
  description text,
  resource_type public.resource_type not null default 'other',
  storage_path text,
  external_url text,
  subject_id uuid references public.subjects(id),
  student_id uuid references public.students(id) on delete set null,
  mime_type text,
  size_bytes bigint,
  is_shared boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.learning_resources to authenticated;
grant all on public.learning_resources to service_role;
alter table public.learning_resources enable row level security;
create policy "Tutors manage their resources" on public.learning_resources for all to authenticated
  using (public.owns_tutor(tutor_id)) with check (public.owns_tutor(tutor_id));
create policy "Families read shared resources" on public.learning_resources for select to authenticated
  using (is_shared and student_id is not null and public.can_access_student(student_id));
create policy "Admins read resources" on public.learning_resources for select to authenticated
  using (public.is_admin());
create trigger learning_resources_updated_at before update on public.learning_resources
for each row execute function public.set_updated_at();
create index learning_resources_tutor_idx on public.learning_resources(tutor_id, created_at desc);

-- ============ assignments ============
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  subject_id uuid references public.subjects(id),
  title text not null,
  instructions text,
  submission_requirements text,
  due_at timestamptz,
  resource_id uuid references public.learning_resources(id) on delete set null,
  status public.assignment_status not null default 'draft',
  assigned_at timestamptz,
  submission_text text,
  submission_path text,
  submitted_at timestamptz,
  feedback text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.assignments to authenticated;
grant all on public.assignments to service_role;
alter table public.assignments enable row level security;
create policy "Tutors manage their assignments" on public.assignments for all to authenticated
  using (public.owns_tutor(tutor_id)) with check (public.owns_tutor(tutor_id));
create policy "Families read their assignments" on public.assignments for select to authenticated
  using (status <> 'draft' and public.can_access_student(student_id));
create policy "Families submit their assignments" on public.assignments for update to authenticated
  using (status in ('assigned','submitted') and public.can_access_student(student_id))
  with check (public.can_access_student(student_id));
create policy "Admins read assignments" on public.assignments for select to authenticated
  using (public.is_admin());
create trigger assignments_updated_at before update on public.assignments
for each row execute function public.set_updated_at();
create index assignments_tutor_idx on public.assignments(tutor_id, created_at desc);
create index assignments_student_idx on public.assignments(student_id, status);

-- ============ messaging ============
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  booking_id uuid references public.bookings(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  attachment_path text,
  attachment_name text,
  created_at timestamptz not null default now()
);

create or replace function public.in_conversation(_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = _conversation_id and cp.user_id = auth.uid()
  );
$$;

grant select, insert, update on public.conversations to authenticated;
grant all on public.conversations to service_role;
grant select, insert, update on public.conversation_participants to authenticated;
grant all on public.conversation_participants to service_role;
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "Participants read conversations" on public.conversations for select to authenticated
  using (public.in_conversation(id) or public.is_admin());
create policy "Users create conversations" on public.conversations for insert to authenticated
  with check (created_by = auth.uid());
create policy "Participants update conversations" on public.conversations for update to authenticated
  using (public.in_conversation(id)) with check (public.in_conversation(id));

create policy "Participants read participants" on public.conversation_participants for select to authenticated
  using (public.in_conversation(conversation_id) or user_id = auth.uid() or public.is_admin());
create policy "Creators add participants" on public.conversation_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
  );
create policy "Users update own participation" on public.conversation_participants for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Participants read messages" on public.messages for select to authenticated
  using (public.in_conversation(conversation_id) or public.is_admin());
create policy "Participants send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.in_conversation(conversation_id));

create trigger conversations_updated_at before update on public.conversations
for each row execute function public.set_updated_at();
create index messages_conversation_idx on public.messages(conversation_id, created_at desc);

-- ============ payouts ============
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null references public.currencies(code),
  status public.payout_status not null default 'requested',
  reference text,
  notes text,
  requested_at timestamptz not null default now(),
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.payouts to authenticated;
grant all on public.payouts to service_role;
alter table public.payouts enable row level security;
create policy "Tutors read their payouts" on public.payouts for select to authenticated
  using (public.owns_tutor(tutor_id));
create policy "Admins manage payouts" on public.payouts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger payouts_updated_at before update on public.payouts
for each row execute function public.set_updated_at();

-- ============ rating categories ============
create table public.rating_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  applies_to public.app_role not null default 'tutor',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.rating_categories to authenticated, anon;
grant all on public.rating_categories to service_role;
alter table public.rating_categories enable row level security;
create policy "Anyone reads active rating categories" on public.rating_categories for select
  using (is_active or public.is_admin());
create policy "Admins manage rating categories" on public.rating_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger rating_categories_updated_at before update on public.rating_categories
for each row execute function public.set_updated_at();

create table public.rating_category_scores (
  id uuid primary key default gen_random_uuid(),
  rating_id uuid not null references public.ratings(id) on delete cascade,
  category_id uuid not null references public.rating_categories(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  unique (rating_id, category_id)
);
grant select, insert, update, delete on public.rating_category_scores to authenticated;
grant select on public.rating_category_scores to anon;
grant all on public.rating_category_scores to service_role;
alter table public.rating_category_scores enable row level security;
create policy "Read published category scores" on public.rating_category_scores for select
  using (exists (select 1 from public.ratings r where r.id = rating_id and (r.is_published or r.rater_id = auth.uid())));
create policy "Raters manage their category scores" on public.rating_category_scores for all to authenticated
  using (exists (select 1 from public.ratings r where r.id = rating_id and r.rater_id = auth.uid()))
  with check (exists (select 1 from public.ratings r where r.id = rating_id and r.rater_id = auth.uid()));

insert into public.rating_categories (name, code, description, sort_order) values
  ('Teaching quality','teaching_quality','Clarity, structure and pace of lessons',1),
  ('Communication','communication','Responsiveness and clarity outside class',2),
  ('Punctuality','punctuality','Starting and finishing lessons on time',3),
  ('Subject knowledge','subject_knowledge','Depth of expertise in the subject',4),
  ('Engagement','engagement','Keeping the learner motivated and involved',5),
  ('Professionalism','professionalism','Conduct, preparation and safeguarding',6);

-- ============ platform settings for payouts ============
insert into public.platform_settings (key, value, label, description, group_name, is_public) values
  ('payouts.minimum_amount','50','Minimum payout amount','Smallest balance a tutor may request as a payout.','payouts',false),
  ('payouts.schedule_label','"Every second Friday"','Payout schedule','Human-readable payout schedule shown to tutors.','payouts',true),
  ('payouts.settlement_days','5','Settlement days','Working days between payout approval and settlement.','payouts',false),
  ('payouts.next_payout_date','null','Next payout date','ISO date of the next scheduled payout run. Leave null to hide.','payouts',true)
on conflict (key) do nothing;

-- ============ notification templates ============
insert into public.notification_templates (trigger_key, channel, audience, subject, body, variables, description) values
  ('assignment.assigned','in_app','student','New assignment: {{title}}','{{tutor_name}} assigned "{{title}}". Due {{due_at}}.','["title","tutor_name","due_at"]','Sent when a tutor assigns homework.'),
  ('message.received','in_app',null,'New message from {{sender_name}}','{{sender_name}}: {{preview}}','["sender_name","preview"]','Sent when a new message arrives in a conversation.'),
  ('booking.confirmed','in_app',null,'Lesson confirmed','Your lesson with {{counterpart}} on {{starts_at}} is confirmed.','["counterpart","starts_at"]','Sent when payment confirms a lesson.')
on conflict do nothing;

-- ============ notification helpers ============
create or replace function public.render_template(_body text, _vars jsonb)
returns text language plpgsql immutable set search_path = public as $$
declare k text; out text := coalesce(_body,'');
begin
  for k in select jsonb_object_keys(_vars) loop
    out := replace(out, '{{' || k || '}}', coalesce(_vars ->> k, ''));
  end loop;
  return out;
end $$;

create or replace function public.notify_user(_user_id uuid, _trigger_key text, _vars jsonb, _link text)
returns void language plpgsql security definer set search_path = public as $$
declare t record;
begin
  if _user_id is null then return; end if;
  select * into t from public.notification_templates
  where trigger_key = _trigger_key and channel = 'in_app' and is_active limit 1;
  if not found then return; end if;
  insert into public.notifications (user_id, template_id, trigger_key, channel, title, body, data, link, sent_at)
  values (_user_id, t.id, _trigger_key, 'in_app',
          public.render_template(t.subject, _vars),
          public.render_template(t.body, _vars),
          coalesce(_vars,'{}'::jsonb), _link, now());
end $$;

create or replace function public.notify_assignment_assigned()
returns trigger language plpgsql security definer set search_path = public as $$
declare s record; tname text;
begin
  if new.status = 'assigned' and (tg_op = 'INSERT' or old.status is distinct from 'assigned') then
    select st.profile_id, st.parent_id into s from public.students st where st.id = new.student_id;
    select p.full_name into tname from public.tutors t join public.profiles p on p.id = t.profile_id where t.id = new.tutor_id;
    perform public.notify_user(s.profile_id, 'assignment.assigned',
      jsonb_build_object('title', new.title, 'tutor_name', coalesce(tname,'Your tutor'),
                         'due_at', coalesce(to_char(new.due_at,'DD Mon YYYY'),'soon')), '/assignments');
    perform public.notify_user(s.parent_id, 'assignment.assigned',
      jsonb_build_object('title', new.title, 'tutor_name', coalesce(tname,'Your tutor'),
                         'due_at', coalesce(to_char(new.due_at,'DD Mon YYYY'),'soon')), '/assignments');
  end if;
  return new;
end $$;

drop trigger if exists assignments_notify on public.assignments;
create trigger assignments_notify after insert or update of status on public.assignments
for each row execute function public.notify_assignment_assigned();

create or replace function public.notify_message_received()
returns trigger language plpgsql security definer set search_path = public as $$
declare r record; sname text;
begin
  select full_name into sname from public.profiles where id = new.sender_id;
  update public.conversations set last_message_at = new.created_at, updated_at = now() where id = new.conversation_id;
  for r in select user_id from public.conversation_participants
           where conversation_id = new.conversation_id and user_id <> new.sender_id loop
    perform public.notify_user(r.user_id, 'message.received',
      jsonb_build_object('sender_name', coalesce(sname,'A DiaLearn member'),
                         'preview', left(new.body, 120)), '/messages');
  end loop;
  return new;
end $$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify after insert on public.messages
for each row execute function public.notify_message_received();

-- ============ tutor bookings with payment status ============
drop function if exists public.tutor_bookings(timestamptz, timestamptz, booking_status[], integer, integer);
create or replace function public.tutor_bookings(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_statuses booking_status[] default null,
  p_limit integer default 200,
  p_offset integer default 0
) returns table(
  id uuid, starts_at timestamptz, ends_at timestamptz, duration_minutes integer,
  status booking_status, booking_timezone text, currency text, hourly_rate numeric,
  total_amount numeric, student_notes text, student_id uuid, student_first_name text,
  student_avatar_url text, subject_id uuid, subject_name text, education_level_name text,
  tutor_accepted_at timestamptz, payment_status payment_status, payment_amount numeric,
  payment_currency text, cancelled_at timestamptz, cancellation_reason text,
  session_id uuid, has_notes boolean
) language sql stable security definer set search_path = public as $$
  select b.id, b.starts_at, b.ends_at, b.duration_minutes, b.status, b.booking_timezone,
         b.currency, b.hourly_rate, b.total_amount, b.student_notes,
         s.id, s.first_name, s.avatar_url,
         b.subject_id, sub.name, el.name,
         b.tutor_accepted_at,
         pay.status, pay.amount, pay.currency,
         b.cancelled_at, b.cancellation_reason,
         cs.id,
         exists (select 1 from public.lesson_notes ln where ln.booking_id = b.id)
  from public.bookings b
  join public.students s on s.id = b.student_id
  left join public.subjects sub on sub.id = b.subject_id
  left join public.education_levels el on el.id = b.education_level_id
  left join public.class_sessions cs on cs.booking_id = b.id
  left join lateral (
    select p.status, p.amount, p.currency from public.payments p
    where p.booking_id = b.id order by (p.status = 'paid') desc, p.created_at desc limit 1
  ) pay on true
  where b.tutor_id = public.current_tutor_id()
    and (p_from is null or b.ends_at >= p_from)
    and (p_to is null or b.starts_at <= p_to)
    and (p_statuses is null or b.status = any(p_statuses))
  order by b.starts_at
  limit greatest(coalesce(p_limit, 200), 1) offset greatest(coalesce(p_offset, 0), 0);
$$;

-- ============ classroom access ============
create or replace function public.tutor_open_class(p_booking_id uuid)
returns table(session_id uuid, meeting_url text, meeting_provider text, started_at timestamptz,
              ended_at timestamptz, status booking_status, student_first_name text, subject_name text,
              starts_at timestamptz, ends_at timestamptz, duration_minutes integer)
language plpgsql security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id(); v_b public.bookings; v_s public.class_sessions;
begin
  if v_tutor is null then raise exception 'NOT_A_TUTOR'; end if;
  select * into v_b from public.bookings where id = p_booking_id and tutor_id = v_tutor;
  if not found then raise exception 'NOT_AUTHORIZED'; end if;
  if v_b.status not in ('confirmed','in_progress','completed') then raise exception 'CLASS_NOT_READY'; end if;

  select * into v_s from public.class_sessions where booking_id = v_b.id;
  if not found then
    insert into public.class_sessions (booking_id, status) values (v_b.id, v_b.status)
    returning * into v_s;
  end if;

  return query
  select v_s.id, v_s.meeting_url, v_s.meeting_provider, v_s.started_at, v_s.ended_at, v_s.status,
         s.first_name, sub.name, v_b.starts_at, v_b.ends_at, v_b.duration_minutes
  from public.students s
  left join public.subjects sub on sub.id = v_b.subject_id
  where s.id = v_b.student_id;
end $$;

create or replace function public.tutor_start_class(p_booking_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id();
begin
  if v_tutor is null or not exists (select 1 from public.bookings where id = p_booking_id and tutor_id = v_tutor) then
    raise exception 'NOT_AUTHORIZED';
  end if;
  update public.bookings set status = 'in_progress', updated_at = now()
  where id = p_booking_id and status = 'confirmed';
  update public.class_sessions set started_at = coalesce(started_at, now()), status = 'in_progress',
    tutor_attended = true, updated_at = now()
  where booking_id = p_booking_id;
end $$;

create or replace function public.tutor_end_class(p_booking_id uuid, p_student_attended boolean default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id();
begin
  if v_tutor is null or not exists (select 1 from public.bookings where id = p_booking_id and tutor_id = v_tutor) then
    raise exception 'NOT_AUTHORIZED';
  end if;
  update public.class_sessions set ended_at = now(), status = 'completed',
    student_attended = coalesce(p_student_attended, student_attended), updated_at = now()
  where booking_id = p_booking_id;
  update public.bookings set status = 'completed', updated_at = now()
  where id = p_booking_id and status in ('confirmed','in_progress');
end $$;

-- ============ earnings ============
create or replace function public.tutor_earnings_summary()
returns table(currency text, gross_revenue numeric, platform_commission numeric, payment_fees numeric,
              net_earnings numeric, pending_earnings numeric, paid_out numeric, pending_payouts numeric,
              available_balance numeric, minimum_payout numeric, next_payout_date text, schedule_label text)
language plpgsql stable security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id();
begin
  if v_tutor is null then return; end if;
  return query
  with p as (select * from public.payments where tutor_id = v_tutor),
  paid as (select * from p where status = 'paid'),
  po as (select * from public.payouts where tutor_id = v_tutor)
  select
    coalesce((select t.currency from public.tutors t where t.id = v_tutor), 'USD'),
    coalesce((select sum(amount) from paid), 0),
    coalesce((select sum(commission_amount) from paid), 0),
    coalesce((select sum(platform_fee) from paid), 0),
    coalesce((select sum(tutor_payout) from paid), 0),
    coalesce((select sum(tutor_payout) from p where status in ('pending','processing')), 0),
    coalesce((select sum(amount) from po where status = 'paid'), 0),
    coalesce((select sum(amount) from po where status in ('requested','processing')), 0),
    coalesce((select sum(tutor_payout) from paid), 0)
      - coalesce((select sum(amount) from po where status in ('requested','processing','paid')), 0),
    (select (value #>> '{}')::numeric from public.platform_settings where key = 'payouts.minimum_amount'),
    (select value #>> '{}' from public.platform_settings where key = 'payouts.next_payout_date'),
    (select value #>> '{}' from public.platform_settings where key = 'payouts.schedule_label');
end $$;

create or replace function public.tutor_earnings_records(p_limit integer default 50, p_offset integer default 0)
returns table(payment_id uuid, booking_id uuid, occurred_at timestamptz, student_first_name text,
              subject_name text, gross_amount numeric, commission_amount numeric, platform_fee numeric,
              net_amount numeric, currency text, status payment_status, exchange_rate numeric,
              settlement_currency text)
language sql stable security definer set search_path = public as $$
  select p.id, p.booking_id, coalesce(p.paid_at, p.created_at), s.first_name, sub.name,
         p.amount, p.commission_amount, p.platform_fee, p.tutor_payout, p.currency, p.status,
         p.exchange_rate, t.currency
  from public.payments p
  join public.tutors t on t.id = p.tutor_id
  left join public.bookings b on b.id = p.booking_id
  left join public.students s on s.id = b.student_id
  left join public.subjects sub on sub.id = b.subject_id
  where p.tutor_id = public.current_tutor_id()
  order by coalesce(p.paid_at, p.created_at) desc
  limit greatest(coalesce(p_limit, 50), 1) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.tutor_request_payout(p_amount numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id(); v_avail numeric; v_min numeric; v_cur text; v_id uuid;
begin
  if v_tutor is null then raise exception 'NOT_A_TUTOR'; end if;
  select available_balance, minimum_payout, currency into v_avail, v_min, v_cur
  from public.tutor_earnings_summary();
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  if coalesce(v_min, 0) > 0 and p_amount < v_min then raise exception 'BELOW_MINIMUM'; end if;
  if p_amount > coalesce(v_avail, 0) then raise exception 'INSUFFICIENT_BALANCE'; end if;
  insert into public.payouts (tutor_id, amount, currency) values (v_tutor, p_amount, v_cur)
  returning id into v_id;
  return v_id;
end $$;

-- ============ reviews ============
create or replace function public.tutor_rating_summary()
returns table(rating_avg numeric, rating_count bigint, five_star bigint, four_star bigint,
              three_star bigint, two_star bigint, one_star bigint)
language sql stable security definer set search_path = public as $$
  select round(avg(r.score)::numeric, 2), count(*),
         count(*) filter (where r.score = 5), count(*) filter (where r.score = 4),
         count(*) filter (where r.score = 3), count(*) filter (where r.score = 2),
         count(*) filter (where r.score = 1)
  from public.ratings r
  where r.tutor_id = public.current_tutor_id() and r.is_published;
$$;

create or replace function public.tutor_rating_categories()
returns table(category_id uuid, name text, average_score numeric, response_count bigint)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, round(avg(cs.score)::numeric, 2), count(cs.id)
  from public.rating_categories c
  join public.rating_category_scores cs on cs.category_id = c.id
  join public.ratings r on r.id = cs.rating_id
  where r.tutor_id = public.current_tutor_id() and r.is_published and c.is_active
  group by c.id, c.name, c.sort_order
  having count(cs.id) > 0
  order by c.sort_order;
$$;

create or replace function public.tutor_reviews(p_limit integer default 20, p_offset integer default 0)
returns table(id uuid, score smallint, comment text, created_at timestamptz, reviewer_name text,
              student_first_name text, subject_name text)
language sql stable security definer set search_path = public as $$
  select r.id, r.score, r.comment, r.created_at,
         coalesce(nullif(split_part(coalesce(p.full_name,''),' ',1),''), 'DiaLearn family'),
         s.first_name, sub.name
  from public.ratings r
  left join public.profiles p on p.id = r.rater_id
  left join public.students s on s.id = r.student_id
  left join public.bookings b on b.id = r.booking_id
  left join public.subjects sub on sub.id = b.subject_id
  where r.tutor_id = public.current_tutor_id() and r.is_published
  order by r.created_at desc
  limit greatest(coalesce(p_limit, 20), 1) offset greatest(coalesce(p_offset, 0), 0);
$$;

-- ============ conversation helper ============
create or replace function public.tutor_start_conversation(p_student_id uuid, p_subject text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_tutor uuid := public.current_tutor_id(); v_me uuid := auth.uid(); v_conv uuid; v_row record;
begin
  if v_tutor is null then raise exception 'NOT_A_TUTOR'; end if;
  if not exists (
    select 1 from public.bookings b where b.tutor_id = v_tutor and b.student_id = p_student_id
  ) then raise exception 'NOT_AUTHORIZED'; end if;

  select c.id into v_conv from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = v_me
  where c.student_id = p_student_id limit 1;
  if v_conv is not null then return v_conv; end if;

  insert into public.conversations (subject, student_id, created_by)
  values (coalesce(p_subject, 'Lesson conversation'), p_student_id, v_me)
  returning id into v_conv;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values (v_conv, v_me, 'tutor');

  for v_row in
    select unnest(array_remove(array[s.parent_id, s.profile_id], null)) as uid,
           null::public.app_role as r
    from public.students s where s.id = p_student_id
  loop
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv, v_row.uid) on conflict do nothing;
  end loop;

  return v_conv;
end $$;

create or replace function public.my_conversations()
returns table(id uuid, subject text, student_id uuid, student_first_name text, last_message_at timestamptz,
              last_message text, last_sender_name text, unread_count bigint)
language sql stable security definer set search_path = public as $$
  select c.id, c.subject, c.student_id, s.first_name, c.last_message_at,
         (select m.body from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1),
         (select p.full_name from public.messages m join public.profiles p on p.id = m.sender_id
           where m.conversation_id = c.id order by m.created_at desc limit 1),
         (select count(*) from public.messages m
           where m.conversation_id = c.id and m.sender_id <> auth.uid()
             and (cp.last_read_at is null or m.created_at > cp.last_read_at))
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = auth.uid()
  left join public.students s on s.id = c.student_id
  order by coalesce(c.last_message_at, c.created_at) desc;
$$;

-- lock helper functions down to signed-in users
revoke all on function public.tutor_open_class(uuid) from public, anon;
revoke all on function public.tutor_start_class(uuid) from public, anon;
revoke all on function public.tutor_end_class(uuid, boolean) from public, anon;
revoke all on function public.tutor_earnings_summary() from public, anon;
revoke all on function public.tutor_earnings_records(integer, integer) from public, anon;
revoke all on function public.tutor_request_payout(numeric) from public, anon;
revoke all on function public.tutor_rating_summary() from public, anon;
revoke all on function public.tutor_rating_categories() from public, anon;
revoke all on function public.tutor_reviews(integer, integer) from public, anon;
revoke all on function public.tutor_start_conversation(uuid, text) from public, anon;
revoke all on function public.my_conversations() from public, anon;
revoke all on function public.notify_user(uuid, text, jsonb, text) from public, anon;
revoke all on function public.tutor_bookings(timestamptz, timestamptz, booking_status[], integer, integer) from public, anon;
grant execute on function public.tutor_open_class(uuid) to authenticated;
grant execute on function public.tutor_start_class(uuid) to authenticated;
grant execute on function public.tutor_end_class(uuid, boolean) to authenticated;
grant execute on function public.tutor_earnings_summary() to authenticated;
grant execute on function public.tutor_earnings_records(integer, integer) to authenticated;
grant execute on function public.tutor_request_payout(numeric) to authenticated;
grant execute on function public.tutor_rating_summary() to authenticated;
grant execute on function public.tutor_rating_categories() to authenticated;
grant execute on function public.tutor_reviews(integer, integer) to authenticated;
grant execute on function public.tutor_start_conversation(uuid, text) to authenticated;
grant execute on function public.my_conversations() to authenticated;
grant execute on function public.tutor_bookings(timestamptz, timestamptz, booking_status[], integer, integer) to authenticated;

-- storage bucket for learning materials is created separately
