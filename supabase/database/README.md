# Supabase Database Directory

This directory contains the database schema and seed structure for the CampusHub project.

## Purpose

- Keep database SQL definitions organized by concern.
- Provide a self-contained seed for the main admin account.
- Make it easier to review and extend the database schema over time.

## Structure

- `schema/` - database object definitions and schema layout
- `seeds/` - seed data files for initial database population
- `../seed.sql` - top-level seed file referenced by `supabase/config.toml`

## How to use

1. Ensure your Supabase CLI is installed and linked to the project.
2. Apply migrations or push the database schema:
   - `npx supabase db push`
   - or `npx supabase db reset` for a fresh local database with migrations and seed
3. Seed the admin user:
   - `npx supabase db seed`

## Required environment variables

Fill these values in your `.env` file if you have not already:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

For CLI/local database operations, use Supabase-managed secrets instead of browser-exposed variables:

- `SUPABASE_DB_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If you need me to add those placeholders here, I can set them up next.
