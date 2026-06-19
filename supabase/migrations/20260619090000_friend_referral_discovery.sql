-- Friend discovery, referral tracking, and contact-ready profile fields.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_unique_idx
ON public.profiles (upper(referral_code))
WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON public.profiles (phone_number);
CREATE INDEX IF NOT EXISTS profiles_username_lookup_idx ON public.profiles (lower(username));

UPDATE public.profiles
SET referral_code = upper(substr(regexp_replace(COALESCE(username, display_name, 'campushub'), '[^a-zA-Z0-9]+', '', 'g'), 1, 8) || substr(user_id::text, 1, 4))
WHERE referral_code IS NULL;

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('invited', 'registered', 'verified', 'rewarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their referral links" ON public.referrals;
CREATE POLICY "Users can view their referral links"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can create their referral link" ON public.referrals;
CREATE POLICY "Users can create their referral link"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referred_user_id);

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CHECK (requester_id <> addressee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_unique_idx
ON public.friendships (
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS friendships_requester_idx ON public.friendships (requester_id);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON public.friendships (addressee_id);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can respond to friend requests" ON public.friendships;
CREATE POLICY "Users can respond to friend requests"
ON public.friendships FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.refresh_referral_count(target_user UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH counted AS (
    SELECT COUNT(*)::INTEGER AS total
    FROM public.referrals
    WHERE referrer_id = target_user
      AND status IN ('registered', 'verified', 'rewarded')
  )
  UPDATE public.profiles
  SET referral_count = counted.total
  FROM counted
  WHERE profiles.user_id = target_user
  RETURNING counted.total;
$$;

CREATE OR REPLACE FUNCTION public.register_referral_for_user(ref_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer UUID;
BEGIN
  IF auth.uid() IS NULL OR NULLIF(trim(ref_code), '') IS NULL THEN
    RETURN;
  END IF;

  SELECT user_id INTO referrer
  FROM public.profiles
  WHERE upper(referral_code) = upper(trim(ref_code))
  LIMIT 1;

  IF referrer IS NULL OR referrer = auth.uid() THEN
    RETURN;
  END IF;

  UPDATE public.profiles
  SET referred_by = referrer,
      referred_by_code = upper(trim(ref_code))
  WHERE user_id = auth.uid()
    AND referred_by IS NULL;

  INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
  VALUES (referrer, auth.uid(), upper(trim(ref_code)), 'registered')
  ON CONFLICT (referred_user_id) DO NOTHING;

  PERFORM public.refresh_referral_count(referrer);
END;
$$;

CREATE OR REPLACE FUNCTION public.search_people(search_term TEXT)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  university_id UUID,
  home_region TEXT,
  friendship_status TEXT,
  friendship_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.university_id,
    p.home_region,
    f.status AS friendship_status,
    f.id AS friendship_id
  FROM public.profiles p
  LEFT JOIN public.friendships f
    ON (
      (f.requester_id = auth.uid() AND f.addressee_id = p.user_id)
      OR
      (f.addressee_id = auth.uid() AND f.requester_id = p.user_id)
    )
  WHERE auth.uid() IS NOT NULL
    AND p.user_id <> auth.uid()
    AND (
      NULLIF(trim(search_term), '') IS NULL
      OR lower(COALESCE(p.username, '')) LIKE lower(trim(search_term)) || '%'
      OR lower(p.display_name) LIKE '%' || lower(trim(search_term)) || '%'
      OR regexp_replace(COALESCE(p.phone_number, ''), '[^0-9]+', '', 'g') LIKE '%' || regexp_replace(search_term, '[^0-9]+', '', 'g') || '%'
    )
  ORDER BY
    CASE
      WHEN lower(COALESCE(p.username, '')) = lower(trim(search_term)) THEN 0
      WHEN lower(COALESCE(p.username, '')) LIKE lower(trim(search_term)) || '%' THEN 1
      WHEN lower(p.display_name) LIKE lower(trim(search_term)) || '%' THEN 2
      ELSE 3
    END,
    p.display_name
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  username TEXT,
  referral_code TEXT,
  referral_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    p.username,
    p.referral_code,
    COALESCE(p.referral_count, 0) AS referral_count
  FROM public.profiles p
  ORDER BY COALESCE(p.referral_count, 0) DESC, p.created_at ASC
  LIMIT LEAST(GREATEST(limit_count, 1), 100);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_university UUID;
  requested_username TEXT;
  generated_referral_code TEXT;
  referrer UUID;
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

  generated_referral_code := upper(substr(regexp_replace(requested_username, '[^a-zA-Z0-9]+', '', 'g'), 1, 8) || substr(NEW.id::text, 1, 4));

  INSERT INTO public.profiles (
    user_id,
    display_name,
    username,
    phone_number,
    referral_code,
    university_id,
    user_type,
    home_state,
    home_region
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    requested_username,
    NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
    generated_referral_code,
    requested_university,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'user_type', ''), 'student'),
    NULLIF(NEW.raw_user_meta_data->>'home_state', ''),
    NULLIF(NEW.raw_user_meta_data->>'home_region', '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    referral_code = COALESCE(public.profiles.referral_code, EXCLUDED.referral_code),
    university_id = EXCLUDED.university_id,
    user_type = EXCLUDED.user_type,
    home_state = EXCLUDED.home_state,
    home_region = EXCLUDED.home_region;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  IF NULLIF(NEW.raw_user_meta_data->>'referral_code', '') IS NOT NULL THEN
    SELECT user_id INTO referrer
    FROM public.profiles
    WHERE upper(referral_code) = upper(trim(NEW.raw_user_meta_data->>'referral_code'))
    LIMIT 1;

    IF referrer IS NOT NULL AND referrer <> NEW.id THEN
      UPDATE public.profiles
      SET referred_by = referrer,
          referred_by_code = upper(trim(NEW.raw_user_meta_data->>'referral_code'))
      WHERE user_id = NEW.id
        AND referred_by IS NULL;

      INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
      VALUES (referrer, NEW.id, upper(trim(NEW.raw_user_meta_data->>'referral_code')), 'registered')
      ON CONFLICT (referred_user_id) DO NOTHING;

      PERFORM public.refresh_referral_count(referrer);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_referral_for_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_people(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_leaderboard(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.refresh_referral_count(UUID) TO authenticated;
