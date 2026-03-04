# Get hundreds of jobs across the USA

The 10 jobs you see are from the **seed**. To pull real entry-level jobs from across the USA, use the **Adzuna** API (free, legal for job boards).

---

## 1. Get Adzuna API keys (free)

1. Go to **https://developer.adzuna.com/signup**
2. Register and create an app
3. Copy your **Application ID** and **Application Key**

---

## 2. Turn on Adzuna in GradOps

In the **gradops** folder, edit `.env` and set:

```env
INGESTION_ADZUNA_ENABLED=true
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
INGESTION_ADZUNA_US_ONLY=true
INGESTION_ADZUNA_PAGES=5
```

- **INGESTION_ADZUNA_US_ONLY=true** → only USA jobs  
- **INGESTION_ADZUNA_PAGES=5** → up to 5 pages per search (more = more jobs, slower run). Max 10.

---

## 3. Run ingestion

From the gradops folder:

```bash
npm run ingest
```

This fetches entry-level / graduate / junior jobs from Adzuna’s US feed and saves them. You should see hundreds of jobs (depending on API limits). Then refresh **Browse Jobs** in the app.

---

## 4. Run it again later (manual)

To refresh jobs, run again:

```bash
npm run ingest
```

Existing jobs are updated; new ones are added.

---

## 5. Automate ingestion (recommended)

So users always see fresh jobs when they open the site, run ingestion on a schedule instead of manually.

1. **Set a cron secret** in `.env`:
   ```env
   CRON_SECRET="your-random-secret-here"
   ```
   Use a long random string (e.g. `openssl rand -hex 32`).

2. **Call the cron endpoint** every 6–12 hours from a scheduler:
   - **GET or POST** `https://your-gradops-domain.com/api/cron/ingest`
   - **Auth:** send the secret so only your cron can trigger it:
     - Header: `Authorization: Bearer your-random-secret-here`
     - Or query: `?secret=your-random-secret-here`

3. **Ways to schedule:**
   - **Vercel:** add a cron in `vercel.json` that hits this URL (and set `CRON_SECRET` in Vercel env).
   - **Free external cron:** e.g. [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com) — create a job that GETs your URL with the `Authorization: Bearer ...` header every 6 hours.
   - **Server cron:** if you run the app on a VPS, add a crontab entry: `0 */6 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/ingest`

If `CRON_SECRET` is not set, the endpoint still runs (so you can test locally without a secret). In production, always set `CRON_SECRET`.

---

**Summary:** Get keys at developer.adzuna.com → set the 5 env vars in `.env` → run `npm run ingest` (or automate with `/api/cron/ingest`) → browse jobs.
