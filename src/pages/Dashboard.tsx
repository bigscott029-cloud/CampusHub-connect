import { useMemo } from "react";
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
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
  { title: "Campus Gists", description: "Latest news & updates", icon: Newspaper, url: "/feed", color: "module-gists" },
  { title: "Anonymous Zone", description: "Share anonymously", icon: Ghost, url: "/anonymous", color: "module-anonymous" },
  { title: "Hostel Hub", description: "Find accommodation", icon: Home, url: "/hostel", color: "module-hostel" },
  { title: "Marketplace", description: "Buy & sell items", icon: ShoppingBag, url: "/marketplace", color: "module-marketplace" },
  { title: "Messages", description: "Chat with peers", icon: MessageCircle, url: "/messages", color: "module-gists" },
  { title: "Academic", description: "Study resources", icon: BookOpen, url: "/academic", color: "module-academic" },
];

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  createdAt: string;
  type: "gist" | "marketplace" | "hostel";
}

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) {
        return null;
      }

      const { profile, university } = await getProfileWithUniversity(user.id);
      const universityId = profile?.university_id ?? null;

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
        .limit(4);

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
        recentPostsQuery,
        recentMarketplaceQuery,
        recentHostelsQuery,
        trendingPostsQuery,
        supabase
          .from("conversations")
          .select("id")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
      ]);

      if (registeredUsersError || gistsError || notificationsError || examsError || recentPostsError || marketplaceError || hostelsError || trendingError || conversationsError) {
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

        if (error) {
          throw error;
        }

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
        .slice(0, 4);

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
        universityName: university?.name ?? "Campus community",
        stats: {
          registeredUsers: registeredUsers ?? 0,
          newGistsToday: newGistsToday ?? 0,
          unreadNotifications: unreadNotifications ?? 0,
          unreadMessages,
          upcomingExams: upcomingExams ?? 0,
        },
        recentActivity,
        trendingTags,
      };
    },
  });

  const emptyTrendingTags = useMemo(
    () => [
      { tag: "CampusHub", count: 0 },
      { tag: "StudyTips", count: 0 },
      { tag: "Marketplace", count: 0 },
    ],
    [],
  );

  const data = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold md:text-3xl">
            Welcome back, <span className="gradient-text">{displayName}</span>!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening on your campus today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {data?.universityName ?? "Loading campus..."}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.registeredUsers ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Registered Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Bell className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.unreadNotifications ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Unread Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.unreadMessages ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dashboardQuery.isLoading ? "--" : formatCompactNumber(data?.stats.upcomingExams ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Upcoming Exams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-display font-semibold">Quick Access</h2>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
            <CardDescription>Fresh updates from your campus</CardDescription>
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
                      <p className="text-sm">{activity.title}</p>
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
            <CardTitle className="text-lg font-display">Trending on Campus</CardTitle>
            <CardDescription>Popular hashtags from recent gists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.trendingTags.length ? data.trendingTags : emptyTrendingTags).map((item) => (
                <div key={item.tag} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">#{item.tag}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.count} {item.count === 1 ? "post" : "posts"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
