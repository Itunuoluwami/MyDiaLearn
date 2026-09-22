# DiaLearn — Architecture Migration Audit

**Status:** Read-only audit. No application code has been modified.
**Date:** 2026-09-22
**Commit audited:** `0ebef7d` (branch `main`)
**Scope:** Inventory of the existing Supabase/Lovable Cloud implementation and a
proposed controlled migration path to TanStack → NestJS → PostgreSQL.

---

## Executive finding

> **DiaLearn's business logic and authorization model do not live in TypeScript.
> They live in PostgreSQL.**

The repository contains **70 PL/pgSQL functions** (almost all `SECURITY DEFINER`),
**130 row-level security policies** and **51 triggers** across **41 tables**. The
TanStack frontend is, architecturally, a _thin client over Postgres RPCs_: it calls
45 distinct stored procedures and issues direct table reads against 35 tables and views.

This reframes the migration. It is **not** "put an API in front of the database."
It is **"port an existing backend that happens to be written in SQL into NestJS."**
Every `SECURITY DEFINER` function is already a service method — with validation,
authorization and transaction boundaries — just written in the wrong language for
the target architecture. That is good news for correctness (the behaviour is
specified and testable today) and bad news for effort estimates (there is far more
backend here than the file tree suggests).

The single highest-risk element is the **RLS layer**. 130 policies silently enforce
tenancy today. A NestJS repository issuing queries as a single privileged database
user has **no** equivalent protection unless every one of those predicates is
re-implemented in application code. An incomplete port does not fail loudly — it
leaks data.

---

## 1. Current architecture

```
Browser (React 19 SPA + SSR)
    │
    ├── TanStack Start (Vite 8, nitro build → Cloudflare Workers)
    │     └── src/server.ts — SSR error-normalising wrapper
    │
    ├── @supabase/supabase-js (browser, publishable key, RLS enforced)
    │     └── direct PostgREST calls: .from() reads/writes + .rpc() procedures
    │
    ├── TanStack server functions (only 2 files, service-role key)
    │     └── admin invite creation / signup
    │
    └── Supabase Auth (JWT, session in browser storage)

              ↓  all of the above talk to

Supabase (Lovable Cloud, project acyxxesxhhbxywtzlidc)
    ├── PostgreSQL   — 41 tables, 70 functions, 130 RLS policies, 51 triggers
    ├── GoTrue Auth  — email/password, invites, password reset, email templates
    └── Storage      — 3 buckets: avatars, tutor-documents, learning-resources
```

**There is no application server tier.** SSR exists, but it renders; it does not
mediate data access. The browser holds a JWT and speaks to PostgREST directly.
Security is delegated wholly to RLS and to `SECURITY DEFINER` function guards.

### Build and deployment

| Item            | Value                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------- |
| Bundler         | Vite 8.1.5 via `@lovable.dev/vite-tanstack-config` (opinionated wrapper)                 |
| Framework       | TanStack Start 1.168 / React Router 1.170                                                |
| Server build    | nitro 3.0 beta → Cloudflare Workers (`.output/server/wrangler.json`)                     |
| Package manager | **bun** (`bun.lock`, `bunfig.toml`)                                                      |
| Scripts         | `dev`, `build`, `build:dev`, `preview`, `lint`, `format` — **no `test`, no `typecheck`** |
| Dev port        | 8080 (`.claude/launch.json`)                                                             |

`vite.config.ts` warns explicitly that the Lovable config already injects the
TanStack, Tailwind, nitro and env-injection plugins and that adding them manually
breaks the build. **Treat `vite.config.ts` as fragile.**

### Baseline health (measured 2026-09-22)

| Check          | Result                                                      |
| -------------- | ----------------------------------------------------------- |
| `vite build`   | Passes (837 ms)                                             |
| `tsc --noEmit` | **84 errors**                                               |
| `eslint .`     | 3,306 problems — 3,285 are Prettier formatting; **21 real** |
| Tests          | **None.** No test runner, no test files, no CI config       |

The 84 type errors are overwhelmingly a single root cause: see §3.

---

## 2. Current frontend architecture

### Routing — 65 route files

File-based routing under `src/routes/`. `src/routes/README.md` documents the
conventions and warns that `routeTree.gen.ts` is generated.

| Group                               | Count | Guard                                           |
| ----------------------------------- | ----- | ----------------------------------------------- |
| Public (marketing, discovery, auth) | 16    | none                                            |
| `_authenticated/*`                  | 49    | `beforeLoad` → `supabase.auth.getUser()`        |
| └─ admin                            | 14    | `adminBeforeLoad()` in `src/lib/admin-guard.ts` |
| └─ tutor                            | 17    | role-based in component                         |
| └─ student                          | 8     | role-based in component                         |
| └─ parent/shared                    | 10    | role-based in component                         |

`_authenticated/route.tsx` sets `ssr: false` and checks only that a session exists.
Fine-grained authorization is enforced _in the database_, not in the router.

### State management

- **Server state:** TanStack Query — 89 `useQuery` and 76 `useMutation` call sites.
  Query keys are portal-scoped (`parent-bookings`, `tutor-summary`, …) and
  mutations invalidate across portals where a write is visible to more than one role.
- **Auth state:** React context in `src/hooks/use-auth.tsx` — session, profile,
  roles, resolved permissions, `isAdmin` / `isSuperAdmin` / `mustChangePassword`.
- **No Redux/Zustand/Jotai.** No global client store beyond auth context.

### UI layer

74 components total:

| Directory                       | Count  | Purpose                                                          |
| ------------------------------- | ------ | ---------------------------------------------------------------- |
| `ui/`                           | 48     | shadcn/ui primitives over Radix — **do not touch**               |
| `auth/`                         | 7      | Sign-in/up, forgot/reset password, accept-invite, password input |
| `public/`                       | 5      | Marketing shell, browse, search, tutor cards, class preview      |
| `parent/`                       | 5      | Parent shell, child switcher, class/tutor cards, shared `ui.tsx` |
| `tutor/`                        | 4      | Tutor shell, booking lifecycle, booking/class cards              |
| `student/`, `admin/`, `layout/` | 1 each | Portal shells                                                    |
| `shared/`                       | 2      | `PayNowButton`, `ReportIssueDialog`                              |

