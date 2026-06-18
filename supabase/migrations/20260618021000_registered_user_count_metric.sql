-- Public metric helper for launch progress counters.
-- Counts confirmed Supabase Auth users without exposing private auth rows.

CREATE OR REPLACE FUNCTION public.get_registered_user_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE(COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL), 0)::INTEGER
  FROM auth.users;
$$;

REVOKE ALL ON FUNCTION public.get_registered_user_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_registered_user_count() TO anon, authenticated;
