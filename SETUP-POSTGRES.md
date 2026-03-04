# Set a password so GradOps can connect to Postgres

Your Mac’s Postgres is asking for a password and “Enter” doesn’t work. Set a known password for your user, then use it in GradOps.

---

## Step 1: Find where Postgres stores its config

**Postgres.app:**  
Open Postgres.app → open the data directory (or in Terminal):

```bash
ls ~/Library/Application\ Support/Postgres/*/data/pg_hba.conf 2>/dev/null || ls /Users/yashdorshetwar/Library/Application\ Support/Postgres/*/data/pg_hba.conf 2>/dev/null
```

**Homebrew:**

```bash
ls /opt/homebrew/var/postgres*/pg_hba.conf 2>/dev/null || ls /usr/local/var/postgres*/pg_hba.conf 2>/dev/null
```

Note the folder that contains `pg_hba.conf` (e.g. `…/Postgres/var-16/data/` or `…/var/postgres@14`).

---

## Step 2: Allow local connections without a password (temporary)

1. Open `pg_hba.conf` in a text editor.
2. Find lines that look like:
   ```
   host    all    all    127.0.0.1/32    md5
   host    all    all    ::1/128         md5
   ```
3. **Temporarily** change `md5` to `trust` for those two lines (so they say `trust` instead of `md5`). Save the file.
4. **Restart Postgres**  
   - Postgres.app: Stop the server in the app, then Start again.  
   - Homebrew: `brew services restart postgresql` (or `postgresql@14`, etc.)

---

## Step 3: Set your user’s password

In Terminal, connect (use your Mac username if it asks for a user):

```bash
psql -d postgres -U yashdorshetwar -c "ALTER USER yashdorshetwar WITH PASSWORD 'postgres';"
```

If your Postgres user is actually `postgres`:

```bash
psql -d postgres -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

Create the database:

```bash
createdb gradops
# or
psql -d postgres -c "CREATE DATABASE gradops;"
```

---

## Step 4: Turn password check back on

1. Open `pg_hba.conf` again.
2. Change those two lines back from `trust` to `md5`.
3. Save and restart Postgres again (same as in Step 2).

---

## Step 5: Point GradOps at your database

In the **gradops** folder, edit `.env`:

- If your Postgres user is **yashdorshetwar** and you set password to **postgres**:
  ```env
  DATABASE_URL="postgresql://yashdorshetwar:postgres@localhost:5432/gradops?schema=public"
  ```
- If your Postgres user is **postgres** and you set password to **postgres**:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gradops?schema=public"
  ```

Then run:

```bash
cd ~/Desktop/version19/gradops
npm run db:setup
npm run dev
```

---

**Summary:** Use `pg_hba.conf` → set `trust` → restart Postgres → run `ALTER USER ... PASSWORD 'postgres'` and `createdb gradops` → set `md5` again → restart Postgres → set `DATABASE_URL` in `.env` and run `npm run db:setup`.
