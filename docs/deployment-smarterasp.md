# Deploying to SmarterASP

DiaLearn runs as two SmarterASP sites, both Node.js under IIS/iisnode:

| Site     | Example domain       | Branch       | What it is                               |
| -------- | -------------------- | ------------ | ---------------------------------------- |
| Frontend | `mydialearn.com`     | `deploy-web` | TanStack Start server (nitro `iis_node`) |
| API      | `api.mydialearn.com` | `deploy-api` | NestJS, with production `node_modules`   |

The database is the existing site4now PostgreSQL. Uploaded files are stored on
the API site's own disk, under `App_Data/uploads`.

## Why deploy branches

SmarterASP's GitHub deployment clones a branch into the site folder and runs
nothing: it has no `npm install` and no build step. `.github/workflows/deploy.yml`
does the build instead. On every push to `main`, or when run by hand from the
Actions tab, it:

1. Builds the frontend with `NITRO_PRESET=iis_node` and commits `.output/` to
   `deploy-web`.
2. Builds the API **on Windows**, because `@node-rs/argon2` is a native module
   and its binary must match the server's OS. It installs production
   dependencies, trims the Prisma CLI that bun pulls in regardless
   (`backend/deploy/prune-site.sh`), and commits the result, with
   `web.config` and `index.js`, to `deploy-api`.

Each deploy adds a commit rather than rewriting the branch, so the server can
always fast-forward. Nothing on these branches contains a secret. `.env`,
`App_Data/` and `iisnode/` are gitignored on them, so a pull on the server never
touches those files.

## One-time setup

### 1. GitHub repository settings

Under **Settings → Secrets and variables → Actions**:

- **Variables** (public values, inlined into the browser bundle):
  - `VITE_API_BASE_URL`: `https://api.mydialearn.com`

No **Secrets** are needed. Nothing the frontend build reads is secret, and the
API's secrets live only in the `.env` you create on the server.

Under **Settings → Actions → General → Workflow permissions**, allow **Read and
write** so the workflow can push the deploy branches.

Then run the workflow once (**Actions → Deploy (SmarterASP) → Run workflow**).
The two branches appear when it finishes.

### 2. SmarterASP sites

For each site:

1. Set the Node.js version to **20.19 or later**; **22** is preferred. Prisma 7
   and NestJS 11 will not start on older versions.
2. Under **GitHub deployment**, link the repository and select the branch:
   `deploy-web` for the frontend, `deploy-api` for the API.
3. Bind the domain and enable the free SSL certificate. Cookies are marked
   `Secure` in staging and production, so sign-in needs HTTPS.

### 3. The API's `.env` (on the server only)

Use the File Manager to create `.env` in the API site's root, next to
`web.config`. Start from `backend/.env.example`. The values that differ from
local work:

```
APP_ENV=staging            # "production" refuses PAYMENT_PROVIDER=simulated
# no PORT line — iisnode provides one
CORS_ORIGIN=https://mydialearn.com
APP_URL=https://mydialearn.com
COOKIE_DOMAIN=.mydialearn.com
DATABASE_URL=...           # as today
JWT_SECRET=...             # new, 48+ random characters; not the dev one
JWT_REFRESH_SECRET=...     # new, different again
EMAIL_PROVIDER=smtp
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=App_Data/uploads
LOG_LEVEL=info
```

Two layers keep `.env` from being served. `web.config` routes every request to
Node, and it also hides `.env`, `dist`, `node_modules` and `iisnode`. Editing
`.env` restarts the app, because it is in iisnode's `watchedFiles`.

Stay on `APP_ENV=staging` while payments are simulated: the API refuses to start
in `production` with the simulated gateway. `staging` behaves like production in
every other respect: JSON logs, secure cookies, and no development error detail.

### 4. Check it

- `https://api.mydialearn.com/health` should return `"database":{"status":"up"}`
  and `"storage":{"adapter":"local","status":"up"}`.
