-- CampusHub engagement, moderation, revenue, and ad placement upgrade.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS popularity_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_badge BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sub_admin_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_customer_id TEXT;

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS seller_phone TEXT,
  ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.hostel_listings
  ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Participants can update conversation metadata"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own post bookmarks"
ON public.post_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark posts"
ON public.post_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their bookmarks"
ON public.post_bookmarks FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post comments"
ON public.post_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create post comments"
ON public.post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their post comments"
ON public.post_comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their post comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.anonymous_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anonymous comments"
ON public.anonymous_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create anonymous comments"
ON public.anonymous_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their anonymous comments"
ON public.anonymous_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.anonymous_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create anonymous reports"
ON public.anonymous_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users and admins can view anonymous reports"
ON public.anonymous_reports FOR SELECT
USING (
  auth.uid() = reporter_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'sub_admin')
);

CREATE POLICY "Admins can update anonymous reports"
ON public.anonymous_reports FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'sub_admin')
);

CREATE TRIGGER update_anonymous_reports_updated_at
BEFORE UPDATE ON public.anonymous_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'manual')),
  purpose TEXT NOT NULL CHECK (purpose IN ('ad', 'premium', 'donation', 'sub_admin', 'marketplace_urgent', 'affiliate', 'event')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  provider_payment_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments"
ON public.payments FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Users can create their payment intents"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('premium', 'sub_admin', 'verified_vendor')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'manual')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'inactive')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_type)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
ON public.user_subscriptions FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins can manage subscriptions"
ON public.user_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creative_url TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Learn more',
  cta_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('global', 'targeted', 'geo')),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('draft', 'pending_payment', 'active', 'paused', 'rejected', 'expired')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  tier_price NUMERIC NOT NULL DEFAULT 0,
  target_university_id UUID REFERENCES public.universities(id),
  target_departments TEXT[] NOT NULL DEFAULT '{}',
  target_interests TEXT[] NOT NULL DEFAULT '{}',
  geo_region TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  impressions_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  conversions_count INTEGER NOT NULL DEFAULT 0,
  reward_points INTEGER NOT NULL DEFAULT 0,
  ab_variant TEXT NOT NULL DEFAULT 'A',
  predicted_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active ads and their own ads"
ON public.ads FOR SELECT
USING (
  status = 'active'
  OR auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Users can create ads"
ON public.ads FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update ads"
ON public.ads FOR UPDATE
USING (
  auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion', 'dismissed')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their ad events"
ON public.ad_events FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users and ad owners can view relevant ad events"
ON public.ad_events FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.ads a WHERE a.id = ad_id AND a.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE TABLE IF NOT EXISTS public.popularity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  points INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.popularity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their popularity events"
ON public.popularity_events FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Users can create bounded popularity events"
ON public.popularity_events FOR INSERT
WITH CHECK (auth.uid() = user_id AND points BETWEEN 0 AND 100);

CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
    INSERT INTO public.popularity_events (user_id, source, points, reference_type, reference_id)
    SELECT p.user_id, 'post_like', 2, 'post', NEW.post_id FROM public.posts p WHERE p.id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE public.posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
    INSERT INTO public.popularity_events (user_id, source, points, reference_type, reference_id)
    SELECT p.user_id, 'post_comment', 3, 'post', NEW.post_id FROM public.posts p WHERE p.id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE public.posts SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS post_comments_count_trigger ON public.post_comments;
CREATE TRIGGER post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

CREATE OR REPLACE FUNCTION public.update_anonymous_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.anonymous_posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE public.anonymous_posts SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS anonymous_comments_count_trigger ON public.anonymous_comments;
CREATE TRIGGER anonymous_comments_count_trigger
AFTER INSERT OR DELETE ON public.anonymous_comments
FOR EACH ROW EXECUTE FUNCTION public.update_anonymous_comment_count();

CREATE OR REPLACE FUNCTION public.apply_popularity_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    popularity_points = GREATEST(COALESCE(popularity_points, 0) + NEW.points, 0),
    experience_points = GREATEST(COALESCE(experience_points, 0) + NEW.points, 0),
    reputation_score = GREATEST(COALESCE(reputation_score, 0) + NEW.points, 0)
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS popularity_event_apply_trigger ON public.popularity_events;
CREATE TRIGGER popularity_event_apply_trigger
AFTER INSERT ON public.popularity_events
FOR EACH ROW EXECUTE FUNCTION public.apply_popularity_event();

CREATE OR REPLACE FUNCTION public.apply_ad_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_reward_points INTEGER;
BEGIN
  IF NEW.event_type = 'impression' THEN
    UPDATE public.ads SET impressions_count = impressions_count + 1 WHERE id = NEW.ad_id;
  ELSIF NEW.event_type = 'click' THEN
    UPDATE public.ads SET clicks_count = clicks_count + 1 WHERE id = NEW.ad_id;
    SELECT reward_points INTO v_reward_points FROM public.ads WHERE id = NEW.ad_id;
    IF NEW.user_id IS NOT NULL AND COALESCE(v_reward_points, 0) > 0 THEN
      INSERT INTO public.popularity_events (user_id, source, points, reference_type, reference_id)
      VALUES (NEW.user_id, 'ad_engagement_reward', LEAST(v_reward_points, 25), 'ad', NEW.ad_id);
    END IF;
  ELSIF NEW.event_type = 'conversion' THEN
    UPDATE public.ads SET conversions_count = conversions_count + 1 WHERE id = NEW.ad_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ad_event_apply_trigger ON public.ad_events;
CREATE TRIGGER ad_event_apply_trigger
AFTER INSERT ON public.ad_events
FOR EACH ROW EXECUTE FUNCTION public.apply_ad_event();

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('post-media', 'post-media', true),
  ('listing-media', 'listing-media', true),
  ('profile-media', 'profile-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own post media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('post-media', 'listing-media', 'profile-media') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('post-media', 'listing-media', 'profile-media') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (bucket_id IN ('post-media', 'listing-media', 'profile-media') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view CampusHub media"
ON storage.objects FOR SELECT
USING (bucket_id IN ('post-media', 'listing-media', 'profile-media'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, university_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'university_id', '')::uuid
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      display_name = EXCLUDED.display_name,
      university_id = COALESCE(public.profiles.university_id, EXCLUDED.university_id);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'marketplace_listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hostel_listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hostel_listings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
  END IF;
END $$;
