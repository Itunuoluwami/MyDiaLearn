# DiaLearn backend architecture

**Status:** Foundation phase. The backend boots, serves `/health`, and defines
every boundary the migration will fill. It owns no feature yet, and Supabase
still serves the entire product.

**Companion document:** [`ARCHITECTURE_MIGRATION.md`](./ARCHITECTURE_MIGRATION.md)
— the audit this design answers. Read its executive finding first: DiaLearn's
business logic and authorization live in PostgreSQL, not TypeScript.

---

## What this phase does and does not do

|              |                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Does**     | Application skeleton, DI wiring, configuration contract, error handling, logging, security posture, integration ports, repository pattern, health checks, tests |
| **Does not** | Serve any product feature, replace any Supabase call, own any data, issue any token                                                                             |

No existing behaviour changed. The frontend builds and runs exactly as before,
because nothing in `src/` was touched.

---

## 1. Module boundaries

```
backend/src/
├── main.ts              process entry — boot, listen
├── bootstrap.ts         app-instance config shared by main.ts and e2e tests
├── app.module.ts        composition root: global guards, filter, interceptor
│
├── config/              the ONLY place process.env is read
├── common/              cross-cutting: guards, filters, interceptors, …
├── database/            Prisma client + repositories
├── integrations/        ports and adapters for external providers
├── shared/              DTOs reused across domains
│
└── <domain>/            auth, users, parents, students, tutors, agencies,
                         bookings, payments, notifications, files, health
```

Domain modules are empty by design. Each carries a header naming the RPCs,
tables and triggers it will take over, drawn from the audit — so the boundary
is a specification, not a placeholder. `agencies/` is deliberately the emptiest:
the schema has `tutor_agencies` and an `agency` role but no UI and no RPC, and
filling it in would mean inventing business rules.

### Dependency direction

```
controller  →  service  →  repository  →  PrismaService  →  PostgreSQL
                  ↓
            integration port  →  adapter  →  external provider
```

Dependencies point inward and never reverse. Concretely:

- **Controllers** do HTTP only: validate, delegate, shape the response. No
  database access, no business rules.
- **Services** hold business logic. They depend on repository classes and on
  integration _tokens_, never on a provider implementation.
- **Repositories** are the only code that touches Prisma.
- **Adapters** are the only code that knows a provider's name.

---

## 2. Dependency injection

Everything is constructor-injected; nothing is imported as a singleton.

Three global modules mean feature modules do not re-import infrastructure:
`AppConfigModule`, `DatabaseModule`, `IntegrationsModule`. `JwtModule` is
registered `global: true` for the same reason.

Integration ports are injected by **symbol token**, not by class:

```ts
constructor(@Inject(EMAIL_SERVICE) private readonly email: EmailService) {}
```

A symbol cannot be imported by accident the way a class can, which is what
keeps a service from quietly acquiring a dependency on `SmtpEmailProvider`.

### Global providers, in order

| Order | Provider              | Why here                                    |
| ----- | --------------------- | ------------------------------------------- |
| 1     | `ThrottlerGuard`      | Reject floods before any work is done       |
| 2     | `JwtAuthGuard`        | Establish who is calling                    |
| 3     | `RolesGuard`          | Coarse role check against that identity     |
| 4     | `PermissionsGuard`    | Fine-grained permission check               |
| —     | `AllExceptionsFilter` | One error shape for every failure           |
| —     | `LoggingInterceptor`  | Per-request timing, keyed by correlation id |

`JwtAuthGuard` is bound globally, so **the API denies by default**. A route
opts out with `@Public()`. Forgetting the decorator makes an endpoint
unreachable — a loud failure. The opposite arrangement, adding a guard per
route, fails silently by leaving an endpoint open.

One caveat, pinned by an e2e test: guards run per _matched handler_, so an
unrouted path returns 404 without reaching the guard chain. Deny-by-default
protects declared routes, not the absence of one.

---

## 3. Repository pattern

Repositories extend `BaseRepository` and are the sole users of `PrismaService`.
That rule earns its keep for one specific reason.

> The database enforces tenancy with **130 row-level security policies**.
> Prisma connects as a single privileged role, so **none of them apply**.

