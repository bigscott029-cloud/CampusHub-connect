-- Create admin_users table for panel access
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
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

-- Insert the admin user with hashed password (using pgcrypto)
-- Password: Olanrewaju$21
-- Using crypt() to create a bcrypt-style hash
INSERT INTO public.admin_users (username, password_hash, display_name, email, is_active)
VALUES (
    'Big Scott',
    crypt('Olanrewaju$21', gen_salt('bf', 10)),
    'Big Scott',
    'admin@campushub.local',
    true
);

-- Create a helper function to verify admin credentials
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    SELECT id, password_hash
    INTO admin_record
    FROM public.admin_users
    WHERE username = p_username
      AND is_active = true
    LIMIT 1;

    IF admin_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
    END IF;

    IF crypt(p_password, admin_record.password_hash) = admin_record.password_hash THEN
        UPDATE public.admin_users
        SET last_login = now()
        WHERE id = admin_record.id;

        RETURN jsonb_build_object(
            'success', true,
            'admin_id', admin_record.id,
            'username', p_username,
            'message', 'Admin login successful'
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
END;
$$;

-- Grant execute permission to authenticated users only for verification
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO authenticated;
