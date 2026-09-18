# Admin governance — apply and verify

Runbook for the `20260907*` migrations, which add the super admin tier, admin
invitations, per-admin permissions, maker-checker and the audit log.

Read the whole of **Part 1** before applying anything. Two steps have an
ordering constraint that cannot be undone by re-running.

---

## Part 1 — Preflight

### 1.1 Set the service-role key

The invite flow creates an `auth.users` row, which is impossible without it.

`src/integrations/supabase/client.server.ts:34` reads `SUPABASE_SERVICE_ROLE_KEY`
and it is **not currently in `.env`**. Get it from Supabase → Project Settings →
API → `service_role` (the long one marked *secret*), and add it to:

- `.env` locally
- Lovable Cloud secrets, for deployed environments

> This key bypasses RLS entirely. It must never appear in `VITE_*` form, in a
> route file, or in a `*.functions.ts` top-level import — `client.server.ts` is
> imported dynamically inside the handler for exactly this reason.

### 1.2 Configure SMTP

Supabase → Authentication → Emails → SMTP Settings. The built-in mailer allows a
handful of messages an hour and silently drops the rest, so invitations will
appear to send and never arrive.

### 1.3 Set the invite email template

Supabase → Authentication → Emails → Templates → **Invite user**. It must render
the one-time password, which the server function passes through user metadata:

```html
<h2>You've been invited to the DiaLearn admin portal</h2>
<p>One-time password: <strong>{{ .Data.dialearn_otp }}</strong></p>
<p><a href="{{ .ConfirmationURL }}">Accept your invitation</a></p>
<p>This code expires in 72 hours and can only be used once.</p>
```

Without `{{ .Data.dialearn_otp }}` the invitee gets a link they cannot complete.

### 1.4 Allow the redirect URL

Supabase → Authentication → URL Configuration → Redirect URLs. Add
`/auth/accept-invite` for **every** environment (local, preview, production),
e.g. `http://localhost:8080/auth/accept-invite`.

### 1.5 Confirm the bootstrap account exists

The bootstrap in `20260907090100` promotes `adebisiadetutu99@gmail.com`, but only
if that account already exists. Check:

```sql
select id, email from auth.users where lower(email) = 'adebisiadetutu99@gmail.com';
```

**If this returns no rows**, sign up with that address through the app first.
Otherwise the bootstrap is a silent no-op and you will have zero super admins —
at which point nothing can grant the tier, because granting it requires already
holding it. Recovery is in §5.1, but avoiding it is easier.

---

## Part 2 — Apply the migrations

### 2.1 Order and the one hard constraint

Apply in filename order. `20260907090000_app_role_super_admin.sql` contains a
single `alter type ... add value` and **nothing else**, because Postgres forbids
using an enum value in the same transaction that added it. If you paste
migrations into the SQL editor, run that file **on its own and commit it** before
running any of the others.

| File | Adds |
| --- | --- |
| `…090000_app_role_super_admin.sql` | the `super_admin` enum value, alone |
| `…090100_super_admin_helpers.sql` | `is_super_admin()`, widened `is_admin()`, permission seeds, **bootstrap** |
| `…090200_user_roles_escalation_guard.sql` | role policies + `enforce_user_role_guards()` |
| `…090300_user_permission_overrides.sql` | `user_permissions`, new `has_permission()`, `my_permissions()` |
| `…090400_audit_logs.sql` | `audit_logs`, `log_audit()`, `audit_row_change()` + 12 triggers |
| `…090500_profiles_must_change_password.sql` | the flag + column-level UPDATE grants |
| `…090600_admin_invitations.sql` | invitations, both RPCs, invitation-aware guard |
| `…090700_admin_maker_checker.sql` | approval queue, dispatcher, closes the end-runs |

`090100` must land **before** `090200` — the bootstrap insert has to happen
before the guard trigger that would block it.

### 2.2 Apply

With the CLI (handles ordering and transactions correctly):

```bash
npx supabase db push
```

Without the CLI: open each file in Supabase → SQL Editor, in the order above, and
run them one at a time. Wait for each to report success before starting the next.

### 2.3 Regenerate the TypeScript types

