alter table public.tutors
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists methodology text,
  add column if not exists teaching_context text,
  add column if not exists onboarding_step smallint not null default 1,
  add column if not exists submitted_at timestamptz;

create or replace function public.current_tutor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.tutors where profile_id = auth.uid() limit 1;
$$;

create table if not exists public.tutor_documents (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  step_id uuid references public.verification_steps(id) on delete set null,
  label text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  status public.verification_status not null default 'pending',
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.tutor_documents to authenticated;
grant all on public.tutor_documents to service_role;
alter table public.tutor_documents enable row level security;

drop policy if exists tutor_documents_owner_read on public.tutor_documents;
create policy tutor_documents_owner_read on public.tutor_documents
  for select to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

drop policy if exists tutor_documents_owner_write on public.tutor_documents;
create policy tutor_documents_owner_write on public.tutor_documents
  for all to authenticated
  using (public.owns_tutor(tutor_id) or public.is_admin())
  with check (public.owns_tutor(tutor_id) or public.is_admin());

drop trigger if exists tutor_documents_touch on public.tutor_documents;
create trigger tutor_documents_touch before update on public.tutor_documents
  for each row execute function public.set_updated_at();

create index if not exists tutor_documents_tutor_idx on public.tutor_documents(tutor_id);

create or replace function public.enforce_tutor_verification_rules()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verification_status := 'unverified';
    new.is_listed := false;
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status then
    if old.verification_status in ('unverified','rejected')
       and new.verification_status in ('pending','in_review') then
      new.verification_status := 'pending';
    else
      new.verification_status := old.verification_status;
    end if;
  end if;

  if new.verification_status <> 'verified' then
    new.is_listed := false;
  end if;

  return new;
end $$;

drop trigger if exists tutors_enforce_verification on public.tutors;
create trigger tutors_enforce_verification before insert or update on public.tutors
  for each row execute function public.enforce_tutor_verification_rules();

drop policy if exists avatars_auth_read on storage.objects;
create policy avatars_auth_read on storage.objects
  for select to authenticated using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists tutor_docs_owner_read on storage.objects;
create policy tutor_docs_owner_read on storage.objects
  for select to authenticated
  using (bucket_id = 'tutor-documents' and (owner = auth.uid() or public.is_admin()));

drop policy if exists tutor_docs_owner_insert on storage.objects;
create policy tutor_docs_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'tutor-documents' and owner = auth.uid());

drop policy if exists tutor_docs_owner_delete on storage.objects;
create policy tutor_docs_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'tutor-documents' and (owner = auth.uid() or public.is_admin()));

create or replace function public.tutor_dashboard_summary()
returns table (
  classes_today bigint,
  upcoming_classes bigint,
  pending_requests bigint,
  active_students bigint,
  completed_lessons bigint,
  verification_status public.verification_status,
  is_listed boolean,
  tutor_timezone text,
  currency text,
  hourly_rate numeric,
  onboarding_step smallint,
  profile_complete boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_tutor uuid := public.current_tutor_id();
  v_tz text;
begin
  if v_tutor is null then return; end if;
  select t.timezone into v_tz from public.tutors t where t.id = v_tutor;

  return query
  select
    (select count(*) from public.bookings b
       where b.tutor_id = v_tutor
         and b.status in ('confirmed','in_progress')
         and (b.starts_at at time zone v_tz)::date = (now() at time zone v_tz)::date),
    (select count(*) from public.bookings b
       where b.tutor_id = v_tutor and b.ends_at > now()
         and b.status in ('confirmed','in_progress')),
    (select count(*) from public.bookings b
       where b.tutor_id = v_tutor and b.status = 'pending' and b.ends_at > now()),
    (select count(distinct b.student_id) from public.bookings b
       where b.tutor_id = v_tutor
         and b.status in ('pending','confirmed','in_progress','completed')),
    (select count(*) from public.bookings b
       where b.tutor_id = v_tutor and b.status = 'completed'),
    t.verification_status,
    t.is_listed,
    t.timezone,
    t.currency,
    t.hourly_rate,
    t.onboarding_step,
    (t.biography is not null and length(trim(t.biography)) > 40
      and t.hourly_rate is not null
      and exists (select 1 from public.tutor_subjects ts where ts.tutor_id = v_tutor)
      and exists (select 1 from public.availability_windows aw where aw.tutor_id = v_tutor and aw.is_active))
  from public.tutors t
  where t.id = v_tutor;
end $$;

create or replace function public.tutor_bookings(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_statuses public.booking_status[] default null,
  p_limit integer default 200,
  p_offset integer default 0
)
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  status public.booking_status,
  booking_timezone text,
  currency text,
  hourly_rate numeric,
  total_amount numeric,
  student_notes text,
  student_id uuid,
  student_first_name text,
  student_avatar_url text,
  subject_id uuid,
  subject_name text,
  education_level_name text
)
language sql stable security definer set search_path = public as $$
  select b.id, b.starts_at, b.ends_at, b.duration_minutes, b.status, b.booking_timezone,
         b.currency, b.hourly_rate, b.total_amount, b.student_notes,
         s.id, s.first_name, s.avatar_url,
         b.subject_id, sub.name, el.name
  from public.bookings b
  join public.students s on s.id = b.student_id
  left join public.subjects sub on sub.id = b.subject_id
  left join public.education_levels el on el.id = b.education_level_id
  where b.tutor_id = public.current_tutor_id()
    and (p_from is null or b.ends_at >= p_from)
    and (p_to is null or b.starts_at <= p_to)
    and (p_statuses is null or b.status = any(p_statuses))
  order by b.starts_at
  limit greatest(coalesce(p_limit, 200), 1) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.tutor_students(p_limit integer default 60, p_offset integer default 0)
