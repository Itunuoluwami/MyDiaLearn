# Supabase removal report — frontend

_Prepared 2026-09-29, at the start of the final migration stage._

## Decision

**Supabase cannot yet be removed from the frontend.** Two dependencies remain
genuinely required, and the remaining Supabase code is the fallback for flows
whose API replacement has not yet been verified end to end in the UI. Both
`AGENTS.md` (rule 1) and the task rule _"if any feature still depends on
Supabase, stop removal for that feature"_ apply.

What this stage did instead:

1. Inventoried every Supabase reference in `src/` and classified it (below).
2. Found and migrated **seven call sites that had no API path at all** — an
   earlier audit had missed them (see _Correction_).
3. Removed the one reference that is safe to remove today.
4. Ran every check available and recorded exactly what is and is not verified.
5. Found and fixed an API reliability bug that the verification surfaced.

Under `VITE_AUTH_PROVIDER=nestjs` the app now makes **no requests to Supabase**:
every data call takes its API branch first, and the Supabase client is created
lazily, so it is never constructed on those paths. Verified on the public
pages in the running app (0 Supabase requests on `/`, `/find-tutors`, `/auth`,
`/auth/forgot-password`, `/for-agencies`).

## Sources read

- `docs/ARCHITECTURE_MIGRATION.md` — §3 (Supabase dependencies), §6 (storage),
  §11 (environment), §16 Phase 6 (decommission), §18.
- `docs/database-migration-map.md`, `docs/backend-architecture.md`.
- `docs/storage-migration.md` — **does not exist.** Storage has not been
  migrated; there is no storage provider behind the API
  (`STORAGE_PROVIDER=unconfigured`).
- Commit history of this migration (each commit message is its report).

## Correction

The previous audit (commit `4d7123c`) stated that every data call had an API
branch. That was wrong: its scanner matched `supabase.from(` on one line and
missed calls written as `await supabase` / `.from(...)` across two lines. The
full scan for this report found seven such calls, now migrated:

| File                                            | Call                      | Now                                            |
| ----------------------------------------------- | ------------------------- | ---------------------------------------------- |
| `components/auth/SignUpForm.tsx`                | read `auth.account_types` | `GET /catalogue/settings`                      |
| `routes/_authenticated/notifications.tsx`       | mark notifications read   | `POST /notifications/read`                     |
| `routes/_authenticated/tutor.notifications.tsx` | mark notifications read   | `POST /notifications/read`                     |
| `routes/_authenticated/settings.tsx`            | currencies; save profile  | `GET /catalogue/currencies`; `PATCH /users/me` |
| `routes/_authenticated/tutor.settings.tsx`      | currencies; save profile  | `GET /catalogue/currencies`; `PATCH /users/me` |
| `routes/_authenticated/bookings.tsx`            | family cancels a lesson   | **new** `POST /bookings/:id/cancel`            |
| `routes/_authenticated/tutor.onboarding.tsx`    | save timezone/country     | `PATCH /users/me`                              |

`POST /bookings/:id/cancel` did not exist. It allows exactly what the page
offers the button for — a **pending, unpaid** lesson, by its booker or the
student's family — and nothing more. A paid lesson is cancelled by an admin,
where the cancellation policy's refund applies. No rule was invented: the
condition is the page's own.

## Inventory and classification

Scan: every `supabase.*`, `supabaseAdmin.*`, `governanceRpc(` and
`governanceTable(` call in `src/`, with multi-line calls included; each checked
for an API branch in its enclosing query, mutation or function.

**191 calls. 182 have an API branch. The other 9:**

