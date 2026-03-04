# GradOps

**Early-career job search for recent graduates (0–2 years).**

GradOps is a job board that only lists roles suitable for recent graduates and early-career candidates. Employers must post jobs with 0–2 years experience; ingested jobs are scored for "recent grad fit" and low-fit listings are hidden.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth (Email/Password + Google OAuth)
- **Design:** Dark fintech style (primary #FF8975, dark #0E0E0E), Inter Tight font

## Setup

### 1. Install dependencies

```bash
cd gradops
npm install
```

### 2. Start PostgreSQL

**Using Docker:** Start Docker Desktop, then:

```bash
docker compose up -d
```

**If you get “Authentication failed... database credentials for postgres are not valid”:** Your `.env` credentials don’t match the Postgres you’re connecting to (e.g. you’re not using Docker and your local Postgres uses a different user/password). See **[DATABASE.md](./DATABASE.md)** for fixing credentials and alternative setups.

### 3. Environment

Copy the example env and set at least `DATABASE_URL` and `NEXTAUTH_SECRET`:

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gradops?schema=public"`
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google sign-in
- Optional: `AI_API_KEY` / `AI_BASE_URL` for AI scoring (OpenAI-compatible)

### 4. Database

```bash
npm run db:push
npm run db:seed
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed accounts

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Job Seeker | seeker@example.com  | seeker123  |
| Employer | employer@example.com | employer123 |
| Admin    | admin@example.com  | admin123   |

## Env vars (reference)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. http://localhost:3000) |
| `NEXTAUTH_SECRET` | Secret for JWT/session |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `AI_API_KEY` / `AI_BASE_URL` | OpenAI-compatible API for recent-grad fit scoring (optional) |
| `INGESTION_ADZUNA_ENABLED` | Set `true` to fetch jobs from Adzuna (legal, free API) |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Get free keys at [developer.adzuna.com](https://developer.adzuna.com/signup) |
| `INGESTION_CRON_ENABLED` | Enable Greenhouse connector if used |
| `INGESTION_LEVER_ENABLED` / `INGESTION_GREENHOUSE_ENABLED` | Per-connector (operator must confirm ToS) |

## Getting real jobs (legal sources)

**Out of the box:** Seed data gives you ~10 sample jobs so search works immediately. Re-seed anytime: `npm run db:seed` (adds more; you may want to reset DB first).

**Adzuna (recommended, legal):** Adzuna’s API is meant for “display on your own website.” Free tier is fine. **→ Step-by-step: [GET-MORE-JOBS.md](./GET-MORE-JOBS.md)** (jobs all over USA.)

1. Register at [developer.adzuna.com](https://developer.adzuna.com/signup) and get your **App ID** and **App Key**.
2. In `.env` set `INGESTION_ADZUNA_ENABLED=true`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`. For USA only add `INGESTION_ADZUNA_US_ONLY=true` and `INGESTION_ADZUNA_PAGES=5`.
3. Run **`npm run ingest`** — fetches hundreds of entry-level/graduate/junior jobs (US and optionally UK), saves them, and (if `AI_API_KEY` is set) scores them for recent-grad fit.
4. Optional: run on a schedule (e.g. cron every 6h): `0 */6 * * * cd /path/to/gradops && npm run ingest`

**AI scoring:** If you set `AI_API_KEY` (OpenAI or compatible), the ingestion script will score each job 0–100 for new-grad fit and store reasons. Low scores are filtered out on the browse page.

## Ingestion & compliance

- **No scraping of prohibited sites.** We only use APIs that allow programmatic use (Adzuna: “display on your own website”; Greenhouse/Lever: only if you have permission).
- Connectors are **off by default**. Turn on Adzuna or others in `.env` after reading their terms.
- Every job shows **source attribution** and a **canonical apply URL**.
- **Takedown:** “Request removal” on a job; admins resolve in the admin dashboard.

## Features

- **Public:** Landing, browse jobs (filters, search), job detail with recent-grad fit badge and source attribution, report/removal request.
- **Job seeker:** Profile (grad date, degree, skills, optional resume), saved jobs, saved searches, job alerts, application tracker, wellbeing/break reminders.
- **Employer:** Company profile, post jobs (0–2 yrs only), draft/publish, candidate interest, wellbeing/break reminders.
- **Admin:** Takedown requests, job removal, (optional) connector toggles.

## Tests

```bash
npm run test
```

## API docs

- `GET /api/jobs` — List jobs (query: q, country, remote, jobType, datePosted, sort, page, limit).
- `GET /api/jobs/[id]` — Job detail.
- `POST /api/auth/signup` — Register (body: email, password, role).
- `POST /api/jobs/save` — Save job (body: jobId); `DELETE /api/jobs/save?jobId=...` — Unsave.
- `POST /api/takedown` — Request removal (body: jobId, requesterEmail, reason).
- `PUT /api/wellbeing/break-reminder` — Update break reminder settings (auth required).

Employer and seeker profile/CRUD routes are under `/api/employer/*` and `/api/seeker/*`.
