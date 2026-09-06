-- Tutors cannot set their own hourly rate — DiaLearn admin sets it.
--
-- tutors.hourly_rate has been editable by the tutor themselves since the
-- very first schema migration (tutors_owner_update lets a tutor UPDATE any
-- column on their own row, including hourly_rate), and both
-- tutor.onboarding.tsx (step 5) and tutor.profile.tsx exposed an editable
-- rate field built on top of that. Per the actual business model this is
-- wrong: rates are platform-set. RLS is row-level, not column-level, so
-- "tutors_owner_update" can't be narrowed to exclude one column — this adds
-- a BEFORE UPDATE trigger as the real enforcement (defense in depth: it
-- blocks a direct API call just as much as the UI), on top of removing the
-- rate field from both tutor-facing screens in the same pass.
--
-- The column stays NULLable (it already was) so ensure_tutor_record()'s
-- insert — which never set hourly_rate — keeps working unchanged: a new
-- tutor starts with no rate, is unbookable (booking_quote() already returns
-- nothing when hourly_rate is null), and becomes bookable once an admin
-- sets a rate — naturally around the same time as verification approval.

create or replace function public.enforce_admin_only_hourly_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.hourly_rate is distinct from old.hourly_rate and not public.is_admin() then
    raise exception 'HOURLY_RATE_ADMIN_ONLY';
  end if;
  return new;
end;
$$;

drop trigger if exists tutors_admin_only_hourly_rate on public.tutors;
create trigger tutors_admin_only_hourly_rate
  before update on public.tutors
  for each row execute function public.enforce_admin_only_hourly_rate();