Styling is Tailwind v4 + `tw-animate-css`, tokens in `src/styles.css`,
`components.json` drives shadcn generation.

### Forms and validation

Validation is **thin and localised**. Zod + react-hook-form appear in only 6 files,
all authentication-related (`src/lib/auth-validation.ts` plus the five auth forms).

Every other form in the application — booking, availability, tutor onboarding,
admin settings, commission rules — submits **unvalidated input straight to a
Postgres function**, which validates in PL/pgSQL and raises exceptions
(`NOT_AUTHORIZED`, `BOOKING_NOT_PAYABLE`, `ALREADY_PAID`, …).

> **Migration consequence:** DTO validation in NestJS is not a port of existing
> client-side schemas. It is largely **new code**, and the specification for it
> must be extracted from the `raise exception` branches inside the SQL functions.

### Error handling and loading states

- 108 `toast.error` call sites (sonner) — the dominant error surface.
- 52 `try`/`catch` blocks.
- **1** error boundary in the whole application; **0** route-level `pendingComponent`.
- 212 `isPending`/`isLoading` branches and 44 `<Skeleton>` usages — loading states
  are handled per-component, consistently, via TanStack Query flags.
- SSR-level failures are caught by `src/server.ts`, which detects h3's swallowed
  `{"unhandled":true,"message":"HTTPError"}` 500 bodies and re-renders a real error page.
- `src/lib/lovable-error-reporting.ts` and `error-capture.ts` ship errors to the
  Lovable platform — **Lovable-coupled, remove at cutover**.

---

## 3. Current Supabase dependencies

### 3.1 Client construction

