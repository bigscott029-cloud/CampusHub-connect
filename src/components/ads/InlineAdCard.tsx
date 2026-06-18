/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InlineAdCardProps {
  placement: "marketplace" | "hostel";
}

const InlineAdCard = ({ placement }: InlineAdCardProps) => {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["inline-ad-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("university_id, home_region, user_type")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
  });

  const adsQuery = useQuery({
    queryKey: ["inline-ads", placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from("ads")
        .select("id, title, description, creative_url, cta_text, cta_url, sponsor_name, placement_type, target_scope, tier_price, priority, target_university_id, geo_region, placement_slots")
        .eq("status", "active")
        .eq("payment_status", "paid")
        .lte("starts_at", now)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;
      return (data ?? []).filter((ad: any) => (ad.placement_slots ?? []).includes(placement) || (ad.placement_slots ?? []).includes("inline"));
    },
  });

  const ad = useMemo(() => {
    const profile = profileQuery.data;
    const ads = adsQuery.data ?? [];
    if (!ads.length) return null;

    return ads
      .map((item: any) => ({
        item,
        score:
          Number(item.priority ?? 0) * 2 +
          Math.min(Number(item.tier_price ?? 0) / 1000, 30) +
          (item.target_university_id && item.target_university_id === profile?.university_id ? 35 : 0) +
          (item.geo_region && item.geo_region === profile?.home_region ? 25 : 0) +
          Math.random() * 4,
      }))
      .sort((a, b) => b.score - a.score)[0]?.item ?? null;
  }, [adsQuery.data, profileQuery.data]);

  const handleClick = async () => {
    if (!ad) return;
    await (supabase as any).from("ad_events").insert({
      ad_id: ad.id,
      user_id: user?.id ?? null,
      event_type: "click",
      metadata: { placement },
    });
  };

  if (!ad) return null;

  return (
    <Card className="glass-card overflow-hidden border-primary/30">
      {ad.creative_url && (
        <div className="aspect-[4/3] bg-muted">
          <img src={ad.creative_url} alt={ad.title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">
            <Megaphone className="mr-1 h-3 w-3" />
            Sponsored
          </Badge>
          <span className="text-xs text-muted-foreground">{ad.sponsor_name}</span>
        </div>
        <div>
          <h3 className="font-display text-base font-bold">{ad.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
        </div>
        <Button variant="hero" className="w-full" asChild>
          <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
            {ad.cta_text}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default InlineAdCard;