`src/integrations/supabase/types.ts` is stale — it predates even the `20260903*`
migrations, which is why `npx tsc --noEmit` currently reports 84 errors about
`disputes`, `admin_cancel_booking` and `messages.is_hidden`. Regenerating clears
those *and* the new objects in one go:

```bash
npx supabase gen types typescript --project-id acyxxesxhhbxywtzlidc > src/integrations/supabase/types.ts
```

Afterwards `src/integrations/supabase/governance-types.ts` becomes redundant —
its casts exist purely to work around the stale file. Deleting it and importing
from `types.ts` instead is a clean follow-up, not urgent.

---

## Part 3 — Verify the install

Run these in the SQL editor. All five should come back as described.

```sql
-- 1. the tier exists and someone holds it
select u.email, ur.role
from public.user_roles ur join auth.users u on u.id = ur.user_id
where ur.role = 'super_admin';
-- expect: at least one row. Zero means the bootstrap no-opped (see §1.5).

-- 2. is_admin() covers both tiers
select prosrc from pg_proc where proname = 'is_admin';
-- expect: ... role in ('admin', 'super_admin')

-- 3. the new tables are present and RLS is on
select relname, relrowsecurity from pg_class
where relname in ('audit_logs','user_permissions','admin_invitations','admin_action_requests');
-- expect: 4 rows, all relrowsecurity = true

-- 4. audit_logs is append-only for authenticated
select privilege_type from information_schema.role_table_grants
where table_name = 'audit_logs' and grantee = 'authenticated';
-- expect: SELECT only. Any INSERT/UPDATE/DELETE here is a bug.

-- 5. the end-runs are closed
select privilege_type from information_schema.role_table_grants
where table_name = 'payments' and grantee = 'authenticated';
-- expect: SELECT only.
```

Then seed the invite allow-list — it ships empty, which blocks **all** invitations
by design:

```sql
update public.platform_settings
set value = '["yourcompany.com", "dialearn.com"]'::jsonb
where key = 'admin.invite_email_domains';
```

---

## Part 4 — Smoke tests

One per requirement. Each states what to do and what proves it worked.

### R1 · Protected admin route

Sign in as a **parent or student**, then type `/admin/users` in the address bar.

- ✅ Redirected to your own portal home; no admin header, sidebar or nav ever paints.
- ❌ If you see the admin shell with an "access required" card, the guard is not
  running — check `beforeLoad: adminBeforeLoad()` is present in that route file.

### R2 · Super admin tier

Sign in as the bootstrap account.

- ✅ Header pill reads **Super admin**, not Admin.
- ✅ Sidebar shows a *Governance* group with Approvals, Audit log, Admins & roles.
- ✅ A plain admin sees Approvals but **not** Admins & roles, and visiting
  `/admin/admins` directly redirects them to the dashboard.

### R3 + R4 · Invite by work email and OTP

As super admin → Admins & roles → **Invite admin**.

1. Try an address on a domain *not* in the allow-list → "That email domain isn't
   on the allowed list."
2. Invite a real address on an allowed domain.
3. ✅ The invitee's inbox has one email containing **both** a 10-character code
   and an "Accept your invitation" link.
4. ✅ Confirm the plaintext code did not linger:
   ```sql
   select raw_user_meta_data ->> 'dialearn_otp' from auth.users where email = '<invitee>';
   -- expect: null — the server function scrubs it immediately after sending
   ```
5. ✅ And that only a hash was stored:
   ```sql
   select email, status, otp_hash from public.admin_invitations order by created_at desc limit 1;
   -- expect: otp_hash starts with $2 (bcrypt), never the code itself
   ```

### R5 · Roles and permissions

**Permissions:** Admins & roles → Permissions on a plain admin → set
`admin.audit` to **Grant**. That admin reloads and now sees Audit log. Set it to
**Deny** and it disappears even though their role would allow it.

**Roles — the escalation test.** As a *plain admin*, in the SQL editor while
impersonating them (or from the app), attempt:

```sql
insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
```

- ✅ Fails with `SELF_ROLE_GRANT_FORBIDDEN`.
- ✅ Granting `admin` to someone *else* as a plain admin fails with
  `ELEVATED_ROLE_REQUIRES_SUPER_ADMIN`.
- ✅ Removing the only super admin fails with `LAST_SUPER_ADMIN_PROTECTED`.

