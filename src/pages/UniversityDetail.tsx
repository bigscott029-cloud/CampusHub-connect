import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Home,
  MapPin,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatCompactNumber, formatCurrency, formatRelativeTime } from "@/lib/utils";

const UniversityDetail = () => {
  const { slug } = useParams();

  const universityQuery = useQuery({
    queryKey: ["university-detail", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: university, error: universityError } = await supabase
        .from("universities")
        .select("id, name, slug, location, logo_url")
        .eq("slug", slug ?? "")
        .maybeSingle();

      if (universityError) {
        throw universityError;
      }

      if (!university) {
        return null;
      }

      const [
        { data: posts, error: postsError },
        { data: marketplace, error: marketplaceError },
        { data: hostels, error: hostelsError },
        { data: roommateRequests, error: roommateError },
        { count: anonymousPosts, error: anonymousError },
      ] = await Promise.all([
        supabase
          .from("posts")
          .select("id, content, hashtags, created_at, likes_count, comments_count")
          .eq("university_id", university.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("marketplace_listings")
          .select("id, title, price, category, created_at")
          .eq("university_id", university.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("hostel_listings")
          .select("id, title, price, price_period, location, created_at")
          .eq("university_id", university.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("roommate_requests")
          .select("id, title, budget_min, budget_max, preferred_location, created_at")
          .eq("university_id", university.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("anonymous_posts")
          .select("id", { count: "exact", head: true })
          .eq("university_id", university.id),
      ]);

      if (postsError || marketplaceError || hostelsError || roommateError || anonymousError) {
        throw postsError || marketplaceError || hostelsError || roommateError || anonymousError;
      }

      const marketplaceCategories = new Map<string, number>();
      for (const listing of marketplace ?? []) {
        marketplaceCategories.set(
          listing.category,
          (marketplaceCategories.get(listing.category) ?? 0) + 1,
        );
      }

      const trendingTags = new Map<string, number>();
      for (const post of posts ?? []) {
        const tags = post.hashtags?.length
          ? post.hashtags
          : Array.from(post.content.matchAll(/#([a-z0-9_]+)/gi), (match) => match[1]);

        for (const tag of tags) {
          const normalized = tag.replace(/^#/, "").trim();
          if (!normalized) continue;
          trendingTags.set(normalized, (trendingTags.get(normalized) ?? 0) + 1);
        }
      }

      const averageHostelPrice = hostels?.length
        ? hostels.reduce((sum, hostel) => sum + hostel.price, 0) / hostels.length
        : null;

      return {
        university,
        posts: posts ?? [],
        marketplace: marketplace ?? [],
        hostels: hostels ?? [],
        roommateRequests: roommateRequests ?? [],
        anonymousPosts: anonymousPosts ?? 0,
        topCategories: [...marketplaceCategories.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        topTags: [...trendingTags.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        averageHostelPrice,
      };
    },
  });

  const data = universityQuery.data;

  const quickStats = useMemo(() => {
    if (!data) return [];

    return [
      { icon: Newspaper, value: data.posts.length, label: "Campus Gists" },
      { icon: ShoppingBag, value: data.marketplace.length, label: "Marketplace Listings" },
      { icon: Home, value: data.hostels.length, label: "Hostel Listings" },
      { icon: MessageSquare, value: data.roommateRequests.length, label: "Roommate Requests" },
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {universityQuery.isError ? (
          <section className="container px-4 py-24">
            <Card className="glass-card mx-auto max-w-2xl">
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h1 className="mb-2 text-2xl font-display font-bold">Campus page unavailable</h1>
                <p className="text-muted-foreground">We couldn&apos;t load this university right now.</p>
              </CardContent>
            </Card>
          </section>
        ) : !data ? (
          <section className="container px-4 py-24">
            <Card className="glass-card mx-auto max-w-2xl">
              <CardContent className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h1 className="mb-2 text-2xl font-display font-bold">University not found</h1>
                <p className="mb-6 text-muted-foreground">That campus doesn&apos;t exist in the current directory.</p>
                <Button asChild>
                  <Link to="/universities">Back to Universities</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden pb-12 pt-20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-hostel/10" />
              <div className="container relative px-4 pt-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-primary/10 shrink-0">
                    {data.university.logo_url ? (
                      <img src={data.university.logo_url} alt={data.university.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-primary">{data.university.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-display font-bold md:text-4xl">{data.university.name}</h1>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {data.university.location || "Campus location pending"}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {formatCompactNumber(
                          data.posts.length +
                            data.marketplace.length +
                            data.hostels.length +
                            data.roommateRequests.length +
                            data.anonymousPosts,
                        )}{" "}
                        public campus signals
                      </span>
                    </div>
                    <p className="max-w-3xl text-muted-foreground">
                      Explore live campus activity from the production database: recent gists, open listings, housing opportunities, anonymous posts, and roommate requests tied to {data.university.name}.
                    </p>
                  </div>

                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">Join Community</Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="border-y border-border/50 bg-muted/30 py-6">
              <div className="container px-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-card p-4 text-center">
                      <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                      <p className="font-display text-xl font-bold">{formatCompactNumber(stat.value)}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-12">
              <div className="container px-4">
                <Tabs defaultValue="overview" className="space-y-8">
                  <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="gists">Trending Gists</TabsTrigger>
                    <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                    <TabsTrigger value="hostels">Hostels</TabsTrigger>
                    <TabsTrigger value="roommates">Roommates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-primary" />
                            Latest Gists
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {data.posts.slice(0, 4).map((post) => (
                            <div key={post.id} className="border-b border-border/50 py-2 last:border-0">
                              <p className="text-sm">
                                {post.content.length > 90 ? `${post.content.slice(0, 90)}...` : post.content}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
                            </div>
                          ))}
                          {data.posts.length === 0 && (
                            <p className="text-sm text-muted-foreground">No public gists yet for this campus.</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-accent" />
                            Marketplace Pulse
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {data.topCategories.map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
                              <span className="text-sm capitalize">{category}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                          {data.topCategories.length === 0 && (
                            <p className="text-sm text-muted-foreground">No approved marketplace listings yet.</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-hostel" />
                            Roommate Board
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {data.roommateRequests.slice(0, 4).map((request) => (
                            <div key={request.id} className="border-b border-border/50 py-2 last:border-0">
                              <p className="text-sm font-medium">{request.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {request.preferred_location || "Location flexible"} • {formatRelativeTime(request.created_at)}
                              </p>
                            </div>
                          ))}
                          {data.roommateRequests.length === 0 && (
                            <p className="text-sm text-muted-foreground">No roommate requests are public yet.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Campus Snapshot
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="mb-2 font-semibold">Anonymous activity</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatCompactNumber(data.anonymousPosts)} anonymous posts are currently visible for this campus.
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-hostel/10">
                              <Home className="h-6 w-6 text-hostel" />
                            </div>
                            <h4 className="mb-2 font-semibold">Housing average</h4>
                            <p className="text-sm text-muted-foreground">
                              {data.averageHostelPrice
                                ? `${formatCurrency(data.averageHostelPrice)} typical listing price`
                                : "No housing data yet for an average price."}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                              <BookOpen className="h-6 w-6 text-accent" />
                            </div>
                            <h4 className="mb-2 font-semibold">Trending tags</h4>
                            <p className="text-sm text-muted-foreground">
                              {data.topTags.length
                                ? data.topTags.map(([tag]) => `#${tag}`).join(", ")
                                : "No trending hashtags yet from recent public gists."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="gists" className="space-y-4">
                    {data.posts.length === 0 ? (
                      <Card className="glass-card">
                        <CardContent className="py-12 text-center">
                          <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No public gists yet</h3>
                          <p className="mb-4 text-muted-foreground">Join this campus to start the conversation.</p>
                          <Button variant="hero" asChild>
                            <Link to="/signup">Sign Up Free</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      data.posts.map((post) => (
                        <Card key={post.id} className="glass-card">
                          <CardContent className="pt-6">
                            <p className="text-sm leading-relaxed">{post.content}</p>
                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                              <span>{formatRelativeTime(post.created_at)}</span>
                              <span>
                                {post.likes_count ?? 0} likes • {post.comments_count ?? 0} comments
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="marketplace" className="space-y-4">
                    {data.marketplace.length === 0 ? (
                      <Card className="glass-card">
                        <CardContent className="py-12 text-center">
                          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No marketplace listings yet</h3>
                          <p className="mb-4 text-muted-foreground">Approved listings for this campus will appear here automatically.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      data.marketplace.map((listing) => (
                        <Card key={listing.id} className="glass-card">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold">{listing.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground capitalize">{listing.category}</p>
                              </div>
                              <Badge>{formatCurrency(listing.price)}</Badge>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">{formatRelativeTime(listing.created_at)}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="hostels" className="space-y-4">
                    {data.hostels.length === 0 ? (
                      <Card className="glass-card">
                        <CardContent className="py-12 text-center">
                          <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No hostel listings yet</h3>
                          <p className="mb-4 text-muted-foreground">Housing posts for this campus will show up here once approved.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      data.hostels.map((hostel) => (
                        <Card key={hostel.id} className="glass-card">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold">{hostel.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{hostel.location}</p>
                              </div>
                              <Badge variant="secondary">
                                {formatCurrency(hostel.price)}/{hostel.price_period ?? "year"}
                              </Badge>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">{formatRelativeTime(hostel.created_at)}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="roommates" className="space-y-4">
                    {data.roommateRequests.length === 0 ? (
                      <Card className="glass-card">
                        <CardContent className="py-12 text-center">
                          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No roommate requests yet</h3>
                          <p className="mb-4 text-muted-foreground">This board will fill automatically as approved roommate posts come in.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      data.roommateRequests.map((request) => (
                        <Card key={request.id} className="glass-card">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold">{request.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {request.preferred_location || "Location flexible"}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {request.budget_min && request.budget_max
                                  ? `${formatCurrency(request.budget_min)} - ${formatCurrency(request.budget_max)}`
                                  : "Budget pending"}
                              </Badge>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">{formatRelativeTime(request.created_at)}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UniversityDetail;