| Where                                                                                                                          | What                                                        | Classification                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `lib/parent-data.ts` — `fetchChildrenSupabase`, `fetchBookingsSupabase`, `fetchPaymentsSupabase`, `fetchNotificationsSupabase` | Supabase fallbacks, called only after the API branch        | REQUIRED BY REMAINING SYSTEM (fallback, see below)                                         |
| `lib/tutor-workspace.ts` — `openStoredFile`, `useSignedResourceUrl`                                                            | Signed URLs from the `learning-resources` bucket            | **REQUIRED BY REMAINING SYSTEM — storage**                                                 |
| `lib/admin-invite.functions.ts` (2)                                                                                            | GoTrue `inviteUserByEmail` in the Supabase-only invite path | REQUIRED BY REMAINING SYSTEM (fallback; the API path uses `/admin/governance/invitations`) |
| `lib/auth/types.ts`                                                                                                            | a comment                                                   | not a call                                                                                 |

### By kind

| Kind                                                          | Where                                                                                                                       | Classification                                                                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Database queries (`from`, `rpc`, `governanceRpc/Table`) — 182 | `lib/*-data.ts`, `lib/admin-*.ts`, `lib/payments.ts`, `lib/disputes.ts`, 12 route files                                     | REQUIRED BY REMAINING SYSTEM until the flows below are verified; each is the `else` of an API branch                                       |
| **Storage** — buckets `tutor-documents`, `learning-resources` | `tutor-data.ts` (upload/remove), `tutor-workspace.ts` (upload/remove/signed URLs), `admin-data.ts` (document URL)           | **REQUIRED.** No storage provider exists. Under the API these features are disabled with an explanatory message, not served from Supabase. |
| Auth (`supabase.auth.*`)                                      | `lib/auth/supabase-adapter.ts`                                                                                              | REQUIRED as the provider switch until cutover is verified (`VITE_AUTH_PROVIDER=supabase` is the rollback)                                  |
| GoTrue admin (`supabaseAdmin.auth.admin.*`)                   | `lib/admin-invite.functions.ts`, `client.server.ts`                                                                         | REQUIRED only by the Supabase invite path                                                                                                  |
| Server-function middleware                                    | `integrations/supabase/auth-attacher.ts` (registered in `start.ts`), `auth-middleware.ts`                                   | REQUIRED while `admin-invite.functions.ts` exists                                                                                          |
| Client construction                                           | `integrations/supabase/client.ts` (+ `previewAuthStorage.ts`)                                                               | REQUIRED while any fallback exists. `previewAuthStorage.ts` is Lovable-specific and goes with the client.                                  |
| Types                                                         | `integrations/supabase/types.ts`, `governance-types.ts`                                                                     | REQUIRED — used for row types across the app, including API branches. Retire only by replacing them with API-owned types.                  |
| Realtime (`channel`)                                          | none                                                                                                                        | — (not used; confirmed by scan)                                                                                                            |
| Edge functions (`functions.invoke`)                           | none                                                                                                                        | —                                                                                                                                          |
| Environment                                                   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` | REQUIRED while the client exists (the client throws if they are missing)                                                                   |
| Dependency                                                    | `@supabase/supabase-js` in `package.json`                                                                                   | REQUIRED while the client exists                                                                                                           |
| **Re-export** `supabase` from `lib/api/data-client.ts`        | unused anywhere                                                                                                             | **SAFE TO REMOVE — removed**                                                                                                               |

## Verification

### Automated — all passing

| Check                                    | Result                                       |
| ---------------------------------------- | -------------------------------------------- |
| Frontend typecheck (`typecheck:ratchet`) | 32 known errors, baseline 32 — no new errors |
| Frontend lint                            | 0 errors                                     |
| Frontend unit + contract tests           | 78 / 78                                      |
| Frontend build                           | passes                                       |
| Backend unit tests                       | 167 / 167                                    |
| Backend lint and build                   | pass                                         |
| Backend integration suite (`test:e2e`)   | **cannot run** — see _Blocked_               |

### Live API flows — 42 / 42 passing

Run against the running API as the sample tutor, plus unauthenticated checks.

| Flow             | Verified                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Login            | sign in (token + refresh cookie), wrong password refused, `/users/me`, refresh rotation                 |
| Logout           | logout revokes the refresh session (refresh afterwards → 401)                                           |
| Registration     | duplicate email → 409, invalid payload → 400                                                            |
| Password reset   | request for an unknown address answers identically (no leak); invalid token → 400                       |
| Tutor onboarding | profile read and save; subjects, availability, verification, documents, dashboard                       |
| Tutor discovery  | search, subjects, curricula, levels, settings, currencies, policies, tutor profile + subjects + reviews |
| Booking          | bookable slots; family cancel of an unknown booking → 404                                               |
| Lesson flow      | tutor schedule; lesson notes on someone else's booking refused                                          |
| Payment          | earnings, payouts; unsigned webhook → 401; paying an unknown booking → 404                              |
| Notifications    | list, unread count, mark read                                                                           |
| Messaging        | conversations; posting into a conversation you are not in refused                                       |
| Authorization    | a tutor is refused admin and agency routes                                                              |

### Verified at the database level (rolled-back transactions, earlier stages)

Booking → payment (fee, commission and agency split) → tutor acceptance →
confirmation; refunds through the approval queue and admin cancellation;
admin invitations, redemption and maker-checker approval; tutor verification
review; agency creation, tutor attachment, listing gate and payouts;
self-provisioned student records. These prove the SQL; they do not exercise
the UI.

### Not yet verified end to end — why removal stops here

These need signed-in sessions this stage did not have (no parent, student,
admin or agency password; new accounts need a real inbox to verify):

- registration **success** and email verification, password reset **completion**
- parent: add a child, book, pay, cancel an unpaid lesson, rate, progress
- student: dashboard, history, classroom, assignments submit, messages reply
- tutor: accept a booking, start/end a class, lesson notes, assignments review
- admin: every page with a real admin session (approvals need two admins)
- agency: sign-up, add a tutor, manage, earnings

Until these are clicked through once, their Supabase fallbacks stay.

### Blocked

- **Backend integration suite.** `@nestjs/mapped-types` 12 ships as ESM only;
  Jest cannot `require` it on Node 20 (the running API can — Node 20.19
  supports `require(esm)`). Fixes: run the suite on Node ≥ 24.9, or replace
  `PartialType` in `students/dto/student.dto.ts` with an explicit class. Not
  changed here.
- **Storage.** No provider; `docs/storage-migration.md` is still to be written.

## Found and fixed during verification

**Public pages returned 500s after an idle period.** The home page fires
several requests at once; each opens a transaction, and opening connections to
the remote database can exceed Prisma's default 2 s wait — "Unable to start a
transaction in the given time". `PrismaService` now waits up to 10 s for a
connection (`withUser` and `asAnonymous`) and keeps pooled connections alive.
Re-tested: 12 concurrent requests from a cold start, all 200.

## Removal plan — to finish decommissioning

1. **Verify** the flows listed above in the UI with `VITE_AUTH_PROVIDER=nestjs`.
2. **Storage:** choose a provider, implement it behind `STORAGE_PROVIDER`,
   write `docs/storage-migration.md`, migrate objects from the
   `tutor-documents` and `learning-resources` buckets (and `avatars`), and
   issue signed URLs from the API.
3. **Delete the fallbacks**, file by file: in each hook keep the API branch and
   remove the Supabase `else`; delete `fetch*Supabase` helpers; remove the
   `governanceRpc/Table` fallbacks; update
   `test/contract/supabase-coupling.test.ts` as each entry disappears (the
   test fails in both directions by design).
4. **Auth:** remove `supabase-adapter.ts` and the provider switch;
   `admin-invite.functions.ts`, `auth-attacher.ts` (and its registration in
   `start.ts`), `auth-middleware.ts`, `client.server.ts`.
5. **Types:** replace `Database[...]` row types with API-owned types, then
   delete `integrations/supabase/types.ts` and `governance-types.ts`.
6. **Client:** delete `client.ts` and `previewAuthStorage.ts`, the
   `VITE_SUPABASE_*` / `SUPABASE_*` variables, and `@supabase/supabase-js`.
7. Retire the Supabase project only after a verified backup
   (`ARCHITECTURE_MIGRATION.md` §16, step 26).
