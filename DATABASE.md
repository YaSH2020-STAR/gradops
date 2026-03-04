# Database setup for GradOps

The app needs PostgreSQL. You’ll see **“Authentication failed... provided database credentials for postgres are not valid”** when the URL in `.env` doesn’t match how your Postgres is actually set up.

---

## Option 1: Use Docker (recommended)

This gives you a Postgres that matches the default `.env` exactly.

1. **Start Docker**  
   Open **Docker Desktop** and wait until it’s running (no “Cannot connect to the Docker daemon” errors).

2. **Start Postgres**
   ```bash
   cd ~/Desktop/version19/gradops
   docker compose up -d
   ```

3. **Use this in `.env`** (already in `.env.example`):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gradops?schema=public"
   ```

4. **Create schema and seed**
   ```bash
   npm run db:setup
   ```

If Docker isn’t installed: [Install Docker Desktop](https://www.docker.com/products/docker-desktop/).

---

## Option 2: Use Postgres already on your Mac

If Postgres is already running (e.g. Homebrew, Postgres.app) and **Docker is not** (or you don’t want to use it), Prisma is talking to that Postgres. It often uses different credentials than `postgres`/`postgres`.

### Step 1: Create the database (if needed)

In a terminal:

```bash
# If you use Postgres.app or a default install, the user is often your Mac username:
psql -d postgres -c "CREATE DATABASE gradops;"
# If that fails with "role does not exist", try:
psql -d postgres -U postgres -c "CREATE DATABASE gradops;"
```

(Use the user/password that already work for your Postgres.)

### Step 2: Set the correct URL in `.env`

**A. Postgres.app (Mac)**  
Often no password, user = your Mac username:

```env
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/gradops?schema=public"
```

Example if your Mac user is `yashdorshetwar`:

```env
DATABASE_URL="postgresql://yashdorshetwar@localhost:5432/gradops?schema=public"
```

**B. Homebrew Postgres**  
Sometimes the superuser is your Mac username and no password:

```env
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/gradops?schema=public"
```

Or if you set a password for user `postgres`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/gradops?schema=public"
```

**C. You know the real user and password**  
Use them:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/gradops?schema=public"
```

Replace `USERNAME`, `PASSWORD`, and if needed the port (e.g. `5433` instead of `5432`).

### Step 3: Run setup

```bash
npm run db:setup
npm run dev
```

---

## Check that it works

From the **gradops** folder:

```bash
npx prisma db push
```

If that succeeds, credentials and database are fine. Then:

```bash
npm run db:seed
npm run dev
```

Open http://localhost:3000/jobs — you should see jobs (or a clear “No jobs” message with no 500 errors).
