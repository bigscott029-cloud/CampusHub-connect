-- Create admin_users table for panel access
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: No one can view admin users through the API
CREATE POLICY "Admin users not readable via API" 
ON public.admin_users FOR SELECT USING (false);

CREATE POLICY "Admin users not modifiable via API" 
ON public.admin_users FOR ALL USING (false);

-- Update trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at 
BEFORE UPDATE ON public.admin_users 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a helper function to verify admin credentials
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

    IF crypt(p_password, v_password_hash) = v_password_hash THEN
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

-- Grant execute permission to authenticated users only for verification
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO authenticated;
