# Campus Hub Database Restore Notes

## Current backup status

The file inspected at:

`/home/darkmirage/Downloads/db_cluster-30-11-2025@22-57-26.backup(1)`

is a plain SQL PostgreSQL cluster dump. It contains Supabase-managed roles and schemas such as `auth`, `storage`, and `realtime`, but it does **not** contain the app data schema:

- no `public.universities`
- no `public.profiles`
- no `public.posts`
- no `public.anonymous_posts`
- no `public.marketplace_listings`
- no `public.hostel_listings`
- no `public.roommate_requests`
- no `public.messages`

That means this file cannot restore the old Campus Hub production content by itself. It should not be imported directly into a hosted Supabase project because hosted Supabase manages the internal schemas for you.

## What this repo can restore

The current repo can recreate the app schema from:

- `supabase/migrations/*.sql`
- `supabase/database/schema/*.sql`
- `supabase/seed.sql`
- `supabase/database/seeds/*.sql`

The seed creates the local/admin account listed in `supabase/seed.sql`.

## Local setup

Supabase local development requires Docker access.

```bash
npx supabase start
npx supabase db reset
npx supabase status
```

If Docker returns a permission error on Linux, add your user to the Docker group and sign out/in:

```bash
sudo usermod -aG docker "$USER"
```

## New hosted Supabase project

1. Create a new Supabase project.
2. Copy the new project URL and publishable anon key into `.env`.
3. Link the project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

4. Push the app schema:

```bash
npx supabase db push
```

5. Seed admin data if needed:

```bash
npx supabase db seed
```

6. Generate fresh TypeScript types after the remote schema is live:

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

## If you can get a better backup

Ask Supabase/support for a project dump that includes `public` schema and data, or an app-only export. The useful export should include lines like:

```sql
CREATE TABLE public.posts
COPY public.posts
CREATE TABLE public.marketplace_listings
COPY public.marketplace_listings
```

Once you have that, import the app data after the schema exists:

```bash
psql "$DATABASE_URL" -f public-data.sql
```

Do not commit real backup files to the repo. They may contain user data and auth material.