Every repository method must therefore reproduce the predicate of the policy it
replaces — `where: { userId }`, `where: { tutorId }` — in its own query. This is
the highest-risk part of the whole migration, because a missing predicate does
not throw. It returns more rows.

Keeping queries in one layer makes that auditable. Scattering them through
services makes it impossible to review.

A second reason: several domains will keep calling the existing PL/pgSQL
functions rather than reimplementing them immediately. A repository can switch
from `$queryRaw` against a function to a native Prisma query without its callers
noticing, which is what makes each domain independently revertible
(migration rule 16).

### Prisma, and a warning

`prisma/schema.prisma` models **two** tables, `profiles` and `user_roles`,
because authentication needs them first. The database has 41.

**Do not run `prisma migrate dev` against the existing database.** Prisma diffs
the schema file against the database and generates SQL to make them match —
which, with a partial schema, means dropping everything not modelled. Use
`npm run db:pull` (introspection, read-only) to add models. `supabase/migrations`
remains the source of truth for DDL, and Prisma cannot see functions, policies
or triggers at all.

The client is built on the **pg driver adapter** rather than Prisma's own engine
connection. That is deliberate: preserving RLS (option (b) of DECISION-1) means
issuing `SET LOCAL request.jwt.claims` per transaction, which needs a real `pg`
pool. This choice keeps that option open.

---

## 4. Integration pattern

Four ports, each an interface plus a DI token, each with at least one adapter:

| Port                | Token                | Adapter today                            | Reflects                                        |
| ------------------- | -------------------- | ---------------------------------------- | ----------------------------------------------- |
| `EmailService`      | `EMAIL_SERVICE`      | `LogEmailProvider` / `SmtpEmailProvider` | No transactional email exists yet               |
| `PaymentProvider`   | `PAYMENT_PROVIDER`   | `SimulatedPaymentProvider`               | `pay_for_booking()` simulates an instant charge |
| `StorageProvider`   | `STORAGE_PROVIDER`   | `UnconfiguredStorageProvider`            | Supabase Storage still owns files               |
| `ClassroomProvider` | `CLASSROOM_PROVIDER` | `NoneClassroomProvider`                  | `meeting_url` has never been populated          |

`IntegrationsModule` is the only file that names a concrete adapter. Selection
is by environment variable. Adding a provider means writing an adapter, adding
its name to the enum in `env.validation.ts`, and adding a case — nothing else.

Three principles the defaults follow:

**Adapters describe reality, not aspiration.** `SimulatedPaymentProvider` is not
a stub to delete; it is the faithful adapter for how DiaLearn works right now.
That lets the payment domain migrate to NestJS _without_ simultaneously
introducing a live gateway — two reversible changes instead of one irreversible
one.

**Unconfigured means loud, not silent.** `UnconfiguredStorageProvider` throws
501 on every call. A no-op that returned success would let uploads appear to
work while files vanished.

**Interfaces are shaped for the real thing.** `ChargeRequest` carries an
idempotency key, amounts in minor units, and an async status; `verifyWebhook`
is part of the port. Designing to the simulation would guarantee a rewrite.

One guard rail: the app **refuses to start** with `PAYMENT_PROVIDER=simulated`
and `APP_ENV=production`. A simulated gateway in production would mark every
booking paid while no money moved.

---

## 5. Configuration

`src/config/` is the only place `process.env` is read.

`env.validation.ts` is a Joi schema checked at boot with `abortEarly: false`, so
one start reports every problem rather than one per restart. **Secrets have no
defaults.** Anything with a default is safe to be wrong.

`configuration.ts` exposes typed namespaces — `app`, `database`, `jwt`, `smtp`,
`integrations`, `rateLimit` — injected by key:

```ts
constructor(@Inject(appConfig.KEY) private readonly app: AppConfig) {}
```

This makes configuration trivially fakeable in tests and keeps the environment
contract in one reviewable file.

### Variables

