-- Seed default admin credentials for CampusHub admin access.
-- This file is referenced by supabase/config.toml and can be executed
-- with `npx supabase db reset` or `npx supabase db seed`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.admin_users (email, password_hash, display_name, is_active)
SELECT 'bigscott029@gmail.com',
       crypt('Olanrewaju$21', gen_salt('bf', 10)),
       'Big Scott',
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = 'bigscott029@gmail.com'
);
