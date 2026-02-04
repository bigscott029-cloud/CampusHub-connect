import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const reputationTiers = [
  { name: "Newcomer", minPoints: 0, icon: Star, color: "text-muted-foreground" },
  { name: "Regular", minPoints: 100, icon: Zap, color: "text-primary" },
  { name: "Active", minPoints: 500, icon: TrendingUp, color: "text-accent" },
  { name: "Popular", minPoints: 1000, icon: Award, color: "text-warning" },
  { name: "Influencer", minPoints: 5000, icon: Crown, color: "text-destructive" },
];

const pointsBreakdown = [
  { action: "Daily login", points: 5, description: "Log in to the platform daily" },
  { action: "Time spent (per hour)", points: 10, description: "Active time on the platform" },
  { action: "Create a post", points: 15, description: "Share a gist or update" },
  { action: "Receive a like", points: 2, description: "When someone likes your content" },
  { action: "Receive a comment", points: 5, description: "When someone comments on your post" },
  { action: "Comment on a post", points: 3, description: "Engage with others' content" },
  { action: "Share a post", points: 5, description: "Share content to your network" },
  { action: "Complete profile", points: 50, description: "Fill out all profile fields" },
  { action: "Verified listing", points: 100, description: "Get a listing verified by admin" },
];

const ReputationInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock user points
  const userPoints = 245;
  const currentTier = reputationTiers.reduce((acc, tier) => 
    userPoints >= tier.minPoints ? tier : acc
  , reputationTiers[0]);
  const nextTier = reputationTiers.find(tier => tier.minPoints > userPoints);
  const progressToNext = nextTier 
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Reputation System</h1>
            <p className="text-sm text-muted-foreground">How your reputation is calculated</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <Card className="glass-card overflow-hidden">
        <div className="h-24 gradient-hero-bg" />
        <CardContent className="relative pt-0">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-full bg-background border-4 border-background flex items-center justify-center">
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
          <CardTitle className="text-lg">Reputation Tiers</CardTitle>
          <CardDescription>Unlock benefits as you level up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reputationTiers.map((tier, i) => (
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
                  <p className="text-xs text-muted-foreground">{tier.minPoints}+ XP</p>
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
            How to Earn XP
          </CardTitle>
          <CardDescription>Ways to increase your reputation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

      {/* Benefits */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-warning" />
            Benefits of High Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Increased Visibility</p>
                <p className="text-xs text-muted-foreground">Your posts appear higher in feeds and trend more easily</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Award className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Verified Badge</p>
                <p className="text-xs text-muted-foreground">High reputation users get a verified badge on their profile</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Priority Support</p>
                <p className="text-xs text-muted-foreground">Faster response times from admin and support</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Early Access</p>
                <p className="text-xs text-muted-foreground">Be the first to try new features on the platform</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReputationInfo;