`APP_ENV` · `PORT` · `API_PREFIX` · `CORS_ORIGIN` · `LOG_LEVEL` ·
`DATABASE_URL` · `JWT_SECRET` · `JWT_ACCESS_EXPIRES_IN` · `JWT_REFRESH_SECRET` ·
`JWT_REFRESH_EXPIRES_IN` · `SMTP_HOST` · `SMTP_PORT` · `SMTP_SECURE` ·
`SMTP_USER` · `SMTP_PASSWORD` · `SMTP_FROM_EMAIL` · `SMTP_FROM_NAME` ·
`EMAIL_PROVIDER` · `PAYMENT_PROVIDER` · `STORAGE_PROVIDER` ·
`CLASSROOM_PROVIDER` · `RATE_LIMIT_TTL_SECONDS` · `RATE_LIMIT_MAX`

`backend/.env.example` documents all of them. `backend/.env` is gitignored.

> **Nothing here is `VITE_`-prefixed, and nothing here may be.** The frontend
> build inlines `VITE_*` into the browser bundle. `DATABASE_URL` or `JWT_SECRET`
> reaching it would publish them to every visitor.

---

## 6. Error handling

`AllExceptionsFilter` gives every failure one shape:

```json
{
  "statusCode": 401,
  "code": "UNAUTHENTICATED",
  "message": "Invalid or expired access token.",
  "requestId": "3f2b…",
  "timestamp": "2026-09-23T07:54:03.665Z",
  "path": "/api/probe/protected"
}
```

`code` is a stable enum. Several members deliberately reuse the vocabulary of
the PL/pgSQL functions they will replace — `NOT_AUTHORIZED`, `NOT_FOUND` — so a
migrated endpoint can be diffed against its RPC without the client learning a
second set of names.

**Safety rules, both tested:**

1. **Unexpected errors never leak.** An `AppException` is written for the caller
   and passes through. Anything else is logged in full and replaced with
   "An unexpected error occurred." A raw `Error` message can carry a connection
   string or a row of user data.
2. **5xx gets a stack, 4xx does not.** Logging a stack for every failed
   validation buries real incidents.

Validation errors are surfaced as a `details` array rather than one flattened
string, via the `exceptionFactory` in `createValidationPipe()`.

### Request correlation

`RequestIdMiddleware` honours an inbound `x-request-id` or mints one, attaches
it to the request, and echoes it on the response. The logger and the error body
quote the same value — which is what makes a user-reported error findable.

### Logging

`nestjs-pino`, structured JSON, pretty-printed in development only. Redacted:
`authorization`, `cookie`, `set-cookie`, `body.password`, `body.confirmPassword`,
`body.otp`. `/health` is excluded from auto-logging so probes do not dominate
volume. `LoggingInterceptor` never logs request bodies — they carry passwords,
OTPs and payment details.

---

## 7. Security

| Control        | Implementation                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| Authentication | `JwtAuthGuard`, global, deny-by-default                                        |
| Authorization  | `RolesGuard` + `PermissionsGuard`, mirroring `has_role()` / `has_permission()` |
| Headers        | `helmet` — HSTS, `nosniff`, frame options, no `x-powered-by`                   |
| CORS           | Explicit origin allow-list from `CORS_ORIGIN`                                  |
| Validation     | Global `ValidationPipe`, `whitelist` + `forbidNonWhitelisted`                  |
| Env validation | Joi at boot; the app refuses to start when it fails                            |
| Rate limiting  | `ThrottlerGuard`, configurable, skipped on `/health`                           |

`forbidNonWhitelisted` matters more here than usual: the frontend currently
posts to Postgres functions with no client-side validation at all, so these DTOs
are the first place unexpected input is ever caught.

`super_admin` short-circuits both authorization guards, matching `is_admin()`.

> **Role checks are not tenancy.** Holding the `tutor` role says nothing about
> whether this tutor may read _that_ booking. Row scoping belongs in the
> repository layer. Treating a role check as sufficient is exactly how removing
> RLS leaks data.

---

## 8. Health checks

| Endpoint            | Behaviour                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `GET /health`       | Always 200 while the process answers. Reports `ok` or `degraded` with per-component detail |
| `GET /health/live`  | Liveness. No dependencies consulted                                                        |
| `GET /health/ready` | Readiness. 503 when the database is down, so traffic is withheld                           |

All three are `@Public()` and skip throttling — a health endpoint that needs a
token is useless to a load balancer, and one that can be rate-limited into
silence inverts its own purpose. They sit outside `API_PREFIX` so probes do not
have to track it.

