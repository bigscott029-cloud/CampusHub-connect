-- Anonymous names table for Anonymous Zone
CREATE TABLE public.anonymous_names (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    anonymous_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own anonymous name" ON public.anonymous_names FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own anonymous name" ON public.anonymous_names FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own anonymous name" ON public.anonymous_names FOR UPDATE USING (auth.uid() = user_id);

-- Hostel listings table
CREATE TABLE public.hostel_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    price_period TEXT DEFAULT 'yearly',
    location TEXT NOT NULL,
    hostel_type TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    phone_number TEXT,
    status TEXT DEFAULT 'pending',
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hostel_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved hostel listings" ON public.hostel_listings FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create hostel listings" ON public.hostel_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.hostel_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all listings" ON public.hostel_listings FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_hostel_listings_updated_at BEFORE UPDATE ON public.hostel_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Roommate requests table
CREATE TABLE public.roommate_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    preferred_location TEXT,
    preferences TEXT,
    status TEXT DEFAULT 'pending',
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roommate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved roommate requests" ON public.roommate_requests FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create roommate requests" ON public.roommate_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own requests" ON public.roommate_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all requests" ON public.roommate_requests FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_roommate_requests_updated_at BEFORE UPDATE ON public.roommate_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    condition TEXT,
    location TEXT,
    images TEXT[] DEFAULT '{}',
    is_urgent BOOLEAN DEFAULT false,
    urgent_payment_status TEXT,
    status TEXT DEFAULT 'pending',
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved marketplace listings" ON public.marketplace_listings FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create marketplace listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all marketplace listings" ON public.marketplace_listings FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Stories table
CREATE TABLE public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL,
    content_url TEXT,
    text_content TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-expired stories" ON public.stories FOR SELECT USING (expires_at > now());
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Posts table for Campus Gists
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    location TEXT,
    hashtags TEXT[] DEFAULT '{}',
    link_url TEXT,
    post_type TEXT DEFAULT 'gist',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Post likes table
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Follows table
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Anonymous posts table
CREATE TABLE public.anonymous_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    anonymous_name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'confession',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anonymous posts" ON public.anonymous_posts FOR SELECT USING (true);
CREATE POLICY "Users can create anonymous posts" ON public.anonymous_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exams table
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    exam_date TIMESTAMPTZ NOT NULL,
    department TEXT,
    level TEXT,
    university_id UUID REFERENCES public.universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Semi-admins can create exams" ON public.exams FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'moderator') OR 
    public.has_role(auth.uid(), 'university_admin')
);

-- User exam subscriptions
CREATE TABLE public.user_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, exam_id)
);

ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their exams" ON public.user_exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can subscribe to exams" ON public.user_exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsubscribe from exams" ON public.user_exams FOR DELETE USING (auth.uid() = user_id);

-- Add reputation and university change tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_change_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_time_spent INTEGER DEFAULT 0;

-- Admin listing requests table
CREATE TABLE public.admin_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT NOT NULL,
    reference_id UUID,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their requests" ON public.admin_requests FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Users can create requests" ON public.admin_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requests" ON public.admin_requests FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_admin_requests_updated_at BEFORE UPDATE ON public.admin_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();