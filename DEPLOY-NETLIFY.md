# Publish GradOps on Netlify (new repo)

Get GradOps into its own GitHub repo and deploy it on Netlify.

---

## 1. Create a new GitHub repo

1. On **GitHub**, click **New repository**.
2. Name it (e.g. **gradops**).
3. Leave it **empty** (no README, no .gitignore).
4. Copy the repo URL (e.g. `https://github.com/YOUR_USERNAME/gradops.git`).

---

## 2. Push GradOps to the new repo

From your machine, use **one** of these.

### Option A — GradOps as its own repo (recommended)

From the **gradops** folder (the one that has `package.json`, `src/`, `prisma/`):

```bash
cd /path/to/version19/gradops

git init
git add .
git commit -m "Initial commit: GradOps"
git remote add origin https://github.com/YOUR_USERNAME/gradops.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME/gradops` with your actual repo URL.

### Option B — Copy into a fresh clone

If you prefer not to init git inside `gradops` (e.g. you want to keep it as part of version19):

```bash
# Clone your new empty repo
git clone https://github.com/YOUR_USERNAME/gradops.git gradops-publish
cd gradops-publish

# Copy GradOps contents (excluding .git)
rsync -av --exclude='.git' ../version19/gradops/ .

# Or on Windows / without rsync: copy all files from version19/gradops into gradops-publish

git add .
git commit -m "Initial commit: GradOps"
git push -u origin main
```

---

## 3. Connect to Netlify

1. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site** → **Import an existing project**.
2. Choose **GitHub** and authorize if needed.
3. Select the **gradops** repo you just pushed.
4. **Build settings** (Netlify often auto-fills these for Next.js):
   - **Base directory:** *(leave empty)*
   - **Build command:** `npx prisma generate && npm run build`
   - **Publish directory:** *(leave empty — Next.js plugin sets it)*
5. Click **Deploy** (the first deploy may fail until you set env vars; that’s OK).

---

## 4. Get a free hosted database (Neon)

1. Go to **[neon.tech](https://neon.tech)** and sign up (free, GitHub login works).
2. Click **New Project** → name it e.g. `gradops` → **Create project**.
3. On the project dashboard, open the **Connection details** (or **SQL Editor** → connection string). Copy the **connection string** (starts with `postgresql://...`). It may include `?sslmode=require` — that’s fine.
4. Keep this URL for the next step (Netlify env vars and local `db:setup`).

---

## 5. Set environment variables

Netlify needs a **hosted database** and auth/config. In Netlify: **Site settings** → **Environment variables** → **Add variable** / **Import from .env**.

Add at least:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | The **Neon** connection string you copied above. |
| `NEXTAUTH_URL` | Your site URL, e.g. `https://your-site-name.netlify.app` (update after first deploy if needed). |
| `NEXTAUTH_SECRET` | Random string (e.g. `openssl rand -base64 32`). |

Optional (for jobs and cron):

| Variable | Description |
|----------|-------------|
| `INGESTION_ADZUNA_ENABLED` | `true` |
| `ADZUNA_APP_ID` | Your Adzuna app ID |
| `ADZUNA_APP_KEY` | Your Adzuna app key |
| `CRON_SECRET` | Secret for calling `/api/cron/ingest` (e.g. for cron-job.org). |

Then: **Trigger deploy** → **Deploy site** (or push a commit) so the build runs again with env vars.

---

## 6. Database: migrations and seed

Netlify does not run migrations or seed for you. After the first deploy:

1. **Apply schema and seed** to your Neon DB (from your **local** machine, one time):

   ```bash
   cd /Users/yashdorshetwar/Desktop/version19/gradops
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require" npm run db:setup
   ```

   Replace the `DATABASE_URL` value with your **Neon** connection string from the Neon dashboard.

2. **Optional:** Run ingestion once to fill jobs:

   ```bash
   npm run ingest
   ```

   Or call your deployed cron endpoint (see GET-MORE-JOBS.md) with `CRON_SECRET` to run ingestion in production.

---

## 7. (Optional) Automate job ingestion

To refresh jobs on a schedule, use a free cron service (e.g. [cron-job.org](https://cron-job.org)) to call:

- **URL:** `https://your-site-name.netlify.app/api/cron/ingest`
- **Header:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** e.g. every 6 hours

See **GET-MORE-JOBS.md** §5 for details.

---

## Summary

1. Create new GitHub repo → push GradOps into it (Option A or B).
2. Netlify → Import repo → build command: `npx prisma generate && npm run build`.
3. Create free **Neon** project at [neon.tech](https://neon.tech) and copy the connection string.
4. Set env vars in Netlify: `DATABASE_URL` (Neon URL), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
5. Run `npm run db:setup` once with `DATABASE_URL` set to the Neon URL (so the hosted DB has tables + seed data).
6. Redeploy; then optionally set up cron for `/api/cron/ingest`.