### R6 · Password change after first login

As the newly invited admin, follow the emailed link.

- ✅ `/auth/accept-invite` asks for the code and a new password.
- ✅ A wrong code is rejected and **grants nothing** — verify with
  `select status from public.admin_invitations where email = '<invitee>'` → still `pending`.
- ✅ After success you land on the dashboard.
- ✅ Then check the flag cleared:
  ```sql
  select must_change_password from public.profiles where email = '<invitee>';
  -- expect: false
  ```
- ✅ To see the forcing behaviour, set it back to `true` and reload: every admin
  route bounces to `/admin/security` until a new password is set.

### R7 · Maker-checker and audit log

Needs **two** admin accounts.

1. As admin A: Payouts → settle a payout. ✅ Toast says sent for approval, and the
   payout is **still unsettled**.
2. As admin A: open Approvals. ✅ The row shows "You raised this request" with no
   buttons. Attempting it via RPC returns `SELF_APPROVAL_FORBIDDEN`.
3. As admin B: Approvals → Approve. ✅ The payout flips to paid and the request
   reads *Applied*.
4. ✅ Both halves are recorded:
   ```sql
   select created_at, actor_email, action, entity_type
   from public.audit_logs order by created_at desc limit 10;
   -- expect: admin_action_requests.insert (A), admin_action_requests.update (B),
   --         and payouts.update (B)
   ```
5. ✅ Confirm the log cannot be rewritten — as an admin, not service_role:
   ```sql
   delete from public.audit_logs;  -- expect: permission denied
   update public.audit_logs set action = 'x'; -- expect: permission denied
   ```

### Regression check

The five changed mutations are the only intended behaviour change. Confirm the
untouched paths still commit immediately: approve a tutor verification, hide a
review, edit a subject in Platform settings. Each should apply on the first click
and produce an audit row.

Then sign in as a parent, a student and a tutor and walk one core flow each —
those portals were not modified and should behave exactly as before.

---

## Part 5 — If something goes wrong

### 5.1 No super admin exists

The bootstrap no-opped because the account had not signed up. Sign up, then run:

```sql
insert into public.user_roles (user_id, role)
select id, 'super_admin' from auth.users where lower(email) = '<your-email>'
on conflict (user_id, role) do nothing;
```

The SQL editor connects as `postgres`, so `auth.uid()` is null and the guard's
escalation checks are skipped by design — this works even with no super admin.

### 5.2 Everyone lost their admin permissions

Most likely `my_permissions()` did not get created. `use-auth.tsx` falls back to
the old role-level read when that RPC is missing, so the portal keeps working —
but check `090300` actually applied:

```sql
select proname from pg_proc where proname = 'my_permissions';
```

### 5.3 An approval says *Failed*

The approval committed but the effect did not. The reason is stored, not lost:

```sql
select action, payload, execution_error
from public.admin_action_requests where status = 'failed';
```

`PAYMENT_NOT_REFUNDABLE` or `PAYOUT_NOT_SETTLEABLE` usually means the underlying
record changed while the request was queued. Raise a fresh request.

### 5.4 Rolling back

These migrations are additive, so the safest rollback is forward. If you must
undo, drop in reverse order (`090700` → `090100`). Note that **`super_admin`
cannot be removed from the enum** — Postgres has no `ALTER TYPE ... DROP VALUE`.
Leaving the value in place is harmless; nothing reads it once the helpers are
gone.

---

## Notes for whoever maintains this

- **`is_admin()` is widened, not replaced.** Every pre-existing policy and RPC
  gates on it, so a super admin inherits all of it as a strict superset. Narrowing
  it would lock a super-admin-only account out of the entire portal.
- **`security definer` bypasses RLS but not triggers.** That is why
  `admin_invite_redeem()` marks the invitation `accepted` *before* inserting the
  role — the guard trigger looks for that row to permit the one legitimate
  self-grant.
- **The guard's self-grant rule is scoped to elevated roles on purpose.**
  `handle_new_user()` self-grants the signup role; an unscoped rule would reject
  every registration on the platform.
- **Adding a new admin screen?** Add `beforeLoad: adminBeforeLoad()` to the route.
  The guard is per-route by design (flat file routing, no shared admin layout),
  so it is the one thing easy to forget.