The database error is reported as a **class name only**. The message can name
the host, database and user; none of that belongs in an unauthenticated body.

A note on `PrismaService`: `$connect()` with a driver adapter does not open a
socket, so it succeeds against a database that does not exist. Startup
therefore verifies with an actual `SELECT 1`.

---

## 9. Testing strategy

Three layers, all runnable without a database:

**Unit** (`src/**/*.spec.ts`, Jest) — a class with its collaborators faked
through the DI container. `health.service.spec.ts` asserts behaviour, including
that a database error never leaks credentials into the response.

**End-to-end** (`test/*.e2e-spec.ts`, Jest + supertest) — boots the _real_
module graph with no database reachable. This is the cheapest check that the
foundation holds together: a misconfigured provider, an unbound token or a guard
that cannot resolve a dependency all fail here. It uses `configureApp()`, the
same function `main.ts` uses, so assertions about headers and prefixes describe
the application that actually ships.

Because the foundation ships no protected endpoints, the e2e suite registers a
`ProbeController` in the root testing module to exercise the global guard chain.

**Frontend** (repo root, Vitest) — unchanged. `test/contract/supabase-coupling.test.ts`
remains the migration's progress meter: 45 stored procedures and 35 tables,
failing in both directions.

```sh
cd backend && npm test        # unit
cd backend && npm run test:e2e
cd .. && bun run test         # frontend
```

---

## 10. Scripts

| Command                                   | Purpose                                        |
| ----------------------------------------- | ---------------------------------------------- |
| `dev`                                     | Watch-mode server                              |
| `build` / `start:prod`                    | Compile to `dist/`, run it                     |
| `lint` / `format`                         | ESLint, Prettier                               |
| `test` / `test:watch` / `test:cov`        | Unit tests                                     |
| `test:e2e`                                | End-to-end                                     |
| `db:generate`                             | Regenerate the Prisma client                   |
| `db:pull`                                 | **Introspect** — the safe way to add models    |
| `db:migrate`                              | `prisma migrate dev` — see the warning in §3   |
| `db:migrate:deploy` / `db:migrate:status` | Deployment-side migration                      |
| `db:seed`                                 | Seed (currently guarded and empty — see below) |
| `db:studio`                               | Prisma Studio                                  |

`prisma/seed.ts` seeds nothing. DiaLearn's reference data — subjects, curricula,
currencies, commission rules, notification templates — is admin-managed and
already exists. Rule 11 forbids hardcoding it, and inventing plausible rows
would create a second, divergent source of truth. The file exists for the guard:
it refuses to run when `APP_ENV` is `production` or `staging`.

---

## 11. Database state

**Populated, 2026-09-23.** The schema was built on the external PostgreSQL 18.4
server directly from `supabase/migrations`, with no pg_dump and nothing
extracted from the Supabase project.

| Object         | Count                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Tables         | 40 (41 minus `subscription_plans`, which migration `20260903195507` drops)        |
| Functions      | 68                                                                                |
| RLS policies   | 123 (111 public, 12 storage)                                                      |
| Triggers       | 49                                                                                |
| Enums          | 13                                                                                |
| Reference rows | subjects 13, education levels 24, curricula 6, currencies 8, platform settings 28 |

`npm run db:schema:apply` applies the compatibility layer in
`prisma/sql/000_compat.sql` and then all 35 migrations, each in its own
transaction. `db:schema:dryrun` does the same and rolls back. Apply refuses to
run against a non-empty public schema.

### The compatibility layer

Three things stand between those migrations and a plain PostgreSQL server:

1. **`auth.uid()`** — 124 call sites across 19 migrations. The shim reads
   `current_setting('request.jwt.claims')`, which the backend sets per
   transaction with `SET LOCAL`. All 123 RLS policies therefore work unchanged,
   and that is why `PrismaService` is built on the pg driver adapter.
2. **`auth.users`** — 10 foreign keys point at it. Now an ordinary table in this
   database, which `AuthModule` takes ownership of in Phase 2.
3. **`storage`** — schema, buckets, objects and `storage.foldername()`, so the
   12 storage policies can exist. The authorization they express moves into the
   files module before a signed URL is minted.

Two adjustments are made by the runner rather than the SQL, because the database
user is not a superuser:

