/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Ad {
  id: string;
  title: string;
  description: string;
  creative_url?: string | null;
  cta_text: string;
  cta_url: string;
  sponsor_name: string;
  placement_type: "global" | "targeted" | "geo";
  target_scope?: "general" | "region" | "institution" | null;
  placement_slots?: string[] | null;
  target_user_types?: string[] | null;
  tier_price: number;
  reward_points: number;
  predicted_score: number;
  priority?: number | null;
  max_impressions_per_user?: number | null;
  cooldown_hours?: number | null;
  target_university_id?: string | null;
  target_departments?: string[] | null;
  geo_region?: string | null;
}

const AdPopup = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["ad-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("university_id, department, home_region, user_type")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
  });

  const adsQuery = useQuery({
    queryKey: ["active-ads"],
    queryFn: async (): Promise<Ad[]> => {
      const { data, error } = await (supabase as any)
        .from("ads")
        .select("id, title, description, creative_url, cta_text, cta_url, sponsor_name, placement_type, target_scope, placement_slots, target_user_types, tier_price, reward_points, predicted_score, priority, max_impressions_per_user, cooldown_hours, target_university_id, target_departments, geo_region")
        .eq("status", "active")
        .eq("payment_status", "paid")
        .lte("starts_at", new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`);

      if (error) throw error;
      return data ?? [];
    },
  });

  const currentAd = useMemo(() => {
    const profile = profileQuery.data;
    const ads = adsQuery.data ?? [];
    if (!ads.length) return null;

    const viewerKey = user?.id || "guest";
    const now = Date.now();
    const eligibleAds = ads.filter((ad) => {
      if (ad.placement_slots?.length && !ad.placement_slots.includes("popup")) return false;
      if (ad.target_user_types?.length && !ad.target_user_types.includes(profile?.user_type ?? "")) return false;

      const frequencyKey = `campushub_ad_frequency:${viewerKey}:${ad.id}`;
      const raw = localStorage.getItem(frequencyKey);
      let frequency: { shownCount?: number; lastShownAt?: number } = {};
      try {
        frequency = raw ? JSON.parse(raw) : {};
      } catch {
        localStorage.removeItem(frequencyKey);
      }
      const maxImpressions = ad.max_impressions_per_user ?? 6;
      const cooldownMs = (ad.cooldown_hours ?? 24) * 60 * 60 * 1000;

      if ((frequency.shownCount ?? 0) >= maxImpressions) return false;
      if (frequency.lastShownAt && now - frequency.lastShownAt < cooldownMs) return false;
      return true;
    });

    const scoredAds = eligibleAds.map((ad) => {
      const universityMatch = ad.target_university_id && ad.target_university_id === profile?.university_id ? 40 : 0;
      const departmentMatch = ad.target_departments?.includes(profile?.department ?? "") ? 25 : 0;
      const globalBoost = ad.placement_type === "global" ? 12 : 0;
      const geoBoost = ad.placement_type === "geo" && ad.geo_region && ad.geo_region === profile?.home_region ? 35 : 0;
      const priceBoost = Math.min(Number(ad.tier_price ?? 0) / 100, 30);
      const predictiveBoost = Math.min(Number(ad.predicted_score ?? 0), 25);
      const priorityBoost = Number(ad.priority ?? 0) * 2;

      return {
        ad,
        score: universityMatch + departmentMatch + globalBoost + geoBoost + priceBoost + predictiveBoost + priorityBoost + Math.random() * 6,
      };
    });

    return scoredAds.sort((a, b) => b.score - a.score)[0]?.ad ?? null;
  }, [adsQuery.data, profileQuery.data]);

  useEffect(() => {
    if (hasBeenShown || !currentAd) return;

    const timer = setTimeout(async () => {
      setIsVisible(true);
      setHasBeenShown(true);
      const viewerKey = user?.id || "guest";
      const frequencyKey = `campushub_ad_frequency:${viewerKey}:${currentAd.id}`;
      const raw = localStorage.getItem(frequencyKey);
      let frequency: { shownCount?: number } = {};
      try {
        frequency = raw ? JSON.parse(raw) : {};
      } catch {
        localStorage.removeItem(frequencyKey);
      }
      localStorage.setItem(frequencyKey, JSON.stringify({
        shownCount: (frequency.shownCount ?? 0) + 1,
        lastShownAt: Date.now(),
      }));

      await (supabase as any).from("ad_events").insert({
        ad_id: currentAd.id,
        user_id: user?.id ?? null,
        event_type: "impression",
      });
    }, 20000);

    return () => clearTimeout(timer);
  }, [currentAd, hasBeenShown, user?.id]);

  const handleClose = async () => {
    setIsVisible(false);
    if (currentAd) {
      await (supabase as any).from("ad_events").insert({
        ad_id: currentAd.id,
        user_id: user?.id ?? null,
        event_type: "dismissed",
      });
    }
  };

  const handleClick = async () => {
    if (currentAd) {
      await (supabase as any).from("ad_events").insert({
        ad_id: currentAd.id,
        user_id: user?.id ?? null,
        event_type: "click",
        points_awarded: currentAd.reward_points,
      });
    }
  };

  if (!currentAd) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: 100 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 100, x: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="glass-card overflow-hidden border-2 border-primary/20 shadow-lg">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs"><Sparkles className="mr-1 h-3 w-3" />Sponsored</Badge>
                <span className="text-xs capitalize text-muted-foreground">{currentAd.placement_type}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}><X className="h-4 w-4" /></Button>
            </div>

            {currentAd.creative_url && (
              <div className="aspect-video bg-muted">
                <img src={currentAd.creative_url} alt={currentAd.title} className="h-full w-full object-cover" />
              </div>
            )}

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-display font-bold leading-tight">{currentAd.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{currentAd.description}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground">{currentAd.sponsor_name}</span>
                  {currentAd.reward_points > 0 && <span> • +{currentAd.reward_points} points</span>}
                </p>
                <Button variant="hero" className="w-full" asChild>
                  <a href={currentAd.cta_url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                    {currentAd.cta_text}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdPopup;