| File                                         | Key              | RLS          | Notes                                                                                                                                                     |
| -------------------------------------------- | ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/integrations/supabase/client.ts`        | publishable/anon | **enforced** | Lazy `Proxy` singleton. Custom `fetch` strips `Authorization` for new-style `sb_publishable_` keys and sets `apikey`.                                     |
| `src/integrations/supabase/client.server.ts` | **service role** | **bypassed** | Server-only. Must be imported _dynamically inside handlers_ — a top-level import in a route or `*.functions.ts` would ship the key to the browser bundle. |

`src/integrations/supabase/auth-attacher.ts` is a global TanStack `functionMiddleware`
registered in `src/start.ts`; it attaches the bearer token to every server-function RPC.
`src/start.ts` also re-adds `createCsrfMiddleware` (defining `start.ts` opts out of
the automatic one).

`previewAuthStorage.ts` brokers session storage for Lovable's preview iframe —
**Lovable-coupled, delete at cutover**.

### 3.2 Direct table access — 35 tables/views, ~140 call sites

`students` (10), `tutors` (8), `platform_settings` (8), `profiles` (7), `bookings` (7),
`tutor_documents` (5), `subjects` (5), `notifications` (5), `curricula` (5),
`assignments` (5), `tutor_verification_progress` (4), `tutor_subjects` (4),
`ratings` (4), `notification_templates` (4), `messages` (4), `learning_resources` (4),
`commission_rules` (4), `availability_windows` (4), `verification_steps` (3),
`payments` (3), `education_levels` (3), `currencies` (3), `user_roles` (2),
`payouts` (2), `lesson_notes` (2), `cancellation_policies` (2), `tutor_agencies` (1),
`role_permissions` (1), `permissions` (1), `disputes` (1), `conversation_participants` (1)

Plus four reached only through the untyped `governanceTable` helper, because they
postdate the generated types: `admin_invitations`, `user_permissions`,
`admin_action_requests`, `audit_logs`.

### 3.3 Stored procedures called from the client — 45

| Domain            | RPCs                                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public discovery  | `public_tutor_cards`, `public_tutor_detail`, `public_tutor_reviews`, `public_search_suggestions`, `public_subject_facets`, `public_curriculum_facets`, `public_country_facets`                                                                     |
| Booking & payment | `booking_quote`, `pay_for_booking`, `tutor_respond_booking`                                                                                                                                                                                        |
| Tutor workspace   | `tutor_bookings`, `tutor_students`, `tutor_reviews`, `tutor_dashboard_summary`, `tutor_available_slots`, `tutor_open_class`, `tutor_start_class`, `tutor_end_class`, `tutor_start_conversation`, `tutor_rating_summary`, `tutor_rating_categories` |
| Earnings          | `tutor_earnings_summary`, `tutor_earnings_records`, `tutor_request_payout`                                                                                                                                                                         |
| Verification      | `tutor_submit_verification`, `ensure_tutor_record`                                                                                                                                                                                                 |
| Parent/student    | `parent_dashboard_summary`, `parent_child_progress`, `my_conversations`                                                                                                                                                                            |
| Disputes          | `raise_dispute`, `admin_resolve_dispute`                                                                                                                                                                                                           |
| Admin             | `admin_dashboard_summary`, `admin_report_summary`, `admin_invite_create`, `is_super_admin`                                                                                                                                                         |

> **Correction to the first pass of this audit,** which reported 36. A plain
> `.rpc("` grep undercounts by ten: nine governance procedures are reached
> through the untyped `governanceRpc` helper, and `public_tutor_search` is
> called with a line break after the paren. The missing ten —
> `admin_invite_redeem`, `admin_invite_revoke`, `admin_reject_payout`,
> `admin_request_action`, `admin_review_action`, `admin_set_user_permission`,
> `admin_set_user_roles`, `clear_must_change_password`, `my_permissions`,
> `public_tutor_search` — are now pinned by
> `test/contract/supabase-coupling.test.ts`, which fails if the inventory moves
> in either direction.

### 3.4 The stale-types problem — root cause of 84 type errors

`src/integrations/supabase/types.ts` (2,586 lines, marked _do not edit_) was last
generated **before** the `20260903*` and `20260907*` migrations. Missing entirely:

```
disputes            content_moderation       audit_logs
admin_invitations   user_permission_overrides
admin_report_summary  admin_dashboard_summary  subscription_plans
```

Errors cluster exactly where those objects are used:

```
19  admin.disputes.tsx      10  admin.moderation.tsx
16  admin.reports.tsx        9  lib/admin-data.ts
13  admin.settings.tsx
```

`src/integrations/supabase/governance-types.ts` is a **hand-written shim** that
declares the missing surface and reaches it through narrow `governanceRpc` /
`governanceTable` helpers. Its own header states it becomes redundant once
`supabase gen types` is re-run. `use-auth.tsx` carries the same workaround for the
`super_admin` enum value.

> **Do this before any migration work.** Regenerating types collapses most of the 84
> errors and gives the port an accurate schema to read from. Porting against a
> known-stale type definition would bake the drift into the NestJS entities.

### 3.5 Authentication — Supabase GoTrue

Methods in use: `getSession` (5), `signOut` (5), `resetPasswordForEmail` (4),
`onAuthStateChange` (4), `getUser` (4), `updateUser` (3), `signUp`,
`signInWithPassword`, `resend`, `getClaims`.

Privileged: `auth.admin.inviteUserByEmail` and `auth.admin.updateUserById` in
`src/lib/admin-invite.functions.ts` (service-role, server function only).

Identity resolution in `use-auth.tsx`:

1. `supabase.auth.getSession()`
2. parallel read of `profiles` + `user_roles`
3. `my_permissions()` RPC for effective permissions (per-user overrides and the
   super-admin implicit-all rule cannot be computed in the browser), with a
   fallback to reading `role_permissions` if the `20260907*` migrations are unapplied.

### 3.6 Storage — 3 buckets

| Bucket               | Used by                      | Operations                                           |
| -------------------- | ---------------------------- | ---------------------------------------------------- |
| `avatars`            | profiles                     | RLS-scoped read/write/update/delete by owner         |
| `tutor-documents`    | `src/lib/tutor-data.ts`      | `upload`, `remove`, signed URLs (admin verification) |
| `learning-resources` | `src/lib/tutor-workspace.ts` | `upload`, `remove`, `createSignedUrl(path, 120)`     |

Storage RLS policies are non-trivial: _"Families read shared learning files"_ joins
`storage.objects.name` against `learning_resources.storage_path`. **These join-based
object policies are the hardest part of the storage migration** — an S3-compatible
provider has no equivalent, so the authorization must move into a NestJS
signed-URL-issuing service.

### 3.7 Realtime

**Not used** for data. The only `subscribe`/`unsubscribe` calls are
`onAuthStateChange` listeners. Messaging polls via TanStack Query.
This materially reduces migration risk — there is no websocket layer to replace.

### 3.8 Edge functions

**None.** No `supabase/functions/` directory. Server-side logic lives in
PL/pgSQL and in two TanStack server functions.

---

## 4. Current database entities — 41 tables

**Identity & access (8)** — `profiles`, `user_roles`, `permissions`, `role_permissions`,
`user_permissions`, `admin_invitations`, `admin_action_requests`, `audit_logs`

**Marketplace (7)** — `tutors`, `tutor_agencies`, `tutor_subjects`, `tutor_documents`,
`tutor_verification_progress`, `verification_steps`, `availability_windows`

**Learners (2)** — `students`, `parent`↔`student` links via `students.parent_id`

**Catalogue (5)** — `subjects`, `curricula`, `education_levels`, `currencies`, `exchange_rates`

**Booking & delivery (4)** — `bookings`, `class_sessions`, `cancellation_policies`, `lesson_notes`

**Money (5)** — `payments`, `payouts`, `commission_rules`, `platform_settings`, `subscription_plans` _(dropped by `20260903195507`)_

**Teaching (3)** — `assignments`, `learning_resources`, `rating_categories`

**Feedback (2)** — `ratings`, `rating_category_scores`

**Communication (4)** — `conversations`, `conversation_participants`, `messages`, `notifications`

**Operations (2)** — `notification_templates`, `disputes`

### Enums (15)

`app_role`, `booking_status`, `payment_status`, `payout_status`, `commission_model`,
`verification_status`, `assignment_status`, `resource_type`, `notification_channel`,
`billing_interval`, `dispute_category`, `dispute_status`, `admin_invitation_status`,
`admin_request_status`

### Triggers — 51

Three functional families:

1. **`set_updated_at`** on ~20 tables — trivially replaced by TypeORM/Prisma/Drizzle column decorators.
2. **Audit** — `*_audit` triggers calling `log_audit()` on `bookings`, `payments`, `payouts`, `profiles`, `tutors`, `user_roles`, `user_permissions`, `ratings`, `messages`, `disputes`, `platform_settings`, `admin_invitations`, `admin_action_requests`. **Must be preserved** — this is a compliance surface.
3. **Business invariants** — `bookings_prevent_overlap` (`prevent_booking_overlap()`), `payments_confirm_booking` (`confirm_booking_on_payment()`), `tutors_enforce_verification`, `tutors_admin_only_hourly_rate`, `user_roles_guard` (`enforce_user_role_guards()`), `assignments_notify`, `messages_notify`, `on_auth_user_created` (`handle_new_user()`).

> Family 3 encodes business rules that exist **nowhere else**. Moving them to the
> NestJS service layer trades database-guaranteed invariants for
> application-guaranteed ones. Recommendation: **keep them in PostgreSQL** as
> defence-in-depth even after the service layer duplicates the checks.

---

## 5. Current authentication implementation

| Concern                | Today                                                            | Target                                              |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| Identity store         | Supabase `auth.users`                                            | Own `users` table, or federated                     |
| Token issuance         | GoTrue JWT                                                       | NestJS + `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` |
| Session storage        | Browser storage via `brokeredPreviewStorage()`                   | httpOnly refresh cookie + in-memory access token    |
| Token refresh          | `autoRefreshToken: true`                                         | `/auth/refresh` endpoint                            |
| Route guard            | `beforeLoad` → `getUser()`                                       | `beforeLoad` → `/auth/me`                           |
| Role resolution        | `user_roles` table read + `my_permissions()` RPC                 | Claims in JWT, or `/auth/me`                        |
| Password reset         | `resetPasswordForEmail` + Supabase email templates               | NestJS + SMTP                                       |
| Invite                 | `auth.admin.inviteUserByEmail` with OTP in user metadata         | NestJS invite service + SMTP                        |
| Forced password change | `profiles.must_change_password` + `clear_must_change_password()` | Preserve exactly                                    |
| New-user provisioning  | `on_auth_user_created` → `handle_new_user()`                     | NestJS registration transaction                     |

There is **no refresh-token rotation, revocation list or device session table**
today — GoTrue provided all of it. The NestJS implementation must add these from
scratch. `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are already declared in
`.env` (empty).

### Access control model — three enforcement layers

1. **Route** — `adminBeforeLoad()` (`src/lib/admin-guard.ts`), with a 15-second
   per-user cache of `{roles, mustChangePassword}`. Deliberately coarse: it checks
   `isAdmin`/`superAdminOnly` but **not** individual permissions, to avoid redirect
   loops for scoped admins.
2. **Component** — `hasPermission(key)` from auth context hides UI.
3. **Database** — 130 RLS policies + `is_admin()` / `is_super_admin()` /
   `has_permission()` / `can_access_booking()` / `can_access_student()` /
   `owns_tutor()` / `in_conversation()` guards inside every `SECURITY DEFINER` function.

Layer 3 is the only one that actually protects data. The file header of
`admin-guard.ts` says so explicitly. **Layer 3 is what NestJS must replace.**

### Maker-checker

`admin_request_action` / `admin_review_action` / `admin_execute_action` implement
two-person approval for five actions: `payment.refund`, `booking.cancel_with_refund`,
`payout.settle`, `user_roles.grant_elevated`, `profile.suspend`.
This is a governance feature with regulatory character — **port it before, not after,
the admin write paths it protects.**

---

## 6. Current storage implementation

See §3.6. Summary of migration seams:

- Upload path construction is client-side (`src/lib/tutor-data.ts:337`,
  `src/lib/tutor-workspace.ts:160`).
- Signed URLs are minted client-side with a 120-second TTL.
- Authorization is enforced by storage RLS, including policies that **join
  application tables**.
- `learning_resources.storage_path` and `tutor_documents.storage_path` hold
  provider-relative keys — a provider change requires either key compatibility
  or a data migration of these columns.

---

## 7. Current external integrations

**There are effectively none.** Every third-party seam is stubbed:

| Integration         | Present state                                                                                                                                                                                                                                              | Evidence                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Payments**        | **Simulated.** `pay_for_booking()` inserts a `payments` row with status `paid` and computes the fee/commission split. No gateway, no card capture. `payments.provider` and `payments.provider_reference` exist and are unused.                             | `supabase/migrations/20260903195505_pay_for_booking.sql`, `src/lib/payments.ts` |
| **Email**           | **Supabase Auth only** — signup verification, password reset, invite. No transactional email. `notification_channel` includes `'email'` but `notify_user()` only writes in-app rows. SMTP must be configured in the Supabase dashboard (see runbook §1.2). | `docs/admin-governance-runbook.md`                                              |
| **Classroom/video** | **Not integrated.** `class_sessions.meeting_url` / `meeting_provider` / `recording_url` exist and are never populated. The classroom route renders mic/camera/screen-share controls over a chat backed by the `messages` table.                            | `class_sessions` DDL, `tutor.classroom.$bookingId.tsx`                          |
| **Error reporting** | Lovable platform                                                                                                                                                                                                                                           | `src/lib/lovable-error-reporting.ts`                                            |
| **Cron**            | `LOVABLE_CRON_SECRET` + `src/integrations/supabase/cron-auth.ts`                                                                                                                                                                                           | Lovable-coupled                                                                 |

> **This is the migration's biggest opportunity.** Because no real provider is wired
> in, the adapter interfaces required by the target architecture can be designed
> _clean_, with no legacy provider semantics to accommodate. The `.env` already
> declares `PAYMENT_PROVIDER`, `STORAGE_PROVIDER`, `CLASSROOM_PROVIDER` and their
> credentials. Build the ports now; the first real adapter can come later.

---

## 8. Current routes

### Public (16)

`/`, `/about`, `/explore`, `/tutors`, `/tutors/$tutorId`, `/how-it-works`, `/pricing`,
`/contact`, `/become-a-tutor`, `/for-agencies`, `/trust-and-safety`, `/class-preview`,
`/auth`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/accept-invite`

### Shared authenticated (10)

`/dashboard`, `/account`, `/settings`, `/notifications`, `/bookings`, `/find-tutor`,
`/book/$tutorId`, `/family`, `/children`, `/children/$studentId`

### Student (8)

`/student/dashboard`, `/student/find-tutor`, `/student/book/$tutorId`,
`/student/classroom/$bookingId`, `/student/history`, `/student/materials`,
`/student/messages`, `/student/notifications`

### Tutor (17)

`/tutor/dashboard`, `/tutor/onboarding`, `/tutor/profile`, `/tutor/availability`,
`/tutor/classes`, `/tutor/classroom/$bookingId`, `/tutor/students`,
`/tutor/students/$studentId`, `/tutor/assignments`, `/tutor/resources`,
`/tutor/notes/$bookingId`, `/tutor/earnings`, `/tutor/reviews`, `/tutor/messages`,
`/tutor/verification`, `/tutor/settings`, `/tutor/notifications`

### Admin (14)

`/admin/dashboard`, `/admin/users`, `/admin/admins` _(super-admin only)_,
`/admin/bookings`, `/admin/payments`, `/admin/payouts`, `/admin/disputes`,
`/admin/moderation`, `/admin/verification`, `/admin/approvals`, `/admin/reports`,
`/admin/settings`, `/admin/audit`, `/admin/security`

**None of these may be deleted during migration** (rule 9).

---

## 9. Current business services — `src/lib/`

These 21 modules are the de-facto service layer and map almost one-to-one onto
future NestJS modules.

| File                                               | LOC     | Responsibility                                         | Target NestJS module                 |
| -------------------------------------------------- | ------- | ------------------------------------------------------ | ------------------------------------ |
| `admin-data.ts`                                    | 27.6 KB | Admin CRUD, verification, payouts, storage signed URLs | `AdminModule`                        |
| `tutor-workspace.ts`                               | 18.8 KB | Classroom, messaging, resources, assignments           | `ClassroomModule`, `MessagingModule` |
| `parent-data.ts`                                   | 16.4 KB | Parent dashboard, children, bookings, timezones        | `ParentModule`                       |
| `admin-governance.ts`                              | 16.4 KB | Invites, permissions, maker-checker, audit             | `GovernanceModule`                   |
| `tutor-data.ts`                                    | 14.8 KB | Tutor profile, availability, documents, earnings       | `TutorModule`                        |
| `auth-validation.ts`                               | 8.8 KB  | Zod schemas for auth forms                             | shared DTOs                          |
| `public-data.ts`                                   | 8.2 KB  | Discovery, search, facets                              | `CatalogueModule`                    |
| `student-data.ts`                                  | 6.9 KB  | Student dashboard, materials, history                  | `StudentModule`                      |
| `admin-invite.functions.ts`                        | 6.4 KB  | **Server fn** — service-role invite                    | `GovernanceModule`                   |
| `admin-guard.ts`                                   | 3.9 KB  | Route guard + role cache                               | Nest guards + frontend guard         |
| `error-capture.ts` / `error-page.ts`               | 4.3 KB  | SSR error handling                                     | keep                                 |
| `lovable-error-reporting.ts`                       | 1.7 KB  | Lovable telemetry                                      | **delete at cutover**                |
| `payments.ts`                                      | 1.7 KB  | `pay_for_booking` mutation                             | `PaymentsModule`                     |
| `disputes.ts`                                      | 1.4 KB  | `raise_dispute` mutation                               | `DisputesModule`                     |
| `signup.functions.ts`                              | 1.4 KB  | **Server fn** — signup                                 | `AuthModule`                         |
| `csv.ts`, `brand.ts`, `portal-home.ts`, `utils.ts` | small   | Helpers                                                | keep as-is                           |

---

## 10. Current shared components

**Must remain visually and behaviourally unchanged** (rules 4, 5, 20):

- `src/components/ui/**` — all 48 shadcn primitives
- `src/styles.css` — Tailwind v4 theme tokens
- `components.json` — shadcn configuration
- Portal shells: `PortalShell`, `AdminShell`, `TutorShell`, `StudentShell`,
  `ParentShell`, `PublicShell`
- `src/components/parent/ui.tsx` — `SectionCard`, `CardSkeletonList`, `LoadError`,
  `BookingStatusBadge`; reused by tutor and student routes
- `src/components/shared/` — `PayNowButton`, `ReportIssueDialog`

Only the **data-fetching calls inside** these components change. Their props,
markup and class names must not.

---

## 11. Current environment variables

### Committed to git (`HEAD:.env`) — Supabase only

```
SUPABASE_PROJECT_ID        SUPABASE_PUBLISHABLE_KEY   SUPABASE_URL
VITE_SUPABASE_PROJECT_ID   VITE_SUPABASE_PUBLISHABLE_KEY  VITE_SUPABASE_URL
```

These are publishable/anon keys — public by design; RLS is the protection.

### Referenced in code but _not_ in `.env`

- `SUPABASE_SERVICE_ROLE_KEY` — required by `client.server.ts`; the runbook (§1.1)
  documents that it is missing and must be added to `.env` and Lovable Cloud secrets.
- `LOVABLE_CRON_SECRET`, `LOVABLE_CRON_SECRET_PREVIOUS`

### Uncommitted working-tree additions (117 lines) — the target contract

Someone has already drafted the NestJS environment contract locally. It declares:

`NODE_ENV`, `PORT`, `API_PREFIX`, `CORS_ORIGIN`, `DATABASE_URL`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
`SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `WEBMAIL_URL`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`,
`JWT_REFRESH_EXPIRES_IN`, `VITE_API_BASE_URL`, `PAYMENT_PROVIDER`, `PAYMENT_PUBLIC_KEY`,
`PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`, `STORAGE_PROVIDER`, `STORAGE_BUCKET`,
`CLASSROOM_PROVIDER`, `CLASSROOM_API_KEY`, `CLASSROOM_API_SECRET`

This is a good contract and §12 assumes it. **See BLOCKER-1 — it is not yet safe to commit.**

---

## 12. Proposed target architecture

```
apps/
├── web/            ← existing TanStack app, moved unchanged
│   └── src/lib/api/    ← NEW: typed API client replacing supabase-js
└── api/            ← NEW NestJS application
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── config/                 ConfigModule, Joi/zod-validated env
    │   ├── common/
    │   │   ├── guards/             JwtAuthGuard, RolesGuard, PermissionsGuard
    │   │   ├── interceptors/       LoggingInterceptor, TransformInterceptor
    │   │   ├── filters/            AllExceptionsFilter → RFC7807 problem+json
    │   │   └── decorators/         @CurrentUser, @Roles, @RequirePermission
    │   ├── modules/
    │   │   ├── auth/               login, refresh, reset, invite, me
    │   │   ├── users/              profiles, roles, permissions
    │   │   ├── governance/         invites, maker-checker, audit
    │   │   ├── catalogue/          subjects, curricula, levels, currencies
    │   │   ├── tutors/             profile, availability, verification, docs
    │   │   ├── students/           students, parent↔child links
    │   │   ├── discovery/          search, facets, public tutor cards
    │   │   ├── bookings/           quote, create, respond, cancel
    │   │   ├── payments/           charge, refund, commission, payouts
    │   │   ├── classroom/          sessions, start/end, attendance
    │   │   ├── teaching/           assignments, resources, lesson notes
    │   │   ├── messaging/          conversations, messages
    │   │   ├── ratings/            ratings, category scores
    │   │   ├── notifications/      in-app + email dispatch
    │   │   ├── disputes/           raise, resolve
    │   │   └── admin/              dashboards, reports, moderation
    │   └── integrations/           ← ADAPTER SEAM (rule: interfaces only)
    │       ├── payment/            PaymentProvider  → SimulatedProvider (today)
    │       ├── email/              EmailProvider    → SmtpProvider
    │       ├── storage/            StorageProvider  → S3Provider / SupabaseProvider
    │       └── classroom/          ClassroomProvider→ NullProvider (today)
    └── test/
```

Each module follows **controller → service → repository**. Controllers hold no logic;
services hold business rules; repositories hold SQL. Integrations are reached only
through their interface tokens, injected via DI — never imported concretely by a service.

### Dependency map — current

```
┌─────────────────────────────────────────┐
│  TanStack Frontend (React 19, 65 routes)│
│  74 components · 89 useQuery · 76 useMutation
└────────────────┬────────────────────────┘
                 │  imported directly by 44 files
                 ▼
┌─────────────────────────────────────────┐
│  Current data/API layer                 │
│  src/lib/*.ts (21 modules)              │
│  src/hooks/use-auth.tsx                 │
│  ~140 .from()  ·  45 .rpc()             │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│  Supabase JS client                     │
│  client.ts (anon, RLS) │ client.server.ts (service role, bypass)
└────────────────┬────────────────────────┘
                 ▼
┌──────────────┬──────────────┬───────────┐
│  PostgreSQL  │  GoTrue Auth │  Storage  │
│  41 tables   │  JWT         │  3 buckets│
│  70 functions│  email tmpl  │  RLS      │
│  130 policies│              │  policies │
│  51 triggers │              │           │
└──────────────┴──────────────┴───────────┘
```

### Dependency map — target

```
┌─────────────────────────────────────────┐
│  TanStack Frontend  (UNCHANGED UI/UX)   │
│  same 65 routes · same 74 components    │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│  API Client   src/lib/api/              │
│  typed fetch · auth header · refresh    │
│  error normalisation · same hook names  │
└────────────────┬────────────────────────┘
                 ▼  HTTPS / REST (VITE_API_BASE_URL)
┌─────────────────────────────────────────┐
│  NestJS                                 │
│  Guards → Pipes(DTO) → Interceptors     │
│  Filters → problem+json                 │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│  Modules  (controller → service)        │
│  auth · users · governance · catalogue  │
│  tutors · students · discovery          │
│  bookings · payments · classroom        │
│  teaching · messaging · ratings         │
│  notifications · disputes · admin       │
└────────┬───────────────────────┬────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────┐
│  Repositories    │   │  Integration adapters│
│  parameterised   │   │  PaymentProvider     │
│  SQL · tx mgmt   │   │  EmailProvider(SMTP) │
│  tenancy scoping │   │  StorageProvider     │
└────────┬─────────┘   │  ClassroomProvider   │
         │             └──────────────────────┘
         ▼
┌─────────────────────────────────────────┐
│  PostgreSQL 18.x  (external host)       │
│  Business triggers RETAINED as          │
│  defence-in-depth                       │
│  RLS: see DECISION-1                    │
└─────────────────────────────────────────┘
```

---

## 13. Migration dependencies

Strict ordering constraints — each depends on everything above it:

```
0. Regenerate Supabase types            ← unblocks accurate porting
1. Test harness + API contract tests    ← the only safety net for rules 7/15/16
2. Schema transfer to external PG 18.x  ← everything reads from it
3. AuthModule + JWT + /auth/me          ← every other endpoint needs identity
4. Guards: Roles + Permissions          ← replaces 130 RLS policies
5. Catalogue + Discovery (read-only)    ← lowest risk, proves the pattern
6. Users / Tutors / Students            ← profile surface
7. Bookings                             ← depends on tutors + availability + catalogue
8. Payments                             ← depends on bookings + commission_rules
9. Classroom / Teaching / Messaging     ← depends on bookings
10. Ratings / Disputes                  ← depends on bookings + payments
11. Notifications + SMTP                ← depends on all event sources
12. Governance + Admin + audit          ← depends on everything (reads all domains)
13. Storage adapter                     ← independent; can run parallel from step 5
14. Decommission Supabase               ← only after every above step is verified
```

**Parallelisable:** steps 5–6 and 13. Everything else is serial.

---

## 14. Migration risks

| #   | Risk                                                                                                                                                                          | Severity     | Mitigation                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **RLS removal opens data leaks.** 130 policies enforce tenancy today. A repository querying as one privileged DB user has no equivalent. A missed predicate fails _silently_. | **Critical** | Port every policy predicate to an explicit repository-level `WHERE` scope. Write an authorization test per policy _before_ the endpoint. Consider retaining RLS with `SET LOCAL role` (DECISION-1). |
| R2  | **Business logic in 70 SQL functions.** Far more backend exists than the TS tree suggests. Silent behaviour drift during porting.                                             | **Critical** | Golden-master tests: run the RPC and the new endpoint against the same fixture, diff the output.                                                                                                    |
| R3  | **No tests at all.** Nothing detects regression; rules 15/16 are unsatisfiable.                                                                                               | **Critical** | Step 1 of the sequence. Non-negotiable.                                                                                                                                                             |
| R4  | **Stale generated types.** Porting against a wrong schema bakes in drift.                                                                                                     | High         | Step 0.                                                                                                                                                                                             |
| R5  | **Auth cutover is atomic.** Sessions are Supabase JWTs; switching issuers logs everyone out.                                                                                  | High         | Dual-accept both token types during the window, or schedule a forced re-login.                                                                                                                      |
| R6  | **Storage RLS joins application tables.** No S3 equivalent.                                                                                                                   | High         | Move authorization into a signed-URL service before changing provider.                                                                                                                              |
| R7  | **51 triggers**, 13 of them audit triggers on money tables.                                                                                                                   | High         | Retain triggers in PG. Do not reimplement audit in the service layer only.                                                                                                                          |
| R8  | **Lovable sync.** `AGENTS.md` forbids rewriting published history; commits sync back to the editor and Lovable may itself write to the branch.                                | High         | Long-lived feature branch; never force-push `main`; agree a freeze on Lovable-side edits.                                                                                                           |
| R9  | **`vite.config.ts` is a Lovable wrapper** that forbids manual plugin addition. Monorepo restructuring may break it.                                                           | Medium       | Move the app without editing the config; validate `vite build` after every structural change.                                                                                                       |
| R10 | **Cloudflare Workers runtime.** The frontend deploys to Workers; NestJS needs Node. Two runtimes, two deploy targets, CORS between them.                                      | Medium       | Decide hosting early (DECISION-4). `CORS_ORIGIN` already declared.                                                                                                                                  |
| R11 | **Payments are simulated.** A real gateway introduces async webhooks, idempotency and refund semantics that `pay_for_booking()` never had.                                    | Medium       | Treat as new feature work behind `PaymentProvider`, not as migration.                                                                                                                               |
| R12 | **`super_admin` enum drift** already worked around in two places.                                                                                                             | Low          | Resolved by step 0.                                                                                                                                                                                 |
| R13 | **Agency role is DB-only.** `tutor_agencies`, `agency_id`, `commission_rules.agency_id` and the `agency` role exist; there is **no agency UI**.                               | Low          | Do not invent behaviour (rule 10). Port the schema, build no endpoints until specified.                                                                                                             |

---

## 15. Components that must remain unchanged

**Do not modify in the next phase:**

```
src/components/ui/**            48 shadcn primitives
src/styles.css                  Tailwind v4 tokens
components.json                 shadcn config
src/routeTree.gen.ts            generated
src/integrations/supabase/types.ts   generated (regenerate, never hand-edit)
vite.config.ts                  Lovable wrapper — fragile
src/routes/**  (structure)      file names and URLs are the contract
AGENTS.md                       Lovable sync rules
supabase/migrations/**          historical record — append only, never edit
```

**Modify internals only, never the public surface:**

```
src/components/{admin,auth,layout,parent,public,shared,student,tutor}/**
src/routes/**                   swap data calls; keep markup and classes
src/hooks/use-auth.tsx          swap Supabase for API client; keep AuthContextValue shape
```

`AuthContextValue` is consumed across the whole portal. **Preserving its shape is
what makes the auth cutover a one-file change instead of a 49-route change.**

---

## 16. Recommended migration order

### Phase 0 — Stabilise _(no architecture change)_

1. `git rm --cached .env` and commit the removal — see BLOCKER-1.
2. Regenerate `types.ts`; delete `governance-types.ts`; remove the `super_admin` workaround in `use-auth.tsx`.
3. Fix the residual type errors; add a `typecheck` script.
4. `npm run format` to clear 3,285 Prettier errors in one commit, isolated from logic changes.
5. Add Vitest. Freeze the Supabase coupling inventory and cover the auth DTOs.
6. Add CI: typecheck + lint + test.

**Exit criteria:** `tsc` clean, CI green, booking→payment→class→rating covered end-to-end.

### Phase 1 — Backend skeleton _(no frontend change)_

7. Scaffold `apps/api`; move the web app to `apps/web` **without editing `vite.config.ts`**.
8. `ConfigModule` with schema-validated env; structured logging; `AllExceptionsFilter`.
9. Provision external PostgreSQL 18.x. Transfer schema via the existing migrations.
10. Define the four integration interfaces with today's behaviour as the default adapters.

**Exit criteria:** `/health` responds; schema matches; frontend untouched and still green.

### Phase 2 — Identity

11. `AuthModule`: login, refresh, logout, reset, `/auth/me`.
12. `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` — port `is_admin()`, `is_super_admin()`, `has_permission()`.
13. `src/lib/api/` client; switch `use-auth.tsx` behind the **unchanged** `AuthContextValue`.
14. Dual-accept Supabase and NestJS tokens during the window (R5).

**Exit criteria:** every portal logs in through NestJS; Supabase Auth still live and revertible.

### Phase 3 — Read-only domains

15. Catalogue, then Discovery. Port the 7 `public_*` functions.
16. Run old and new side by side; diff responses until identical.

**Exit criteria:** public pages served by NestJS; Supabase reads removed from those routes only.

### Phase 4 — Transactional core _(highest risk — one domain per PR)_

17. Users/Tutors/Students → 18. Bookings _(keep `prevent_booking_overlap` in PG)_ →
18. Payments _(keep `confirm_booking_on_payment` in PG)_ → 20. Classroom/Teaching/Messaging →
19. Ratings/Disputes.

**Exit criteria per domain:** golden-master parity, authorization tests per RLS policy, rollback verified.

### Phase 5 — Platform services

22. Notifications + SMTP via `EmailProvider` — port `notify_user()` and `render_template()`.
23. Storage: signed-URL service, then provider swap.
24. Governance, admin dashboards, maker-checker, audit read APIs.

### Phase 6 — Decommission

25. Remove `supabase-js`, `client.ts`, `client.server.ts`, `previewAuthStorage.ts`, `auth-attacher.ts`, `lovable-error-reporting.ts`, `cron-auth.ts`.
26. Migrate storage objects; retire the Supabase project **only after a verified backup**.

> Rule 7 holds throughout: Supabase functionality is removed **only** after its
> replacement is implemented _and verified_. Every phase must be independently
> revertible (rule 16).

---

## 17. Items requiring clarification before implementation

### Blockers

**BLOCKER-1 — `.env` is tracked by git.**
`.gitignore` gained a `.env` line in the working tree, but the file is **already
tracked**, so the ignore rule has no effect. The committed version contains only
publishable Supabase keys (harmless), but the **uncommitted** working copy now holds
real values for `DATABASE_URL`, `DB_HOST`, `DB_USERNAME` and `DB_PASSWORD`. The next
`git add -A` publishes production database credentials to a **public GitHub
repository**. Fix before any other work:

```
git rm --cached .env && git commit -m "stop tracking .env"
```

Then add a committed `.env.example` with keys and empty values. `SMTP_PASSWORD`,
`JWT_*_SECRET` and `PAYMENT_SECRET_KEY` are still empty — populate them only after
the file is untracked. Rules 17/18.

**BLOCKER-2 — No tests.**
Rules 15 and 16 require every step to be independently testable and reversible.
Neither is achievable today. Phase 0 must complete first.

**BLOCKER-3 — Supabase CLI access.**
Regenerating `types.ts` needs either `supabase link` against the hosted project
(requires CLI login — user action) or `supabase gen types --local` (requires Docker).
Which is available?

### Decisions needed

**DECISION-1 — RLS in the target.** Three options:
(a) Drop RLS; enforce tenancy in repositories. Simplest, **highest leak risk**.
(b) Keep RLS; have NestJS `SET LOCAL role` / `request.jwt.claims` per transaction. Preserves 130 policies as defence-in-depth; more complex connection handling.
(c) Hybrid — RLS on money and PII tables only.
_Recommendation: (b) for Phase 4 domains, (a) for catalogue/discovery._

**DECISION-2 — ORM.** TypeORM, Prisma, Drizzle, or raw `pg` + a query builder?
Affects repository shape, migration tooling and how the 41 existing tables are
modelled. The existing SQL migrations should remain the source of truth either way.

**DECISION-3 — PL/pgSQL functions: port or retain?** The 70 functions can be
(a) fully ported to TypeScript services, (b) retained and called by repositories, or
(c) ported incrementally with the SQL kept as a fallback.
_Recommendation: (c) — it is the only option that satisfies rule 16 per-domain._

**DECISION-4 — Hosting.** The frontend targets Cloudflare Workers; NestJS needs a
Node runtime. Same origin behind a proxy, or separate origins with CORS?
`CORS_ORIGIN` and `VITE_API_BASE_URL` are already declared.

**DECISION-5 — Repository layout.** Monorepo (`apps/web` + `apps/api`) or a separate
backend repository? Monorepo eases shared DTO types but interacts with Lovable sync (R8).

**DECISION-6 — Lovable exit.** Does Lovable remain the editing surface after
migration? If yes, `AGENTS.md` constraints persist indefinitely and the Lovable
vite wrapper cannot be removed. If no, when does the sync stop?

### Questions on business rules _(rule 10 — do not invent)_

- **Q1 — Payments.** `pay_for_booking()` simulates an instant successful charge. Which
  real provider, and does the fee/commission split (`platform_fee_percentage`,
  `platform_fee_fixed`, tiered volume over a 30-day window) stay exactly as written?
- **Q2 — Agency.** Schema and role exist; no UI. Is agency in scope, and what are its rules?
- **Q3 — Classroom.** `meeting_url` / `meeting_provider` / `recording_url` are unpopulated.
  Which provider, and is recording required?
- **Q4 — Email.** Which of the in-app notification types must also send email?
  `notification_channel` allows it; `notify_user()` never does it.
- **Q5 — `subscription_plans`** was created and then dropped (`20260903195507`).
  Confirm pay-per-lesson only, with no billing plans in the target.
- **Q6 — Data migration.** Is production data being moved to the external PostgreSQL,
  or is this a fresh database? Changes Phase 1 entirely.
- **Q7 — Auth cutover.** Force all users to re-login at cutover, or run dual-token
  acceptance? Affects R5 and the Phase 2 timeline.

---

## Appendix A — Files inspected

**Configuration** `package.json`, `bunfig.toml`, `bun.lock`, `vite.config.ts`,
`tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`,
`components.json`, `.gitignore`, `.env`, `.claude/launch.json`, `supabase/config.toml`,
`AGENTS.md`, `README.md`, `docs/admin-governance-runbook.md`, `src/routes/README.md`

**Application entry** `src/start.ts`, `src/server.ts`, `src/router.tsx`,
`src/routes/__root.tsx`, `src/styles.css`, `src/routeTree.gen.ts`

**Supabase integration** all 8 files in `src/integrations/supabase/`

**Business logic** all 21 files in `src/lib/`

**Hooks** `use-auth.tsx`, `use-mobile.tsx`, `use-portal-redirect.ts`

**Routes** all 65 route files (structure, guards and data-access patterns)

**Components** all 74 files across 9 directories

**Database** all 35 files in `supabase/migrations/`

---

## Appendix B — Supabase dependency inventory (summary)

| Surface                             | Count                       | Replacement                              |
| ----------------------------------- | --------------------------- | ---------------------------------------- |
| Files importing the Supabase client | 44                          | `src/lib/api/` client                    |
| Direct table reads/writes           | ~140 across 35 tables/views | REST endpoints                           |
| Stored-procedure calls              | 45 distinct RPCs            | NestJS services                          |
| PL/pgSQL functions in schema        | 70                          | services + retained SQL                  |
| RLS policies                        | 130                         | guards + repository scoping (DECISION-1) |
| Triggers                            | 51                          | retain in PostgreSQL                     |
| Tables                              | 41                          | same schema, external PG 18.x            |
| Enums                               | 15                          | same                                     |
| Auth methods                        | 10                          | `AuthModule`                             |
| Storage buckets                     | 3                           | `StorageProvider`                        |
| Edge functions                      | 0                           | n/a                                      |
| Realtime subscriptions              | 0 (data)                    | n/a                                      |
| TanStack server functions           | 2                           | controllers                              |

---

_End of audit. No application code was modified in producing this document._