- **Role targets become `PUBLIC`.** `CREATE ROLE` is not permitted, so `anon`,
  `authenticated` and `service_role` do not exist. Nothing is lost: those roles
  existed for PostgREST to switch between, and the backend connects as a single
  owning user. Policy _predicates_ are untouched.
- **`ALTER EXTENSION btree_gist SET SCHEMA` is stripped.** Moving an extension
  requires ownership of its internal types; the compat layer creates it in
  `extensions` directly instead.

### Constraints Prisma cannot see

Introspection warns about three exclusion constraints it will not model:
`bookings_no_tutor_overlap`, `bookings_no_student_overlap` and
`students_owner_present`. They remain enforced by PostgreSQL, which is the right
place for them — the rule that a tutor cannot be double-booked should not depend
on application code remembering to check.

### PgBouncer

Port 6432 is a connection pooler in transaction mode. Two consequences already
met: session-level startup parameters such as `statement_timeout` are rejected,
and a failed login is cached and replayed after its cause is fixed — which is
what made a lowercase database name look like a missing database for far longer
than it should have.

`SET LOCAL` is transaction-scoped and works normally, so the `auth.uid()` shim
is unaffected.

### Still open

DECISION-3 (port vs retain the PL/pgSQL functions), DECISION-4 (hosting split),
and business-rule questions Q1-Q7. DECISION-1 is effectively settled: RLS is
preserved, because the compatibility layer made keeping it cheaper than
replacing it.

---

## 12. Authentication

_Phase 2, 2026-09-23. NestJS owns authentication. Supabase remains available
behind a configuration switch and is still the default._

### Endpoints

| Method | Path                        | Auth         | Purpose                             |
| ------ | --------------------------- | ------------ | ----------------------------------- |
| POST   | `/api/auth/register`        | public       | Create an account                   |
| POST   | `/api/auth/login`           | public       | Issue a session                     |
| POST   | `/api/auth/refresh`         | public       | Rotate tokens                       |
| POST   | `/api/auth/logout`          | public       | Revoke the session                  |
| GET    | `/api/auth/me`              | **required** | Current account, roles, permissions |
| POST   | `/api/auth/password/forgot` | public       | Send a reset link                   |
| POST   | `/api/auth/password/reset`  | public       | Consume a reset token               |
| POST   | `/api/auth/password/change` | **required** | Change a known password             |
| POST   | `/api/auth/email/verify`    | public       | Consume a verification token        |
| POST   | `/api/auth/email/resend`    | public       | Re-send verification                |

They sit under `API_PREFIX`, so with the default they are `/api/auth/...`. Set
`API_PREFIX=` for bare `/auth/...`.

### Token strategy

|               | Where it lives                                        | Lifetime |
| ------------- | ----------------------------------------------------- | -------- |
| Access token  | Response body, held in memory by the frontend adapter | 15 min   |
| Refresh token | httpOnly `SameSite` cookie                            | 7 days   |

This is the one place the migration deliberately improves on the incumbent.
Supabase keeps the whole session in `localStorage`, where any XSS can read it.
Here the access token never touches storage and the refresh token is a cookie
the page cannot read, so stealing a long-lived session takes more than reading
`localStorage`.

The user-visible behaviour is unchanged: a reload still lands you signed in,
because the adapter calls `/auth/refresh` on boot and the browser sends the
cookie automatically.

**Rotation with reuse detection.** Every refresh issues a new token and revokes
the presented one, both tagged with a shared `family_id`. Presenting an already
revoked token means it was captured and replayed, so the **entire family** is
revoked. The legitimate holder is signed out too — deliberately, because there
is no way to tell which of the two presenters is genuine. Verified end to end.

Only SHA-256 hashes are stored. A leaked database must not hand over usable
sessions.

### Password handling

argon2id at the library's OWASP-recommended parameters (m=19456 KiB, t=2, p=1),
chosen over bcrypt because it is memory-hard, which is what makes GPU cracking
expensive rather than merely slow.

The DTO reproduces `src/lib/auth-validation.ts` exactly — 8-72 characters,
upper, lower, digit, symbol. A backend that accepted a weaker password than the
form offers would quietly lower the policy for anyone calling the API directly.

