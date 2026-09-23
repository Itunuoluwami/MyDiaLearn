# DiaLearn backend architecture

**Status:** Foundation phase. The backend boots, serves `/health`, and defines
every boundary the migration will fill. It owns no feature yet, and Supabase
still serves the entire product.

**Companion document:** [`ARCHITECTURE_MIGRATION.md`](./ARCHITECTURE_MIGRATION.md)
— the audit this design answers. Read its executive finding first: DiaLearn's
business logic and authorization live in PostgreSQL, not TypeScript.

---

## What this phase does and does not do

| | |
|---|---|
| **Does** | Application skeleton, DI wiring, configuration contract, error handling, logging, security posture, integration ports, repository pattern, health checks, tests |
| **Does not** | Serve any product feature, replace any Supabase call, own any data, issue any token |

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
  integration *tokens*, never on a provider implementation.
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

| Order | Provider | Why here |
|---|---|---|
| 1 | `ThrottlerGuard` | Reject floods before any work is done |
| 2 | `JwtAuthGuard` | Establish who is calling |
| 3 | `RolesGuard` | Coarse role check against that identity |
| 4 | `PermissionsGuard` | Fine-grained permission check |
| — | `AllExceptionsFilter` | One error shape for every failure |
| — | `LoggingInterceptor` | Per-request timing, keyed by correlation id |

`JwtAuthGuard` is bound globally, so **the API denies by default**. A route
opts out with `@Public()`. Forgetting the decorator makes an endpoint
unreachable — a loud failure. The opposite arrangement, adding a guard per
route, fails silently by leaving an endpoint open.

One caveat, pinned by an e2e test: guards run per *matched handler*, so an
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

| Port | Token | Adapter today | Reflects |
|---|---|---|---|
| `EmailService` | `EMAIL_SERVICE` | `LogEmailProvider` / `SmtpEmailProvider` | No transactional email exists yet |
| `PaymentProvider` | `PAYMENT_PROVIDER` | `SimulatedPaymentProvider` | `pay_for_booking()` simulates an instant charge |
| `StorageProvider` | `STORAGE_PROVIDER` | `UnconfiguredStorageProvider` | Supabase Storage still owns files |
| `ClassroomProvider` | `CLASSROOM_PROVIDER` | `NoneClassroomProvider` | `meeting_url` has never been populated |

`IntegrationsModule` is the only file that names a concrete adapter. Selection
is by environment variable. Adding a provider means writing an adapter, adding
its name to the enum in `env.validation.ts`, and adding a case — nothing else.

Three principles the defaults follow:

**Adapters describe reality, not aspiration.** `SimulatedPaymentProvider` is not
a stub to delete; it is the faithful adapter for how DiaLearn works right now.
That lets the payment domain migrate to NestJS *without* simultaneously
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

| Control | Implementation |
|---|---|
| Authentication | `JwtAuthGuard`, global, deny-by-default |
| Authorization | `RolesGuard` + `PermissionsGuard`, mirroring `has_role()` / `has_permission()` |
| Headers | `helmet` — HSTS, `nosniff`, frame options, no `x-powered-by` |
| CORS | Explicit origin allow-list from `CORS_ORIGIN` |
| Validation | Global `ValidationPipe`, `whitelist` + `forbidNonWhitelisted` |
| Env validation | Joi at boot; the app refuses to start when it fails |
| Rate limiting | `ThrottlerGuard`, configurable, skipped on `/health` |

`forbidNonWhitelisted` matters more here than usual: the frontend currently
posts to Postgres functions with no client-side validation at all, so these DTOs
are the first place unexpected input is ever caught.

`super_admin` short-circuits both authorization guards, matching `is_admin()`.

> **Role checks are not tenancy.** Holding the `tutor` role says nothing about
> whether this tutor may read *that* booking. Row scoping belongs in the
> repository layer. Treating a role check as sufficient is exactly how removing
> RLS leaks data.

---

## 8. Health checks

| Endpoint | Behaviour |
|---|---|
| `GET /health` | Always 200 while the process answers. Reports `ok` or `degraded` with per-component detail |
| `GET /health/live` | Liveness. No dependencies consulted |
| `GET /health/ready` | Readiness. 503 when the database is down, so traffic is withheld |

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

**End-to-end** (`test/*.e2e-spec.ts`, Jest + supertest) — boots the *real*
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

| Command | Purpose |
|---|---|
| `dev` | Watch-mode server |
| `build` / `start:prod` | Compile to `dist/`, run it |
| `lint` / `format` | ESLint, Prettier |
| `test` / `test:watch` / `test:cov` | Unit tests |
| `test:e2e` | End-to-end |
| `db:generate` | Regenerate the Prisma client |
| `db:pull` | **Introspect** — the safe way to add models |
| `db:migrate` | `prisma migrate dev` — see the warning in §3 |
| `db:migrate:deploy` / `db:migrate:status` | Deployment-side migration |
| `db:seed` | Seed (currently guarded and empty — see below) |
| `db:studio` | Prisma Studio |

`prisma/seed.ts` seeds nothing. DiaLearn's reference data — subjects, curricula,
currencies, commission rules, notification templates — is admin-managed and
already exists. Rule 11 forbids hardcoding it, and inventing plausible rows
would create a second, divergent source of truth. The file exists for the guard:
it refuses to run when `APP_ENV` is `production` or `staging`.

---

## 11. Known state

**The database does not exist yet.** `DATABASE_URL` points at
`pg8001.site4now.net:6432`, and the server answers:

```
database "DB_AC20BA_dialearn" does not exist
```

The credentials authenticate; the database has not been created. Until it is,
`/health` correctly reports `degraded` / `db: down` and `/health/ready` returns
503. The API still boots, because outside production an unreachable database is
a warning rather than a fatal error — CI and local work need that. Inside
production it is fatal by design.

**Still open from the audit:** DECISION-1 (RLS strategy), DECISION-3 (port vs
retain the PL/pgSQL functions), DECISION-4 (hosting split), and business-rule
questions Q1–Q7. None block this phase; all block Phase 4.

---

## 12. What comes next

Per the audit's migration order, Phase 2 is identity:

1. Regenerate the Supabase types — still blocked on CLI access (BLOCKER-3).
2. Create the database on the external host.
3. `db:pull` to introspect the real schema.
4. `AuthModule`: login, refresh, logout, reset, `/auth/me`.
5. Frontend API client, swapping `use-auth.tsx` behind an **unchanged**
   `AuthContextValue` — that shape is what makes the cutover a one-file change
   instead of a 49-route change.
6. Dual-accept Supabase and NestJS tokens during the window.

Supabase stays live and revertible throughout (rule 7).