- `https://mydialearn.com` should render, and signing in should reach the portal.

## Day to day

Merge to `main`, and the workflow publishes. Then press **Pull/Deploy** in each
site's GitHub panel. If SmarterASP offers auto-deploy on push, enable it on the
deploy branches. To publish a feature branch without merging, run the workflow
by hand and pick that branch.

Database changes are not part of the deploy. They are still applied with
`bun run db:schema:extras` from a machine with `DATABASE_URL`, as before.

## Things specific to shared IIS hosting

- **The app pool recycles** (daily, and after idle time). The first request
  after a recycle is slow while Node starts. Nothing is lost: sessions are
  JWT and refresh tokens live in the database.
- **Client IP.** iisnode proxies over a named pipe. `web.config` turns on
  `enableXFF`, and the API trusts exactly one hop, so rate limiting sees the
  real client and not a spoofed header.
- **Uploads are capped twice**: at 25 MB by IIS (`requestLimits`) and at
  `STORAGE_MAX_UPLOAD_MB` (10 by default, matching the upload screens) by the
  API.
- **Back up `App_Data/uploads`.** It is the only copy of uploaded files, and
  it is not in git. Include it in the site backups the control panel offers.

## File storage

`STORAGE_PROVIDER=local` stores files at `App_Data/uploads/<bucket>/<key>`. The
keys keep the Supabase layout, so the `*.storage_path` columns mean the same
thing under either backend:

| Bucket               | Key                            | Who may read it (mirrors the storage policy)     |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| `tutor-documents`    | `<tutorId>/<uuid>.<ext>`       | the tutor, or an admin                           |
| `learning-resources` | `<tutorId>/<uuid>.<ext>`       | the tutor; families it is shared with; an admin  |
| `learning-resources` | `submissions/<userId>/<uuid>…` | the family who submitted; the assignment's tutor |

Flow:

1. `POST /api/files/<tutor-documents|learning-resources|submissions>` with
   multipart `file`. The server chooses the key.
2. The existing endpoint creates the record, and re-checks that the key is in
   the caller's own folder.
3. `GET /api/files/<kind>/<id>/url` checks access against the owning row and
   returns a two-minute HMAC-signed link, `/api/files/signed/<token>`.
4. That link streams the file. PDFs and images open in the browser; anything
   else, HTML and SVG included, downloads as a file and never renders on the
   API's origin.

To move to cloud storage later, write another `StorageProvider` adapter. No
caller changes.

## Restricted database user

The API connects as `ac20ba_dialearn`, which owns every table. PostgreSQL does
not apply row-level security to a table's owner. RLS is enabled on all 43
tables but not forced, so today the 127 policies are dormant. Tenancy relies
on the policy checks the API repeats in its own SQL (for example the
`*_VISIBLE` predicates in `teaching.repository.ts`). That works, but one forgotten `where` leaks data.

The fix is a second login that owns nothing:

1. **Control panel → Databases → Additional Database Users → + Quota**. Buy
   one PostgreSQL user, then create it, for example `ac20ba_dialearn_app`,
   with access to `db_ac20ba_dialearn`.
2. From `backend/`, first run the dry run to see the grants:

   ```
   node scripts/grant-app-role.mjs ac20ba_dialearn_app
   ```

3. Then apply them. The script refuses a login that could bypass RLS:

   ```
   node scripts/grant-app-role.mjs ac20ba_dialearn_app --apply
   ```

4. Add `DATABASE_APP_URL=postgresql://ac20ba_dialearn_app:...@pg8001.site4now.net:6432/db_ac20ba_dialearn`
   to the API's `.env`. On start the log says "Restricted database login
   verified; row-level security applies".

From then on, all per-user work (`withUser`, `asAnonymous`) runs under the
policies. `DATABASE_URL` is still used for system work that has no user.
Removing the line switches back instantly. **Try it in the staging site and
click through each portal before relying on it**: any path that only worked
because it bypassed RLS will now fail loudly instead of leaking quietly.
