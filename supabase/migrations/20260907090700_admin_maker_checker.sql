-- Maker-checker for the irreversible and privilege-changing admin actions.
--
-- Every admin mutation committed on the first click: admin_cancel_booking()
-- refunded immediately, admin_resolve_dispute() closed immediately, role edits
-- and suspensions were direct table writes. This puts a second pair of eyes in
-- front of the five actions that move money or change access, and leaves the
-- other eleven write paths committing immediately with an audit row.
--
--   payment.refund
--   booking.cancel_with_refund
--   payout.settle
--   user_roles.grant_elevated
--   profile.suspend
--
-- Two mechanisms make the queue unavoidable rather than advisory:
--
-- 1. The underlying privileges are revoked from `authenticated`, so a client
--    cannot reach around the queue by writing the table directly. security
--    definer functions run as the owner, so the dispatcher is unaffected by
--    those revokes — that asymmetry is the whole trick.
--
-- 2. admin_execute_action() is revoked from `authenticated` too. Granting it
--    would make it the end-run it exists to prevent.
--
-- Note that admin_cancel_booking() keeps its own is_admin() guard and it still
-- works from inside the dispatcher: security definer changes the database role,
-- not the JWT GUC, so auth.uid() remains the reviewing admin's id all the way
-- down. Same reason the user_roles guard trigger correctly sees the checker as
-- a super admin during a role grant.
--
-- Also fixed here, incidentally: user_roles and payouts were never granted
-- anything beyond SELECT to authenticated (20260826121230:39,
-- 20260827145122:274), so useUpdateUserRoles(), useSettlePayout() and
-- useRejectPayout() have been failing with 42501 since they were written. They
-- start working now, through the RPCs below.

create type public.admin_request_status as enum ('pending', 'approved', 'rejected', 'executed', 'failed');

create table public.admin_action_requests (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status public.admin_request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  executed_at timestamptz,
  execution_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_action_requests_action_supported check (action in (
    'payment.refund',
    'booking.cancel_with_refund',
    'payout.settle',
    'user_roles.grant_elevated',
    'profile.suspend'
  ))
);

create index admin_action_requests_status_idx on public.admin_action_requests (status);
create index admin_action_requests_requested_by_idx on public.admin_action_requests (requested_by);
create index admin_action_requests_requested_at_idx on public.admin_action_requests (requested_at desc);

grant select on public.admin_action_requests to authenticated;
grant all on public.admin_action_requests to service_role;

alter table public.admin_action_requests enable row level security;

create trigger admin_action_requests_updated_at before update on public.admin_action_requests
  for each row execute function public.set_updated_at();

create policy "admin_action_requests_admin_read" on public.admin_action_requests for select to authenticated
  using (public.is_admin());

drop trigger if exists admin_action_requests_audit on public.admin_action_requests;
create trigger admin_action_requests_audit
  after insert or update on public.admin_action_requests
  for each row execute function public.audit_row_change();

-- ============ maker ============

