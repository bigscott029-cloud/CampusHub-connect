-- Keep admin credential verification compatible with Supabase-hosted pgcrypto.
-- Supabase installs pgcrypto functions in the extensions schema, while the
-- security-definer function pins its search_path to public.

CREATE OR REPLACE FUNCTION public.verify_admin_credentials(p_email TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_password_hash TEXT;
BEGIN
  SELECT id, password_hash
  INTO v_admin_id, v_password_hash
  FROM public.admin_users
  WHERE email = p_email
    AND is_active = true
  LIMIT 1;

  IF v_admin_id IS NULL OR v_password_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  IF extensions.crypt(p_password, v_password_hash) = v_password_hash THEN
    UPDATE public.admin_users
    SET last_login = now()
    WHERE id = v_admin_id;

    RETURN jsonb_build_object(
      'success', true,
      'admin_id', v_admin_id,
      'email', p_email,
      'message', 'Admin login successful'
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO anon, authenticated;
