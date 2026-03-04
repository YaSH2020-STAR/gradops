# Reset Postgres password (when you don’t remember it)

Use this when you don’t know your Postgres password. We temporarily turn off password checks, set a new password, then turn them back on.

---

## You’re on Homebrew Postgres (postgresql@14)

### 1. Open the config file

```bash
open -e /opt/homebrew/var/postgresql@14/pg_hba.conf
```

### 2. Make sure local connections use `trust`

In the file, find the lines that say:

```
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

If they already say **trust**, skip to step 4.  
If they say **md5** or **scram-sha-256**, change them to **trust**. Save and close.

### 3. Restart Postgres so it reloads the config

```bash
brew services restart postgresql@14
```

Wait a few seconds.

### 4. Connect (no password needed when trust is on)

**Important:** Another Postgres (e.g. Postgres.app) is probably using port **5432**. Homebrew often ends up on **5433**. Try:

```bash
psql -d postgres -p 5433
```

If that connects (no password or just Enter), you’re on Homebrew. If it fails, try:

```bash
psql -d postgres -p 5432
```

Once you know which port works without a password, use that port below and in GradOps `.env`.

If that works, you’ll see a prompt like `postgres=#`. Then run (replace **5433** with the port that worked):

```sql
ALTER USER yashdorshetwar WITH PASSWORD 'postgres';
CREATE DATABASE gradops;
\q
```

If you had to use `-U postgres` to connect, run instead:

```sql
ALTER USER postgres WITH PASSWORD 'postgres';
CREATE USER yashdorshetwar WITH PASSWORD 'postgres' CREATEDB;
CREATE DATABASE gradops;
\q
```

### 5. Turn password check back on (optional but recommended)

Open the config again:

```bash
open -e /opt/homebrew/var/postgresql@14/pg_hba.conf
```

Change the two `host` lines back from **trust** to **scram-sha-256** (or **md5**). Save, then:

```bash
brew services restart postgresql@14
```

### 6. Use the new password in GradOps

In the **gradops** folder, set `.env` to (use the **port that worked** in step 4, e.g. 5433):

- If you used **yashdorshetwar** and password **postgres** (e.g. port 5433):
  ```env
  DATABASE_URL="postgresql://yashdorshetwar:postgres@localhost:5433/gradops?schema=public"
  ```
- If you used **postgres** and password **postgres**:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gradops?schema=public"
  ```

Then:

```bash
cd ~/Desktop/version19/gradops
npm run db:setup
npm run dev
```

---

**If `psql -d postgres` still asks for a password after step 3:**  
Another Postgres might be using port 5432 (e.g. Postgres.app). Run:

```bash
lsof -i :5432
```

Quit the other app (e.g. Postgres.app) so only Homebrew Postgres is running, then run step 3 again.
