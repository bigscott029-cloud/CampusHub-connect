import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Building,
  Calendar,
  Edit,
  GraduationCap,
  Home,
  Mail,
  Newspaper,
  ShoppingBag,
  Star,
  TrendingUp,
  User,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";
import { formatCompactNumber, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fallbackDisplayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const profileQuery = useQuery({
    queryKey: ["profile-page", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) {
        return null;
      }

      const [{ profile, university }, { data: posts, error: postsError }, { data: marketplaceListings, error: marketplaceError }, { data: hostelListings, error: hostelError }] =
        await Promise.all([
          getProfileWithUniversity(user.id),
          supabase
            .from("posts")
            .select("id, content, likes_count, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("marketplace_listings")
            .select("id, title, price, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("hostel_listings")
            .select("id, title, price, price_period, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (postsError || marketplaceError || hostelError) {
        throw postsError || marketplaceError || hostelError;
      }

      const combinedListings = [
        ...(marketplaceListings ?? []).map((listing) => ({
          id: `market-${listing.id}`,
          title: listing.title,
          subtitle: formatCurrency(listing.price),
          status: listing.status ?? "pending",
          createdAt: listing.created_at,
          source: "Marketplace",
        })),
        ...(hostelListings ?? []).map((listing) => ({
          id: `hostel-${listing.id}`,
          title: listing.title,
          subtitle: `${formatCurrency(listing.price)}/${listing.price_period ?? "year"}`,
          status: listing.status ?? "pending",
          createdAt: listing.created_at,
          source: "Hostel",
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalLikes = (posts ?? []).reduce((sum, post) => sum + (post.likes_count ?? 0), 0);
      const reputationPoints = profile?.experience_points ?? profile?.reputation_score ?? 0;

      return {
        profile,
        university,
        posts: posts ?? [],
        listings: combinedListings,
        totalLikes,
        reputationPoints,
      };
    },
  });

  const data = profileQuery.data;
  const displayName = data?.profile?.display_name || fallbackDisplayName;

  const currentTier = useMemo(() => {
    const points = data?.reputationPoints ?? 0;

    if (points >= 1000) return "Campus Star";
    if (points >= 400) return "Rising Voice";
    if (points >= 100) return "Active Member";
    return "Regular";
  }, [data?.reputationPoints]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="glass-card overflow-hidden">
        <div className="h-32 gradient-hero-bg" />
        <CardContent className="relative pt-0">
          <div className="-mt-16 flex flex-col gap-4 md:flex-row md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={data?.profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-display font-bold">{displayName}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Building className="mr-1 h-3 w-3" />
                  {data?.university?.name || "University not set"}
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => navigate("/reputation")}
                >
                  <Star className="mr-1 h-3 w-3 text-warning" />
                  {formatCompactNumber(data?.reputationPoints ?? 0)} XP
                  <TrendingUp className="ml-1 h-3 w-3 text-success" />
                </Badge>
              </div>
            </div>

            <Button variant="outline" className="shrink-0" onClick={() => navigate("/profile/edit")}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Display Name</p>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">University</p>
                <p className="text-sm font-medium">{data?.university?.name || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{data?.profile?.department || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>
            {data?.profile?.bio && (
              <div>
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="text-sm">{data.profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Award className="h-5 w-5 text-warning" />
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full gradient-bg">
                <span className="text-2xl font-bold text-primary-foreground">
                  {formatCompactNumber(data?.reputationPoints ?? 0)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Experience Points</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Tier</span>
                <Badge>{currentTier}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posts</span>
                <span className="font-medium">{formatCompactNumber(data?.posts.length ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Likes</span>
                <span className="font-medium">{formatCompactNumber(data?.totalLikes ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listings</span>
                <span className="font-medium">{formatCompactNumber(data?.listings.length ?? 0)}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate("/reputation")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Account Snapshot</CardTitle>
            <CardDescription>Quick read on your live activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Most recent post</span>
              <span className="font-medium">
                {data?.posts[0] ? formatRelativeTime(data.posts[0].created_at) : "No posts yet"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Latest listing</span>
              <span className="font-medium">
                {data?.listings[0] ? formatRelativeTime(data.listings[0].createdAt) : "No listings yet"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profile status</span>
              <Badge variant="outline" className="capitalize">
                {data?.profile?.account_status || "active"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts" className="gap-1">
                <Newspaper className="h-4 w-4" />
                Posts ({data?.posts.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="listings" className="gap-1">
                <ShoppingBag className="h-4 w-4" />
                Listings ({data?.listings.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1">
                <Home className="h-4 w-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {profileQuery.isLoading ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center text-muted-foreground">Loading your posts...</CardContent>
                </Card>
              ) : data?.posts.length ? (
                data.posts.map((post) => (
                  <Card key={post.id} className="glass-card">
                    <CardContent className="pt-6">
                      <p className="text-sm">{post.content}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {post.likes_count ?? 0} likes
                          </span>
                          <span>{formatRelativeTime(post.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <Newspaper className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/feed")}>
                      Create your first post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="listings" className="mt-4 space-y-4">
              {profileQuery.isLoading ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center text-muted-foreground">Loading your listings...</CardContent>
                </Card>
              ) : data?.listings.length ? (
                data.listings.map((listing) => (
                  <Card key={listing.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline">{listing.source}</Badge>
                            <Badge variant="secondary" className="capitalize">
                              {listing.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{listing.title}</h3>
                          <p className="text-sm text-primary font-medium">{listing.subtitle}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(listing.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No listings yet</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/marketplace")}>
                      Sell something
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Home className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Saved items are not wired up yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
