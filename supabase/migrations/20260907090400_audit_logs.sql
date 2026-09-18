-- Immutable audit trail for admin activity.
--
-- Nothing in this schema recorded who did what. Four tables carry a last-actor
-- column (tutors.reviewed_by, disputes.resolved_by, bookings.cancelled_by,
-- platform_settings.updated_by) but that is current-state attribution — it is
-- overwritten by the next edit and cannot be replayed. Role grants, account
-- suspensions and refunds had no actor column at all.
--
-- Design notes:
--
-- * Append-only by privilege, not by policy. authenticated is granted SELECT
--   and nothing else, and no write policy exists, so the only writer is
--   log_audit(), which runs as the table owner. service_role keeps `grant all`
--   for retention jobs.
--
-- * Do NOT add `force row level security` here — it would apply RLS to the
--   owner too and break the definer inserts.
--
-- * log_audit() and audit_row_change() deliberately break the house
--   revoke/grant pair by also revoking from authenticated. Granting either
--   would let any signed-in user forge audit entries.
--
-- * audit_row_change() takes the columns to watch as trigger arguments, so a
--   high-traffic table logs only the transitions that matter. bookings and
--   payments get UPDATE triggers only — an INSERT trigger there would log every
--   learner booking and every checkout.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  before jsonb,
  after jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_action_idx on public.audit_logs (action);

grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

alter table public.audit_logs enable row level security;

create policy "audit_logs_permitted_read" on public.audit_logs for select to authenticated
  using (public.has_permission(auth.uid(), 'admin.audit'));

create or replace function public.log_audit(
  p_action text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_before jsonb default null,
  p_after jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_actor uuid := auth.uid();
  v_email text;
  v_headers text;
  v_ip text;
begin
  select p.email into v_email from public.profiles p where p.id = v_actor;

  -- PostgREST publishes request.headers as a JSON string GUC. It is unset when
  -- this runs from psql or a migration, hence missing_ok = true.
  v_headers := current_setting('request.headers', true);
  if v_headers is not null and v_headers <> '' then
    v_ip := nullif(btrim(split_part(coalesce(v_headers::jsonb ->> 'x-forwarded-for', ''), ',', 1)), '');
  end if;

  insert into public.audit_logs (
    actor_id, actor_email, action, entity_type, entity_id, before, after, metadata, ip
  ) values (
    v_actor, v_email, p_action, p_entity_type, p_entity_id, p_before, p_after,
    coalesce(p_metadata, '{}'::jsonb), v_ip
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.log_audit(text, text, uuid, jsonb, jsonb, jsonb)
  from public, anon, authenticated;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  v_after  jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  v_watch text[] := tg_argv;
  v_changed boolean := false;
  v_pk text;
  v_entity uuid;
  k text;
begin
  -- create trigger ... execute function public.audit_row_change('is_active')
  -- logs only when one of the named columns actually changed, and stores just
  -- those columns rather than the whole row.
  if tg_op = 'UPDATE' and array_length(v_watch, 1) is not null then
    foreach k in array v_watch loop
      if v_before -> k is distinct from v_after -> k then
        v_changed := true;
        exit;
      end if;
    end loop;

    if not v_changed then
      return new;
    end if;

    v_before := (select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb)
                 from jsonb_each(v_before) e where e.key = any (v_watch));
    v_after  := (select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb)
                 from jsonb_each(v_after) e where e.key = any (v_watch));
  end if;

  -- platform_settings is keyed on TEXT, not uuid. Guard the cast with a regex
  -- rather than a plpgsql exception block, which would open a subtransaction on
  -- every audited row.
  v_pk := coalesce(
    to_jsonb(coalesce(new, old)) ->> 'id',
    to_jsonb(coalesce(new, old)) ->> 'key'
  );
  if v_pk ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_entity := v_pk::uuid;
  end if;

  perform public.log_audit(
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    v_entity,
    v_before,
    v_after,
    jsonb_build_object('schema', tg_table_schema, 'pk', v_pk)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.audit_row_change() from public, anon, authenticated;

-- ============ attachments ============
-- Never attach this to audit_logs itself.

drop trigger if exists user_roles_audit on public.user_roles;
create trigger user_roles_audit
  after insert or update or delete on public.user_roles
  for each row execute function public.audit_row_change();

drop trigger if exists user_permissions_audit on public.user_permissions;
create trigger user_permissions_audit
  after insert or update or delete on public.user_permissions
  for each row execute function public.audit_row_change();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
  after update on public.profiles
  for each row execute function public.audit_row_change('is_active', 'primary_role', 'email');

drop trigger if exists tutors_audit on public.tutors;
create trigger tutors_audit
  after update on public.tutors
  for each row execute function public.audit_row_change('verification_status', 'hourly_rate', 'is_listed');

drop trigger if exists payments_audit on public.payments;
create trigger payments_audit
  after update on public.payments
  for each row execute function public.audit_row_change('status', 'refunded_amount', 'amount');

drop trigger if exists payouts_audit on public.payouts;
create trigger payouts_audit
  after insert or update or delete on public.payouts
  for each row execute function public.audit_row_change();

drop trigger if exists bookings_audit on public.bookings;
create trigger bookings_audit
  after update on public.bookings
  for each row execute function public.audit_row_change('status', 'cancelled_by', 'cancellation_reason', 'total_amount');

drop trigger if exists ratings_audit on public.ratings;
create trigger ratings_audit
  after update on public.ratings
  for each row execute function public.audit_row_change('is_published');

drop trigger if exists messages_audit on public.messages;
create trigger messages_audit
  after update on public.messages
  for each row execute function public.audit_row_change('is_hidden');

drop trigger if exists platform_settings_audit on public.platform_settings;
create trigger platform_settings_audit
  after insert or update or delete on public.platform_settings
  for each row execute function public.audit_row_change();

drop trigger if exists disputes_audit on public.disputes;
create trigger disputes_audit
  after update on public.disputes
  for each row execute function public.audit_row_change('status', 'resolution_notes');
