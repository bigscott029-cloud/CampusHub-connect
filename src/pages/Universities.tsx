import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  Globe,
  Home,
  MapPin,
  MessageSquare,
  Newspaper,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatCompactNumber } from "@/lib/utils";

interface UniversityCardData {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  logo_url: string | null;
  institution_type?: string | null;
  ownership?: string | null;
  state?: string | null;
  region?: string | null;
  accent_color?: string | null;
  aliases?: string[] | null;
  stats: {
    gists: number;
    marketplace: number;
    housing: number;
    roommateRequests: number;
  };
  features: string[];
  activityScore: number;
}

const Universities = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const universitiesQuery = useQuery({
    queryKey: ["universities-directory"],
    queryFn: async () => {
      const [
        { data: universities, error: universitiesError },
        { data: posts, error: postsError },
        { data: marketplace, error: marketplaceError },
        { data: hostels, error: hostelsError },
        { data: roommateRequests, error: roommateError },
      ] = await Promise.all([
        (supabase as any).from("universities").select("id, name, slug, location, logo_url, institution_type, ownership, state, region, accent_color, aliases").order("name"),
        supabase.from("posts").select("id, university_id"),
        supabase.from("marketplace_listings").select("id, university_id"),
        supabase.from("hostel_listings").select("id, university_id"),
        supabase.from("roommate_requests").select("id, university_id"),
      ]);

      if (universitiesError || postsError || marketplaceError || hostelsError || roommateError) {
        throw universitiesError || postsError || marketplaceError || hostelsError || roommateError;
      }

      const gistCounts = new Map<string, number>();
      const marketplaceCounts = new Map<string, number>();
      const hostelCounts = new Map<string, number>();
      const roommateCounts = new Map<string, number>();

      for (const item of posts ?? []) {
        if (!item.university_id) continue;
        gistCounts.set(item.university_id, (gistCounts.get(item.university_id) ?? 0) + 1);
      }

      for (const item of marketplace ?? []) {
        if (!item.university_id) continue;
        marketplaceCounts.set(item.university_id, (marketplaceCounts.get(item.university_id) ?? 0) + 1);
      }

      for (const item of hostels ?? []) {
        if (!item.university_id) continue;
        hostelCounts.set(item.university_id, (hostelCounts.get(item.university_id) ?? 0) + 1);
      }

      for (const item of roommateRequests ?? []) {
        if (!item.university_id) continue;
        roommateCounts.set(item.university_id, (roommateCounts.get(item.university_id) ?? 0) + 1);
      }

      const cards: UniversityCardData[] = (universities ?? []).map((university) => {
        const gists = gistCounts.get(university.id) ?? 0;
        const market = marketplaceCounts.get(university.id) ?? 0;
        const housing = hostelCounts.get(university.id) ?? 0;
        const roommate = roommateCounts.get(university.id) ?? 0;
        const features = [
          gists > 0 ? "Campus discussions live" : null,
          market > 0 ? "Marketplace active" : null,
          housing > 0 ? "Housing board active" : null,
          roommate > 0 ? "Roommate requests live" : null,
        ].filter(Boolean) as string[];

        return {
          ...university,
          stats: {
            gists,
            marketplace: market,
            housing,
            roommateRequests: roommate,
          },
          features: features.length > 0 ? features : ["Fresh campus setup"],
          activityScore: gists + market + housing + roommate,
        };
      });

      return {
        cards,
        totals: {
          universities: cards.length,
          publicPosts: (posts ?? []).length,
          publicListings: (marketplace?.length ?? 0) + (hostels?.length ?? 0),
          roommateRequests: (roommateRequests ?? []).length,
        },
      };
    },
  });

  const filteredUniversities = useMemo(() => {
    const cards = universitiesQuery.data?.cards ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return cards;
    }

    return cards.filter((university) => {
      return (
        university.name.toLowerCase().includes(query) ||
        university.slug.toLowerCase().includes(query) ||
        university.location?.toLowerCase().includes(query) ||
        university.state?.toLowerCase().includes(query) ||
        university.region?.toLowerCase().includes(query) ||
        university.institution_type?.toLowerCase().includes(query) ||
        university.aliases?.some((alias) => alias.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, universitiesQuery.data?.cards]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden pb-12 pt-24">
          <div className="absolute inset-0 gradient-hero-bg opacity-5" />
          <div className="container relative px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 gradient-bg text-primary-foreground">
                <Building2 className="mr-1 h-3 w-3" />
                Live campus directory
              </Badge>
              <h1 className="mb-6 text-4xl font-display font-bold md:text-5xl">
                Find Your <span className="gradient-text">University</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Browse universities, polytechnics, and colleges with real activity pulled from the live database: public gists, listings, housing posts, and roommate requests.
              </p>

              <div className="relative mx-auto max-w-lg">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for your university..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-14 pl-12 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/30 py-8">
          <div className="container px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                {
                  icon: Globe,
                  value: universitiesQuery.isLoading ? "--" : formatCompactNumber(universitiesQuery.data?.totals.universities ?? 0),
                  label: "Institutions",
                },
                {
                  icon: Newspaper,
                  value: universitiesQuery.isLoading ? "--" : formatCompactNumber(universitiesQuery.data?.totals.publicPosts ?? 0),
                  label: "Public Gists",
                },
                {
                  icon: TrendingUp,
                  value: universitiesQuery.isLoading ? "--" : formatCompactNumber(universitiesQuery.data?.totals.publicListings ?? 0),
                  label: "Listings",
                },
                {
                  icon: MessageSquare,
                  value: universitiesQuery.isLoading ? "--" : formatCompactNumber(universitiesQuery.data?.totals.roommateRequests ?? 0),
                  label: "Roommate Posts",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="font-display text-xl font-bold">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container px-4">
            {universitiesQuery.isError ? (
              <Card className="glass-card mx-auto max-w-2xl">
                <CardContent className="py-12 text-center">
                  <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Couldn&apos;t load universities</h3>
                  <p className="text-muted-foreground">The live campus directory is unavailable right now. Please try again shortly.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUniversities.map((university) => (
                  <Card key={university.id} className="glass-card group overflow-hidden hover-lift">
                    <div className="h-2" style={{ backgroundColor: university.accent_color || "hsl(var(--primary))" }} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
                            {university.logo_url ? (
                              <img src={university.logo_url} alt={university.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-primary">{university.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-bold leading-tight">{university.name}</h3>
                            {university.aliases?.[0] && (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                {university.aliases[0]}
                              </Badge>
                            )}
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {university.location || "Campus location pending"}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {university.institution_type && (
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                  {university.institution_type.replace(/_/g, " ")}
                                </Badge>
                              )}
                              {university.region && (
                                <Badge variant="outline" className="text-[10px]">
                                  {university.region}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{formatCompactNumber(university.activityScore)} signals</Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="mb-4 grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatCompactNumber(university.stats.gists)}</p>
                          <p className="text-xs text-muted-foreground">Gists</p>
                        </div>
                        <div className="border-x border-border/50 text-center">
                          <p className="text-lg font-bold">{formatCompactNumber(university.stats.marketplace)}</p>
                          <p className="text-xs text-muted-foreground">Market</p>
                        </div>
                        <div className="border-r border-border/50 text-center">
                          <p className="text-lg font-bold">{formatCompactNumber(university.stats.housing)}</p>
                          <p className="text-xs text-muted-foreground">Housing</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatCompactNumber(university.stats.roommateRequests)}</p>
                          <p className="text-xs text-muted-foreground">Requests</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {university.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            {university.stats.marketplace + university.stats.housing} live listings
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" asChild>
                          <Link to={`/university/${university.slug}`}>
                            Explore <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!universitiesQuery.isError && filteredUniversities.length === 0 && (
              <div className="py-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No universities found</h3>
                <p className="text-muted-foreground">Try a different search term.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <Card className="glass-card mx-auto max-w-2xl p-8 text-center">
              <h2 className="mb-3 text-2xl font-display font-bold">Don&apos;t See Your University?</h2>
              <p className="mb-6 text-muted-foreground">
                Once a university is added in the admin flow, its public gists, housing posts, and marketplace activity will appear here automatically.
              </p>
              <Button variant="hero" asChild>
                <a href="mailto:campushub.connect@gmail.com?subject=Request%20Institution">Request Your Institution</a>
              </Button>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Universities;
