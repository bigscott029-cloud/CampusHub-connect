-- Launch polish: ad tiers, message privacy controls, usernames, and storage support.

ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS tier_name TEXT NOT NULL DEFAULT 'starter' CHECK (tier_name IN ('starter', 'growth', 'premium', 'spotlight')),
  ADD COLUMN IF NOT EXISTS placement_slots TEXT[] NOT NULL DEFAULT ARRAY['popup'],
  ADD COLUMN IF NOT EXISTS target_user_types TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS view_once BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS saved_by UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS messages_expires_at_idx ON public.messages (expires_at);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

WITH generated AS (
  SELECT
    user_id,
    COALESCE(
      NULLIF(lower(regexp_replace(display_name, '[^a-zA-Z0-9_]+', '_', 'g')), ''),
      'user_' || left(user_id::text, 6)
    ) AS base_username,
    row_number() OVER (
      PARTITION BY COALESCE(
        NULLIF(lower(regexp_replace(display_name, '[^a-zA-Z0-9_]+', '_', 'g')), ''),
        'user_' || left(user_id::text, 6)
      )
      ORDER BY created_at, user_id
    ) AS duplicate_number
  FROM public.profiles
  WHERE username IS NULL
)
UPDATE public.profiles AS profile
SET username = CASE
  WHEN generated.duplicate_number = 1 THEN generated.base_username
  ELSE generated.base_username || '_' || left(profile.user_id::text, 6)
END
FROM generated
WHERE profile.user_id = generated.user_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'profiles_username_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX profiles_username_unique_idx
    ON public.profiles (lower(username))
    WHERE username IS NOT NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_university UUID;
  requested_username TEXT;
BEGIN
  IF NULLIF(NEW.raw_user_meta_data->>'university_id', '') IS NOT NULL THEN
    requested_university := (NEW.raw_user_meta_data->>'university_id')::UUID;
  END IF;

  requested_username := COALESCE(
    NULLIF(lower(regexp_replace(
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), split_part(NEW.email, '@', 1)),
      '[^a-zA-Z0-9_]+',
      '_',
      'g'
    )), ''),
    'user_' || left(NEW.id::text, 6)
  );

  INSERT INTO public.profiles (
    user_id,
    display_name,
    username,
    university_id,
    user_type,
    home_state,
    home_region
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    requested_username,
    requested_university,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'user_type', ''), 'student'),
    NULLIF(NEW.raw_user_meta_data->>'home_state', ''),
    NULLIF(NEW.raw_user_meta_data->>'home_region', '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    university_id = EXCLUDED.university_id,
    user_type = EXCLUDED.user_type,
    home_state = EXCLUDED.home_state,
    home_region = EXCLUDED.home_region;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own story media" ON storage.objects;
CREATE POLICY "Users can upload their own story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own story media" ON storage.objects;
CREATE POLICY "Users can update their own story media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own story media" ON storage.objects;
CREATE POLICY "Users can delete their own story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public can view CampusHub story media" ON storage.objects;
CREATE POLICY "Public can view CampusHub story media"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');
