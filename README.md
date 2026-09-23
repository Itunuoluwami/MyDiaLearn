# DiaLearn

A tutoring marketplace and lightweight LMS: tutor discovery → booking → payment
→ live class → lesson completion → rating → settlement, across parent, student,
tutor, admin and agency roles.

## Stack

| Layer           | Current                                                      |
| --------------- | ------------------------------------------------------------ |
| Frontend        | TanStack Start, React 19, TypeScript, Tailwind v4, shadcn/ui |
| Data            | Supabase — PostgreSQL, GoTrue auth, storage                  |
| Build           | Vite 8 → nitro → Cloudflare Workers                          |
| Package manager | bun                                                          |

The backend is being migrated to NestJS over an externally hosted PostgreSQL 18.
See [`docs/ARCHITECTURE_MIGRATION.md`](docs/ARCHITECTURE_MIGRATION.md).

## Getting started

Requires [bun](https://bun.sh) and Node 20+.

```sh
bun install
cp .env.example .env    # then fill in the Supabase values
bun run dev             # http://localhost:8080
```

## Scripts

| Command                     | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `bun run dev`               | Dev server on port 8080                               |
| `bun run build`             | Production build                                      |
| `bun run lint`              | ESLint (Prettier runs as a lint rule)                 |
| `bun run format`            | Rewrite formatting                                    |
| `bun run test`              | Vitest                                                |
| `bun run test:watch`        | Vitest in watch mode                                  |
| `bun run typecheck`         | Plain `tsc --noEmit`                                  |
| `bun run typecheck:ratchet` | `tsc` against the known-error baseline — what CI runs |

## Repository layout

```
src/routes/          65 file-based routes (public, student, tutor, admin)
src/components/      74 components; ui/ is shadcn, treat as the design system
src/lib/             business logic — the de-facto service layer
src/integrations/    Supabase clients, auth middleware, generated types
supabase/migrations/ 35 migrations: 41 tables, 70 functions, 130 RLS policies
test/                unit tests plus the Supabase coupling ratchet
docs/                architecture audit and the admin governance runbook
```

## A note on where the logic lives

Most of DiaLearn's business rules and **all** of its authorization are in
PostgreSQL, not TypeScript — 70 `SECURITY DEFINER` functions and 130 RLS
policies. The frontend is a thin client over them. Read the audit before
assuming a behaviour is implemented in React.

## Contributing

`AGENTS.md` has the working rules: what not to edit, what to run before
committing, and the migration constraints.
