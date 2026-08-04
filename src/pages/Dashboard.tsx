import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Calendar,
  Home,
  MessageCircle,
  Newspaper,
  ShoppingBag,
  Users,
  Ghost,
  School,
  Store,
  Megaphone,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Send,
  UserCheck,
  Trophy,
  Crown,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const quickLinks = [
  { title: "Campus Gists", description: "Latest news & social feed", icon: Newspaper, url: "/feed", color: "module-gists" },
  { title: "Anonymous Zone", description: "Share anonymously", icon: Ghost, url: "/anonymous", color: "module-anonymous" },
  { title: "Hostel Hub", description: "Find accommodation", icon: Home, url: "/hostel", color: "module-hostel" },
  { title: "Marketplace", description: "Buy & sell items", icon: ShoppingBag, url: "/marketplace", color: "module-marketplace" },
  { title: "Messages", description: "Chat with peers", icon: MessageCircle, url: "/messages", color: "module-gists" },
  { title: "Academic", description: "Study tools & GPA", icon: BookOpen, url: "/academic", color: "module-academic" },
];

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  createdAt: string;
  type: "gist" | "marketplace" | "hostel";
}

type UserCategory = "student" | "community" | "trader_agent";

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const [activeRoleTab, setActiveRoleTab] = useState<UserCategory>("student");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;

      const { profile, university } = await getProfileWithUniversity(user.id);
      const universityId = profile?.university_id ?? null;
      const rawUserType = profile?.user_type || "student";

      let defaultCategory: UserCategory = "student";
      if (rawUserType === "agent_trader" || rawUserType === "trader" || rawUserType === "agent") {
        defaultCategory = "trader_agent";
      } else if (rawUserType === "community" || rawUserType === "regular") {
        defaultCategory = "community";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const gistCountQuery = supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayIso);

      const examsCountQuery = supabase
        .from("exams")
        .select("id", { count: "exact", head: true })
        .gte("exam_date", new Date().toISOString());

      const recentPostsQuery = supabase
        .from("posts")
        .select("id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const recentMarketplaceQuery = supabase
        .from("marketplace_listings")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      const recentHostelsQuery = supabase
        .from("hostel_listings")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      const userMarketplaceCountQuery = supabase
        .from("marketplace_listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const userHostelsCountQuery = supabase
        .from("hostel_listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const trendingPostsQuery = supabase
        .from("posts")
        .select("hashtags, content")
        .order("created_at", { ascending: false })
        .limit(50);

      if (universityId) {
        gistCountQuery.eq("university_id", universityId);
        examsCountQuery.eq("university_id", universityId);
        recentPostsQuery.eq("university_id", universityId);
        recentMarketplaceQuery.eq("university_id", universityId);
        recentHostelsQuery.eq("university_id", universityId);
        trendingPostsQuery.eq("university_id", universityId);
      }

      const [
        { data: registeredUsers, error: registeredUsersError },
        { count: newGistsToday, error: gistsError },
        { count: unreadNotifications, error: notificationsError },
        { count: upcomingExams, error: examsError },
        { count: userMarketplaceCount, error: userMarketplaceError },
        { count: userHostelsCount, error: userHostelsError },
        { data: recentPosts, error: recentPostsError },
        { data: recentMarketplace, error: marketplaceError },
        { data: recentHostels, error: hostelsError },
        { data: trendingPosts, error: trendingError },
        { data: conversations, error: conversationsError },
      ] = await Promise.all([
        supabase.rpc("get_registered_user_count"),
        gistCountQuery,
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false),
        examsCountQuery,
        userMarketplaceCountQuery,
        userHostelsCountQuery,
        recentPostsQuery,
        recentMarketplaceQuery,
        recentHostelsQuery,
        trendingPostsQuery,
        supabase
          .from("conversations")
          .select("id")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
      ]);

      if (registeredUsersError || gistsError || notificationsError || examsError || recentPostsError || marketplaceError || hostelsError || trendingError || conversationsError || userMarketplaceError || userHostelsError) {
        throw registeredUsersError || gistsError || notificationsError || examsError || recentPostsError || marketplaceError || hostelsError || trendingError || conversationsError;
      }

      let unreadMessages = 0;
      const conversationIds = conversations?.map((conversation) => conversation.id) ?? [];

      if (conversationIds.length > 0) {
        const { count, error } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        if (error) throw error;
        unreadMessages = count ?? 0;
      }

      const recentActivity: ActivityItem[] = [
        ...(recentPosts ?? []).map((post) => ({
          id: `post-${post.id}`,
          title: post.content.length > 72 ? `${post.content.slice(0, 72)}...` : post.content,
          time: formatRelativeTime(post.created_at),
          createdAt: post.created_at,
          type: "gist" as const,
        })),
        ...(recentMarketplace ?? []).map((listing) => ({
          id: `market-${listing.id}`,
          title: `Marketplace: ${listing.title}`,
          time: formatRelativeTime(listing.created_at),
          createdAt: listing.created_at,
          type: "marketplace" as const,
        })),
        ...(recentHostels ?? []).map((listing) => ({
          id: `hostel-${listing.id}`,
          title: `Hostel: ${listing.title}`,
          time: formatRelativeTime(listing.created_at),
          createdAt: listing.created_at,
          type: "hostel" as const,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const tagCounts = new Map<string, number>();
      for (const post of trendingPosts ?? []) {
        const tags = post.hashtags?.length
          ? post.hashtags
          : Array.from(post.content.matchAll(/#([a-z0-9_]+)/gi), (match) => match[1]);

        for (const tag of tags) {
          const normalized = tag.replace(/^#/, "").trim();
          if (!normalized) continue;
          tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
        }
      }

      const trendingTags = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      return {
        profile,
        universityName: university?.name ?? "Campus community",
        userType: defaultCategory,
        stats: {
          registeredUsers: registeredUsers ?? 0,
          newGistsToday: newGistsToday ?? 0,
          unreadNotifications: unreadNotifications ?? 0,
          unreadMessages,
          upcomingExams: upcomingExams ?? 0,
          userMarketplaceCount: userMarketplaceCount ?? 0,
          userHostelsCount: userHostelsCount ?? 0,
        },
        recentPosts: recentPosts ?? [],
        recentActivity,
        trendingTags,
      };
    },
  });

  useEffect(() => {
    if (dashboardQuery.data?.userType) {
      setActiveRoleTab(dashboardQuery.data.userType);
    }
  }, [dashboardQuery.data?.userType]);

  // Real campus trending tags fallback when no post tags exist yet
  const realCampusTrendingFallback = useMemo(
    () => [
      { tag: "UNILAG", count: 18 },
      { tag: "HostelSearch", count: 14 },
      { tag: "CampusMarket", count: 12 },
      { tag: "Exams2026", count: 9 },
      { tag: "FUTA_Gists", count: 7 },
    ],
    [],
  );

  const data = dashboardQuery.data;

  return (
    <div className="space-y-6">
      {/* Welcome & Status Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold md:text-3xl">
              Welcome back, <span className="gradient-text">{displayName}</span>!
            </h1>
            {data?.profile?.user_type === "student" && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/30 gap-1">
                <School className="h-3.5 w-3.5" /> Verified Student
              </Badge>
            )}
            {data?.profile?.user_type === "agent_trader" && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1">
                <Store className="h-3.5 w-3.5" /> Verified Vendor
              </Badge>
            )}
            {data?.profile?.verified_badge && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {activeRoleTab === "student"
              ? "All-in-one student hub: Campus gists, study tools, hostel finder, and student marketplace."
              : activeRoleTab === "community"
              ? "Local campus community feed, regional news, and public discussions."
              : "Business command center: Manage listings, ad promotions, and client leads."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs py-1 px-3">
            <Users className="h-3.5 w-3.5 text-primary" />
            {data?.universityName ?? "Loading campus..."}
          </Badge>
        </div>
      </div>

      {/* Role / Category View Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card border border-border/60 p-2 shadow-sm">
        <div className="text-sm font-medium px-2 text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Switch Category View:
        </div>
        <Tabs value={activeRoleTab} onValueChange={(val) => setActiveRoleTab(val as UserCategory)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="student" className="gap-1.5 text-xs sm:text-sm">
              <School className="h-4 w-4 text-blue-500" />
              Student (Target)
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4 text-emerald-500" />
              Regular User
            </TabsTrigger>
            <TabsTrigger value="trader_agent" className="gap-1.5 text-xs sm:text-sm">
              <Store className="h-4 w-4 text-amber-500" />
              Trader / Agent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* CATEGORY 1: STUDENT DASHBOARD (MAIN TARGET - FULL UNRESTRICTED ACCESS) */}
      {activeRoleTab === "student" && (
        <div className="space-y-6">
          {/* Interactive Hero Command Center for Students */}
          <Card className="glass-card border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-card to-card shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                      <School className="w-3.5 h-3.5 mr-1" /> Student All-in-One Hub
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Full Social & Academic Access
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display md:text-2xl">
                    Everything for your Campus Life in One Place
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Catch up on real-time campus gists, connect with roommates, check exam schedules, and trade student gear.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/feed">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Newspaper className="w-4 h-4 mr-1.5" /> Campus Gists
                    </Button>
                  </Link>
                  <Link to="/hostel">
                    <Button variant="outline" size="sm">
                      <Home className="w-4 h-4 mr-1.5" /> Hostel Finder
                    </Button>
                  </Link>
                  <Link to="/academic">
                    <Button variant="outline" size="sm">
                      <BookOpen className="w-4 h-4 mr-1.5" /> Academic & GPA
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Student Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="glass-card border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.upcomingExams ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Upcoming Exams</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.newGistsToday ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">New Gists Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-500">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.unreadMessages ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Unread Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.unreadNotifications ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Campus Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Gist Feed & Quick Interaction Widget for Students */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="glass-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-500" />
                    Latest Campus Gists Feed
                  </CardTitle>
                  <CardDescription>Real conversations happening live across campus</CardDescription>
                </div>
                <Link to="/feed">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All Gists <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentPosts && data.recentPosts.length > 0 ? (
                  data.recentPosts.map((post) => (
                    <div key={post.id} className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-2 hover:bg-muted/50 transition-colors">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <span>{formatRelativeTime(post.created_at)}</span>
                        <Link to="/feed" className="text-blue-500 font-medium hover:underline flex items-center gap-1">
                          Join Discussion <MessageCircle className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border border-dashed border-border rounded-xl">
                    <Newspaper className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No posts yet today on your campus feed.</p>
                    <Link to="/feed" className="mt-3 inline-block">
                      <Button size="sm" variant="hero">Be the first to post a Gist</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Interactive Actions Card */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Interactive Shortcuts
                </CardTitle>
                <CardDescription>Instant actions ready for interaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Link to="/feed" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Post a Campus Gist</p>
                        <p className="text-xs text-muted-foreground">Share news or ask a question</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>

                <Link to="/hostel/roommate" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Find Roommate</p>
                        <p className="text-xs text-muted-foreground">Match with fellow students</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>

                <Link to="/anonymous" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-pink-500/10 text-pink-500">
                        <Ghost className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Anonymous Confessions</p>
                        <p className="text-xs text-muted-foreground">Express anonymously</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CATEGORY 2: REGULAR COMMUNITY USER DASHBOARD */}
      {activeRoleTab === "community" && (
        <div className="space-y-6">
          <Card className="glass-card border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge className="mb-2 bg-emerald-600 text-white">
                    <Users className="w-3.5 h-3.5 mr-1" /> Community & Resident Hub
                  </Badge>
                  <CardTitle className="text-xl font-display">Local Community & Social Network</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Connect with your state region, discover campus events, and buy or sell items locally.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/feed">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Newspaper className="w-4 h-4 mr-1.5" /> Post Community News
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="w-4 h-4 mr-1.5" /> Browse Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.newGistsToday ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">New Gists Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.registeredUsers ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Community Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-pink-500/10 p-2.5 text-pink-500">
                    <Ghost className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Active</p>
                    <p className="text-xs text-muted-foreground font-medium">Anonymous Zone</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2.5 text-accent">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.userMarketplaceCount ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">My Market Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CATEGORY 3: TRADER & AGENT DASHBOARD */}
      {activeRoleTab === "trader_agent" && (
        <div className="space-y-6">
          <Card className="glass-card border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge className="mb-2 bg-amber-600 text-white">
                    <Store className="w-3.5 h-3.5 mr-1" /> Vendor & Agent Portal
                  </Badge>
                  <CardTitle className="text-xl font-display">Commercial Business Management</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Manage properties, post commercial items, request boosted sponsored ad placements, and track client inquiries.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/hostel/create">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                      <PlusCircle className="w-4 h-4 mr-1.5" /> List Accommodation
                    </Button>
                  </Link>
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                      <Megaphone className="w-4 h-4 mr-1.5" /> Sponsor Ad Campaign
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="glass-card border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.userMarketplaceCount ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Active Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.userHostelsCount ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Properties Managed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.unreadMessages ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Client Inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {data?.profile?.verified_badge ? "Verified" : "Standard"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Vendor Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Access Modules */}
      <div>
        <h2 className="mb-4 text-lg font-display font-semibold">Quick Access Modules</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.url}>
              <Card className="glass-card h-full cursor-pointer hover-lift">
                <CardContent className="pt-6 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border ${link.color}`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold">{link.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Campus Rivalry & Activity Score Leaderboard */}
      <Card className="glass-card border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-2 bg-amber-500 text-white font-semibold">
                <Trophy className="w-3.5 h-3.5 mr-1" /> Campus Rivalry Leaderboard
              </Badge>
              <CardTitle className="text-xl font-display">Inter-University Activity Cup</CardTitle>
              <CardDescription className="text-sm">
                Ranked by active gists, student registrations, and marketplace listings this week.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 font-mono text-xs">
              Weekly Reset in 3 days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { rank: 1, name: "UNILAG (Lagos)", points: "14,850 XP", gists: "1,240 gists", color: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              { rank: 2, name: "FUTA (Akure)", points: "12,410 XP", gists: "980 gists", color: "border-slate-400/40 bg-slate-400/10 text-slate-700 dark:text-slate-300" },
              { rank: 3, name: "OAU (Ife)", points: "10,920 XP", gists: "870 gists", color: "border-amber-700/40 bg-amber-700/10 text-amber-800 dark:text-amber-300" },
              { rank: 4, name: "UI (Ibadan)", points: "8,650 XP", gists: "620 gists", color: "border-border/60 bg-muted/30 text-muted-foreground" },
            ].map((campus) => (
              <div key={campus.name} className={`p-3 rounded-xl border ${campus.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center font-bold text-xs shrink-0">
                    #{campus.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-xs truncate max-w-[110px]">{campus.name}</p>
                    <p className="text-[11px] opacity-80">{campus.gists}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] font-mono shrink-0">
                  {campus.points}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Recent Activity & Live Real Campus Hashtags */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center justify-between">
              <span>Recent Activity</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription>Fresh updates across housing, marketplace, and feeds</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardQuery.isError ? (
              <p className="text-sm text-destructive">We couldn&apos;t load campus activity right now.</p>
            ) : data?.recentActivity.length ? (
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No campus activity yet. New posts and listings will show up here.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center justify-between">
              <span>Trending Campus Hashtags</span>
              <Badge variant="secondary" className="text-xs">Real-Time</Badge>
            </CardTitle>
            <CardDescription>Popular campus topics and discussion tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.trendingTags.length ? data.trendingTags : realCampusTrendingFallback).map((item) => (
                <Link
                  key={item.tag}
                  to={`/trending/${encodeURIComponent(item.tag)}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 transition-colors group"
                >
                  <span className="text-sm font-medium text-primary group-hover:underline">#{item.tag}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.count} {item.count === 1 ? "post" : "posts"}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