Login deliberately does **not** apply that policy: an account created before a
policy change still has to be able to sign in.

### Not leaking account existence

An unknown address, a wrong password and a locked account all produce the same
401 with the same message. Three supporting details:

- `dummyVerify()` burns comparable time when no account matches, so latency does
  not distinguish a missing address from a wrong password.
- Lockout is never announced. Saying "locked" confirms the address exists and
  tells an attacker their guessing is working.
- `password/forgot` returns 202 whether or not the address is registered.

An unverified email is the one deliberate exception: it answers 403 distinctly,
which is safe because the password was correct, so the caller already knows the
account exists.

Two independent brute-force defences: `ThrottlerGuard` per IP (10 logins/min),
and a per-account counter that locks after `AUTH_LOCKOUT_THRESHOLD` failures.
Both are needed — the throttler stops one host hammering many accounts, the
counter stops many hosts hammering one.

### Registration reuses the existing trigger

`register` writes `auth.users` and lets `on_auth_user_created` fire
`handle_new_user()`, which creates the `profiles` and `user_roles` rows from
`raw_user_meta_data`. So signup behaviour — including the rule that nobody can
self-grant an `admin` role — keeps living where it already lived rather than
being restated in TypeScript. A unit test pins the metadata keys, because
renaming one would silently stop profiles being created.

Two independent guards on privilege escalation: the DTO's role enum omits
`admin`/`super_admin`, and `handle_new_user()` downgrades them anyway.

### RBAC

Permissions are **not** reimplemented. `findAuthorization()` calls the existing
`my_permissions()`, which already encodes role grants, per-user overrides,
denials beating grants, and `super_admin` implicitly holding everything. A
second copy in TypeScript would drift from it without anyone noticing.

That function reads `auth.uid()`, so the caller is established with
`SET LOCAL request.jwt.claims` — the same mechanism the compatibility layer
gives the 123 RLS policies, and the reason `PrismaService` uses the pg driver
adapter. Verified: a parent account resolves to `bookings.cancel`,
`bookings.create`, `bookings.view_own`, `payments.manage`, `ratings.create`,
`students.manage`, `tutors.search`.

Claims are embedded in the access token, so authorization costs no database
round trip. They are rebuilt on every refresh, so a grant or revocation takes
effect within one access-token lifetime.

### Audit logging

Eleven event types land in the existing `public.audit_logs`: `auth.login`,
`auth.login_failed`, `auth.login_blocked`, `auth.logout`, `auth.register`,
`auth.token_refreshed`, `auth.token_reuse_detected`,
`auth.password_reset_requested`, `auth.password_reset_completed`,
`auth.password_changed`, `auth.email_verified`.

Written directly rather than through `log_audit()`, which resolves the actor
from `auth.uid()` — exactly what is unavailable for the events most worth
recording. Every write is best-effort: refusing to sign a user in because an
audit insert failed would be a worse outcome than a missing row.

### The frontend switch

`VITE_AUTH_PROVIDER` selects `supabase` (default) or `nestjs`.
`src/lib/auth/` holds an interface shaped like `supabase.auth` and two
implementations. Twenty call sites changed one import each; **no screen
changed**.

The NestJS adapter maps API errors into the vocabulary the existing forms
already parse — "invalid login", "confirm", "already registered", "rate limit",
"network". Those mappings are pinned by tests, so tidying a message fails the
build rather than silently degrading to a generic error in front of a user.

Selecting `nestjs` without `VITE_API_BASE_URL` throws at startup rather than
falling back, because falling back silently would leave someone testing
Supabase while believing they were testing the new stack.

### Verified

Registration, the profile trigger, verification gating, single-use tokens,
login, `/auth/me`, rotation, reuse detection killing the family, failed-login
counting, the audit trail — all exercised against the live database. Then the
whole flow through the real UI with `VITE_AUTH_PROVIDER=nestjs`: signed in and
landed on the parent dashboard, with the role supplied by NestJS driving the
redirect. The test account was removed afterwards.

### Known gap

Under `nestjs`, `use-auth` sources roles and permissions from the session, but
`profile` is null — the `profiles` table has not migrated, so the account screen
renders empty fields. Phase 3 (users domain) closes this. It is why the default
remains `supabase`.

---

## 13. Domain modules