-- Permission and payload are validated at submit time, so a checker never sees
-- a request the maker was not entitled to raise.
create or replace function public.admin_request_action(p_action text, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_action is null or p_payload is null then
    raise exception 'ACTION_AND_PAYLOAD_REQUIRED';
  end if;

  case p_action
    when 'payment.refund' then
      if not public.has_permission(auth.uid(), 'admin.payments') then raise exception 'NOT_AUTHORIZED'; end if;
      if (p_payload ->> 'payment_id') is null or (p_payload ->> 'amount') is null then raise exception 'INVALID_PAYLOAD'; end if;

    when 'booking.cancel_with_refund' then
      if not public.has_permission(auth.uid(), 'admin.bookings') then raise exception 'NOT_AUTHORIZED'; end if;
      if (p_payload ->> 'booking_id') is null then raise exception 'INVALID_PAYLOAD'; end if;

    when 'payout.settle' then
      if not public.has_permission(auth.uid(), 'admin.payouts') then raise exception 'NOT_AUTHORIZED'; end if;
      if (p_payload ->> 'payout_id') is null then raise exception 'INVALID_PAYLOAD'; end if;

    when 'user_roles.grant_elevated' then
      if not public.has_permission(auth.uid(), 'admin.users') then raise exception 'NOT_AUTHORIZED'; end if;
      if (p_payload ->> 'user_id') is null or (p_payload ->> 'role') is null then raise exception 'INVALID_PAYLOAD'; end if;
      if (p_payload ->> 'role') not in ('admin', 'super_admin') then raise exception 'INVALID_PAYLOAD'; end if;
      if (p_payload ->> 'user_id')::uuid = auth.uid() then raise exception 'SELF_ROLE_GRANT_FORBIDDEN'; end if;

    when 'profile.suspend' then
      if not public.has_permission(auth.uid(), 'admin.users') then raise exception 'NOT_AUTHORIZED'; end if;
      if (p_payload ->> 'profile_id') is null or (p_payload ->> 'is_active') is null then raise exception 'INVALID_PAYLOAD'; end if;
      if (p_payload ->> 'profile_id')::uuid = auth.uid() then raise exception 'SELF_SUSPEND_FORBIDDEN'; end if;

    else
      raise exception 'UNSUPPORTED_ACTION';
  end case;

  insert into public.admin_action_requests (action, payload, requested_by)
  values (p_action, p_payload, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.admin_request_action(text, jsonb) from public, anon;
grant execute on function public.admin_request_action(text, jsonb) to authenticated;

-- ============ dispatcher ============

-- Not executable by authenticated. This is the effect itself, not a request.
create or replace function public.admin_execute_action(p_action text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments;
  v_amount numeric;
begin
  case p_action

    when 'payment.refund' then
      select * into v_payment from public.payments
      where id = (p_payload ->> 'payment_id')::uuid
      for update;
      if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;
      if v_payment.status not in ('paid', 'partially_refunded') then
        raise exception 'PAYMENT_NOT_REFUNDABLE';
      end if;
      v_amount := least(greatest((p_payload ->> 'amount')::numeric, 0), v_payment.amount);
      update public.payments
      set refunded_amount = v_amount,
          status = case when v_amount >= v_payment.amount then 'refunded' else 'partially_refunded' end
      where id = v_payment.id;

    when 'booking.cancel_with_refund' then
      -- Reuses the existing RPC rather than duplicating the cancellation_policies
      -- refund maths.
      perform public.admin_cancel_booking(
        (p_payload ->> 'booking_id')::uuid,
        coalesce(nullif(p_payload ->> 'reason', ''), 'Cancelled by DiaLearn admin'),
        nullif(p_payload ->> 'refund_percentage', '')::numeric
      );

    when 'payout.settle' then
      update public.payouts
      set status = 'paid',
          settled_at = now(),
          reference = coalesce(nullif(p_payload ->> 'reference', ''), reference)
      where id = (p_payload ->> 'payout_id')::uuid
        and status in ('requested', 'processing');
      if not found then raise exception 'PAYOUT_NOT_SETTLEABLE'; end if;

    when 'user_roles.grant_elevated' then
      if coalesce((p_payload ->> 'revoke')::boolean, false) then
        delete from public.user_roles
        where user_id = (p_payload ->> 'user_id')::uuid
          and role = (p_payload ->> 'role')::public.app_role;
      else
        insert into public.user_roles (user_id, role)
        values ((p_payload ->> 'user_id')::uuid, (p_payload ->> 'role')::public.app_role)
        on conflict (user_id, role) do nothing;
      end if;

    when 'profile.suspend' then
      update public.profiles
      set is_active = (p_payload ->> 'is_active')::boolean
      where id = (p_payload ->> 'profile_id')::uuid;
      if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

    else
      raise exception 'UNSUPPORTED_ACTION';
  end case;
end;
$$;

revoke all on function public.admin_execute_action(text, jsonb) from public, anon, authenticated;

-- ============ checker ============

create or replace function public.admin_review_action(
  p_request_id uuid,
  p_approve boolean,
  p_notes text default null
)
returns public.admin_action_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.admin_action_requests;
  v_err text;
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if not public.has_permission(auth.uid(), 'admin.approvals') then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into req
  from public.admin_action_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;
  if req.status <> 'pending' then
    raise exception 'REQUEST_ALREADY_REVIEWED';
  end if;
  if req.requested_by = auth.uid() then
    raise exception 'SELF_APPROVAL_FORBIDDEN';
  end if;
  if req.action = 'user_roles.grant_elevated' and not public.is_super_admin() then
    raise exception 'ELEVATED_ROLE_REQUIRES_SUPER_ADMIN';
  end if;

  if not coalesce(p_approve, false) then
    update public.admin_action_requests
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        review_notes = p_notes
    where id = p_request_id
    returning * into req;
    return req;
  end if;

  update public.admin_action_requests
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_notes = p_notes
  where id = p_request_id;

  begin
    perform public.admin_execute_action(req.action, req.payload);

    update public.admin_action_requests
    set status = 'executed',
        executed_at = now(),
        execution_error = null
    where id = p_request_id
    returning * into req;

  exception when others then
    -- A plpgsql exception block is an implicit SAVEPOINT: everything the
    -- dispatcher wrote rolls back to the start of this block, but the
    -- 'approved' update above survives and this handler's update commits with
    -- the rest of the transaction. That is how a failed effect is recorded in
    -- execution_error instead of aborting the whole approval.
    v_err := sqlstate || ': ' || sqlerrm;

    update public.admin_action_requests
    set status = 'failed',
        executed_at = now(),
        execution_error = v_err
    where id = p_request_id
    returning * into req;
  end;

  return req;
end;
$$;

revoke all on function public.admin_review_action(uuid, boolean, text) from public, anon;
grant execute on function public.admin_review_action(uuid, boolean, text) to authenticated;

-- ============ non-elevated role management ============

-- useUpdateUserRoles() manages the whole role set, so it needs a path that is
-- not the approval queue for the ordinary roles. Anything touching admin or
-- super_admin is pushed to the queue instead.
create or replace function public.admin_set_user_roles(p_user_id uuid, p_roles public.app_role[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission(auth.uid(), 'admin.users') then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'SELF_ROLE_GRANT_FORBIDDEN';
  end if;

  if exists (
    select 1 from unnest(coalesce(p_roles, '{}'::public.app_role[])) r
    where r in ('admin', 'super_admin')
  ) then
    raise exception 'ELEVATED_ROLE_REQUIRES_APPROVAL';
  end if;

  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = p_user_id
      and ur.role in ('admin', 'super_admin')
      and not (ur.role = any (coalesce(p_roles, '{}'::public.app_role[])))
  ) then
    raise exception 'ELEVATED_ROLE_REQUIRES_APPROVAL';
  end if;

  delete from public.user_roles ur
  where ur.user_id = p_user_id
    and not (ur.role = any (coalesce(p_roles, '{}'::public.app_role[])));

  insert into public.user_roles (user_id, role)
  select p_user_id, r from unnest(coalesce(p_roles, '{}'::public.app_role[])) r
  on conflict (user_id, role) do nothing;
end;
$$;

revoke all on function public.admin_set_user_roles(uuid, public.app_role[]) from public, anon;
grant execute on function public.admin_set_user_roles(uuid, public.app_role[]) to authenticated;

-- Rejecting a payout moves no money, so it stays a single-step action — but it
-- still needs an RPC because authenticated has no UPDATE on payouts.
create or replace function public.admin_reject_payout(p_payout_id uuid, p_notes text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission(auth.uid(), 'admin.payouts') then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.payouts
  set status = 'rejected',
      notes = coalesce(nullif(p_notes, ''), notes)
  where id = p_payout_id
    and status in ('requested', 'processing');

  if not found then
    raise exception 'PAYOUT_NOT_REJECTABLE';
  end if;
end;
$$;

revoke all on function public.admin_reject_payout(uuid, text) from public, anon;
grant execute on function public.admin_reject_payout(uuid, text) to authenticated;

-- ============ close the end-runs ============

-- Refunds are approval-gated. Nothing in the client inserts payments
-- (pay_for_booking() is a definer RPC) and nothing deletes them.
revoke insert, update, delete on public.payments from authenticated;

-- Documenting no-ops: these were never granted, which is why the corresponding
-- client hooks have been failing.
revoke insert, update, delete on public.payouts from authenticated;
revoke insert, update, delete on public.user_roles from authenticated;

-- admin_cancel_booking() applies a refund, so it must not remain directly
-- callable. The dispatcher, running as the owner, is now its only caller.
revoke execute on function public.admin_cancel_booking(uuid, text, numeric) from authenticated;

-- Deliberately NOT revoked: bookings UPDATE. Plain status overrides
-- (useAdminUpdateBookingStatus) stay direct and audited-only, per the agreed
-- scope. An admin can still set status='cancelled' directly, which cancels
-- without moving money — that is audited, and no refund can follow because both
-- payments UPDATE and admin_cancel_booking() are closed.