returns table (
  student_id uuid,
  first_name text,
  avatar_url text,
  student_timezone text,
  education_level_name text,
  curriculum_name text,
  subjects text[],
  lessons_completed bigint,
  lessons_upcoming bigint,
  next_class_at timestamptz,
  last_class_at timestamptz
)
language sql stable security definer set search_path = public as $$
  with mine as (
    select b.* from public.bookings b
    where b.tutor_id = public.current_tutor_id()
      and b.status in ('pending','confirmed','in_progress','completed')
  )
  select s.id, s.first_name, s.avatar_url, s.timezone, el.name, c.name,
    coalesce(array_agg(distinct sub.name) filter (where sub.name is not null), '{}'::text[]),
    count(*) filter (where m.status = 'completed'),
    count(*) filter (where m.status in ('confirmed','in_progress') and m.ends_at > now()),
    min(m.starts_at) filter (where m.ends_at > now() and m.status in ('confirmed','in_progress')),
    max(m.ends_at) filter (where m.status = 'completed')
  from mine m
  join public.students s on s.id = m.student_id
  left join public.education_levels el on el.id = s.education_level_id
  left join public.curricula c on c.id = s.curriculum_id
  left join public.subjects sub on sub.id = m.subject_id
  group by s.id, s.first_name, s.avatar_url, s.timezone, el.name, c.name
  order by min(m.starts_at) filter (where m.ends_at > now()) nulls last, s.first_name
  limit greatest(coalesce(p_limit, 60), 1) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.tutor_respond_booking(p_booking_id uuid, p_accept boolean)
returns public.booking_status
language plpgsql security definer set search_path = public as $$
declare
  v_tutor uuid := public.current_tutor_id();
  v_row public.bookings;
  v_next public.booking_status;
begin
  if v_tutor is null then
    raise exception 'NOT_A_TUTOR';
  end if;

  select * into v_row from public.bookings
  where id = p_booking_id and tutor_id = v_tutor for update;

  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_row.status <> 'pending' then raise exception 'BOOKING_NOT_PENDING'; end if;

  v_next := case when p_accept then 'confirmed'::public.booking_status else 'rejected'::public.booking_status end;

  if p_accept and exists (
    select 1 from public.bookings b
    where b.tutor_id = v_tutor and b.id <> v_row.id
      and b.status in ('confirmed','in_progress')
      and b.starts_at < v_row.ends_at and b.ends_at > v_row.starts_at
  ) then
    raise exception 'BOOKING_OVERLAP';
  end if;

  update public.bookings set status = v_next, updated_at = now() where id = v_row.id;
  return v_next;
end $$;

create or replace function public.tutor_submit_verification()
returns public.verification_status
language plpgsql security definer set search_path = public as $$
declare
  v_tutor uuid := public.current_tutor_id();
  v_status public.verification_status;
begin
  if v_tutor is null then raise exception 'NOT_A_TUTOR'; end if;

  select verification_status into v_status from public.tutors where id = v_tutor;
  if v_status in ('verified','suspended','pending','in_review') then
    return v_status;
  end if;

  insert into public.tutor_verification_progress (tutor_id, step_id, status)
  select v_tutor, vs.id, 'pending'
  from public.verification_steps vs
  where vs.is_active and vs.applies_to = 'tutor'
    and not exists (
      select 1 from public.tutor_verification_progress p
      where p.tutor_id = v_tutor and p.step_id = vs.id
    );

  update public.tutor_verification_progress
    set status = 'pending', updated_at = now()
  where tutor_id = v_tutor and status in ('unverified','rejected');

  update public.tutors
    set verification_status = 'pending', submitted_at = now(), onboarding_step = 10, updated_at = now()
  where id = v_tutor;

  select verification_status into v_status from public.tutors where id = v_tutor;
  return v_status;
end $$;

create or replace function public.ensure_tutor_record()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := public.current_tutor_id();
begin
  if v_id is not null then return v_id; end if;
  if not public.has_role(auth.uid(), 'tutor') then raise exception 'NOT_A_TUTOR'; end if;

  insert into public.tutors (profile_id, timezone, currency)
  select auth.uid(), coalesce(p.timezone, 'UTC'), coalesce(p.preferred_currency, 'USD')
  from public.profiles p where p.id = auth.uid()
  returning id into v_id;

  return v_id;
end $$;

grant execute on function public.current_tutor_id() to authenticated;
grant execute on function public.tutor_dashboard_summary() to authenticated;
grant execute on function public.tutor_bookings(timestamptz, timestamptz, public.booking_status[], integer, integer) to authenticated;
grant execute on function public.tutor_students(integer, integer) to authenticated;
grant execute on function public.tutor_respond_booking(uuid, boolean) to authenticated;
grant execute on function public.tutor_submit_verification() to authenticated;
grant execute on function public.ensure_tutor_record() to authenticated;