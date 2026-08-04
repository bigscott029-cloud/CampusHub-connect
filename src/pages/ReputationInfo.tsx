import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Clock,
  MessageCircle,
  Newspaper,
  Heart,
  TrendingUp,
  Zap,
  Award,
  Crown,
  DollarSign,
  Share2,
  Users,
  Wallet,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openFlutterwavePayment } from "@/lib/payments";

const reputationTiers = [
  { name: "Newcomer", minPoints: 0, icon: Star, color: "text-muted-foreground" },
  { name: "Regular", minPoints: 100, icon: Zap, color: "text-primary" },
  { name: "Active", minPoints: 500, icon: TrendingUp, color: "text-accent" },
  { name: "Popular", minPoints: 1000, icon: Award, color: "text-warning" },
  { name: "Influencer", minPoints: 5000, icon: Crown, color: "text-destructive" },
];

const referralNairaReward = parseInt(import.meta.env.VITE_REFERRAL_REWARD_NAIRA || "500", 10);
const referralXpReward = parseInt(import.meta.env.VITE_REFERRAL_REWARD_XP || "100", 10);
const postCreationXp = parseInt(import.meta.env.VITE_POST_CREATION_XP || "15", 10);
const likeReceiveXp = parseInt(import.meta.env.VITE_LIKE_RECEIVE_XP || "5", 10);

const pointsBreakdown = [
  { action: "Daily login", points: 5, description: "Log in to the platform daily" },
  { action: "Time spent (per hour)", points: 10, description: "Active time on the platform" },
  { action: "Create a post / gist", points: postCreationXp, description: "Share a gist or update" },
  { action: "Receive a like", points: likeReceiveXp, description: "When someone likes your content" },
  { action: "Receive a comment", points: 5, description: "When someone comments on your post" },
  { action: "Comment on a post", points: 3, description: "Engage with others' content" },
  { action: "Refer a new student", points: referralXpReward, description: `Earn ₦${referralNairaReward} + ${referralXpReward} XP per referral` },
  { action: "Complete profile", points: 50, description: "Fill out all profile fields" },
  { action: "Verified listing", points: 100, description: "Get a listing verified by admin" },
];

const ReputationInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copiedReferral, setCopiedReferral] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["reputation-profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("experience_points, reputation_score, referral_code, user_type")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const referralCountQuery = useQuery({
    queryKey: ["referral-count", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", user!.id);

      if (error) return 0;
      return count ?? 0;
    },
  });

  const userPoints = profileQuery.data?.experience_points ?? profileQuery.data?.reputation_score ?? 0;
  const referralCount = referralCountQuery.data ?? 0;
  const referralEarnings = referralCount * referralNairaReward;
  const isMonetizationEligible = userPoints >= 500 || referralCount >= 5;

  const currentTier = reputationTiers.reduce((acc, tier) => 
    userPoints >= tier.minPoints ? tier : acc
  , reputationTiers[0]);
  
  const nextTier = reputationTiers.find(tier => tier.minPoints > userPoints);
  const progressToNext = nextTier 
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const referralLink = `${window.location.origin}/signup?ref=${profileQuery.data?.referral_code || user?.id?.slice(0, 8) || "join"}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleCashoutRequest = () => {
    if (referralEarnings < 1000) {
      toast.error("Minimum payout threshold is ₦1,000. Refer more campus peers to cash out!");
      return;
    }
    
    openFlutterwavePayment({
      purpose: "ad_campaign_sponsorship",
      customerEmail: user?.email,
      customerName: user?.user_metadata?.display_name || "Creator",
    });

    toast.success(`Payout request of ₦${referralEarnings.toLocaleString()} submitted for admin processing!`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Reputation & Creator Monetization</h1>
            <p className="text-sm text-muted-foreground">Grow your campus audience and earn revenue</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="monetization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="monetization" className="gap-1.5 font-semibold">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Creator Monetization (X-Style)
          </TabsTrigger>
          <TabsTrigger value="reputation" className="gap-1.5 font-semibold">
            <Star className="w-4 h-4 text-amber-500" />
            Reputation Tiers & XP
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CREATOR MONETIZATION (X / TWITTER STYLE EARNINGS) */}
        <TabsContent value="monetization" className="space-y-6">
          {/* Creator Overview Card */}
          <Card className="glass-card border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge className="mb-2 bg-emerald-600 text-white">
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Campus Creator Program
                  </Badge>
                  <CardTitle className="text-xl font-display">Earn Revenue from Traffic & Engagement</CardTitle>
                  <CardDescription>
                    Drive conversations, get likes on your gists, and invite students to earn direct cash payouts.
                  </CardDescription>
                </div>
                <Badge variant={isMonetizationEligible ? "default" : "outline"} className={isMonetizationEligible ? "bg-emerald-600 text-white text-xs py-1 px-3" : "text-xs"}>
                  {isMonetizationEligible ? "Monetization Unlocked" : "Progressing to Unlocked"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="p-3.5 rounded-xl bg-card border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Referral Earnings</p>
                  <p className="text-2xl font-bold text-emerald-500">₦{referralEarnings.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">₦{referralNairaReward} per active invite</p>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Invited Members</p>
                  <p className="text-2xl font-bold text-primary">{referralCount}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Active users brought</p>
                </div>

                <div className="col-span-2 md:col-span-1 p-3.5 rounded-xl bg-card border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Revenue Share Status</p>
                  <p className="text-lg font-bold text-amber-500">
                    {isMonetizationEligible ? "Ad Pool Active" : "Need 500 XP"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">From trending post views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Network Link Builder */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Your Personal Referral Link
              </CardTitle>
              <CardDescription>
                Share this link on WhatsApp, Instagram, or X. Earn ₦500 + 100 XP for every student who registers!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={referralLink} readOnly className="font-mono text-xs bg-muted/50" />
                <Button onClick={copyReferralLink} variant="hero" className="shrink-0">
                  {copiedReferral ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" /> Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-sm font-semibold">Available Cashout Balance</p>
                  <p className="text-xs text-muted-foreground">Processed directly to your bank account via Flutterwave</p>
                </div>
                <Button onClick={handleCashoutRequest} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Wallet className="w-4 h-4 mr-1.5" /> Request Cashout (₦{referralEarnings.toLocaleString()})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: REPUTATION TIERS & XP */}
        <TabsContent value="reputation" className="space-y-6">
          {/* Current Status */}
          <Card className="glass-card overflow-hidden">
            <div className="h-24 gradient-hero-bg" />
            <CardContent className="relative pt-0">
              <div className="flex items-end gap-4 -mt-10">
                <div className="w-20 h-20 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
                  <currentTier.icon className={`w-8 h-8 ${currentTier.color}`} />
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-display font-bold">{currentTier.name}</h2>
                    <Badge variant="secondary">{userPoints} XP</Badge>
                  </div>
                  {nextTier && (
                    <p className="text-sm text-muted-foreground">
                      {nextTier.minPoints - userPoints} XP to {nextTier.name}
                    </p>
                  )}
                </div>
              </div>
              {nextTier && (
                <div className="mt-4">
                  <Progress value={progressToNext} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tier Levels */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Reputation Tiers & Perks</CardTitle>
              <CardDescription>Unlock creator benefits as you level up on campus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reputationTiers.map((tier) => (
                <div 
                  key={tier.name} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    userPoints >= tier.minPoints ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tier.icon className={`w-5 h-5 ${userPoints >= tier.minPoints ? tier.color : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">{tier.minPoints}+ XP required</p>
                    </div>
                  </div>
                  {userPoints >= tier.minPoints && (
                    <Badge className="bg-success text-success-foreground">Unlocked</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How to Earn */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                How to Earn Reputation XP
              </CardTitle>
              <CardDescription>Ways to increase your reputation score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant="outline" className="text-primary">
                      +{item.points} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReputationInfo;
