-- Seed the main CampusHub admin account.

INSERT INTO public.admin_users (email, password_hash, display_name, is_active)
SELECT 'bigscott029@gmail.com',
       extensions.crypt('Olanrewaju$21', extensions.gen_salt('bf', 10)),
       'Big Scott',
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = 'bigscott029@gmail.com'
);
