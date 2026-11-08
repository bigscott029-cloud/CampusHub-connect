-- Resolve login identifier (username or email) to user's auth email
CREATE OR REPLACE FUNCTION public.resolve_login_email(identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  clean_input TEXT := lower(trim(identifier));
  resolved_email TEXT;
BEGIN
  IF clean_input IS NULL OR clean_input = '' THEN
    RETURN NULL;
  END IF;

  -- If it already contains '@' and looks like an email address, return as-is
  IF clean_input LIKE '%@%.%' THEN
    RETURN clean_input;
  END IF;

  -- Remove leading '@' if user typed "@bigscott"
  clean_input := ltrim(clean_input, '@');

  -- Look up in auth.users joined with public.profiles on lower(username)
  SELECT u.email INTO resolved_email
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(COALESCE(p.username, '')) = clean_input
  LIMIT 1;

  -- Return resolved email or fall back to original input
  RETURN COALESCE(resolved_email, clean_input);
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated, service_role;