_Phase 3, 2026-09-23. See [`database-migration-map.md`](./database-migration-map.md)
for the table-by-table and function-by-function status._

### The pattern

Repositories **call** the existing `SECURITY DEFINER` functions rather than
reimplementing them, inside `PrismaService.withUser()`:

```ts
return this.prisma.withUser(callerId, async (tx) => {
  return tx.$queryRaw`select * from public.booking_quote(...)`;
});
```

`withUser` opens a transaction and sets `request.jwt.claims` with `SET LOCAL`,
so `auth.uid()` resolves and all 123 RLS policies apply. `SET LOCAL` is
transaction-scoped, so a claim cannot leak to the next query on a pooled
connection — which is what makes it safe under PgBouncer.

Three things follow:

1. **No business rule is restated in TypeScript.** The commission split, the
   overlap constraints, the two-sided booking confirmation and the verification
   gate all stay where they are and keep working.
2. **Multi-statement work is atomic for free.** Booking creation quotes and
   inserts in one transaction, so the price shown and the price stored are the
   same number even if a commission rule changes in between.
3. **Porting a function later is a change inside one repository method.** Its
   callers do not move, which keeps each domain independently revertible.

`asAnonymous()` is the counterpart for genuinely public reads — the catalogue
and tutor search, which `anon` could already call. Naming it makes using it a
visible decision rather than an omission.

### What the API layer adds

Validation (DTOs with allow-listed sort keys and capped page sizes), pagination,
audit records for every sensitive operation, rate limiting, role and permission
guards, and response mapping so a new column cannot silently start being
returned.

### Configurable rules, not constants

`PlatformSettingsService` reads the admin-managed rows that govern behaviour —
allowed lesson durations, minimum notice, booking horizon, payout threshold,
base currency. Nothing in `src/` hardcodes any of them; `BookingsService` and
`SettlementService` fail with the configured value quoted back in the message.

Financial arithmetic is not implemented here at all. `PricingService` delegates
to `booking_quote()`, which resolves the applicable `commission_rules` row
including the tiered model and its 30-day window. Amounts stay **strings** end
to end: they are `NUMERIC`, and rounding money through a JavaScript float is how
settlement reports stop reconciling.

### Notification copy comes from templates

No service composes a message. `NotificationDispatchService` takes a trigger key
and a variables bag; subject and body come from `notification_templates`. In-app
delivery goes through `notify_user()`, preserving the existing path. Email is
new — the `notification_channel` enum has always allowed it but `notify_user()`
only ever wrote in-app rows — and goes through `EmailService`, so this module
never touches SMTP. No active email template means nothing is sent, which is an
admin decision rather than a service assumption.

### Auditing

`AuditService` writes to the existing `audit_logs` with a typed action union, so
a typo is a compile error rather than an event nobody can search for. Every
write is best-effort: refusing a booking because its audit row failed is the
worse outcome. A `redact()` pass strips anything resembling a credential before
persistence — audit rows are long-lived and widely readable, so a secret there
is worse than in a log line that rotates.

### One bug worth recording

`count(*)` is `bigint`, and `JSON.stringify` refuses BigInt outright. The
failure happens _after_ the handler succeeds, so a working query returned a 500
with the real cause buried in the logs. `installBigIntSerializer()` emits counts
as numbers and falls back to a string beyond the safe integer range. Money is
unaffected — `NUMERIC` arrives as a string and stays one.

---

## 14. What comes next

Six modules are complete, five partial, nine still boundaries — the map has the
detail. The highest-value remaining work, in order:

1. **Tutors, Students, Parents.** Completes the portal data paths and lets
   `use-auth` drop its Supabase reads entirely.
2. **Tutor Verification.** The gate itself is enforced in the database, but the
   submit/approve/reject workflow still runs through Supabase.
3. **Messaging, Assignments, Lesson Notes, Materials.** Straightforward against
   the existing functions.
4. **Admin operations and the audit read API.** Invitations and maker-checker
   are the sensitive part and should come last, after the domains they govern.

Supabase stays the default auth provider and still serves all data. The
coupling ratchet in `test/contract/supabase-coupling.test.ts` remains at 45 RPCs
and 35 tables: the frontend has not been repointed, by design.
