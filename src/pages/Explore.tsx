import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Film,
  Compass,
  Flame,
  Users,
  X,
  ChevronUp,
  ChevronDown,
  Megaphone,
  ExternalLink,
  Plus,
  Wrench,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesNearMe } from "@/components/marketplace/ServicesNearMe";
import { supabase } from "@/integrations/supabase/client";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";

interface ReelItem {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  authorName: string;
  authorHandle: string;
  universityName: string;
  likesCount: number;
  commentsCount: number;
  isSponsored?: boolean;
  sponsorName?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const SAMPLE_CAMPUS_REELS: ReelItem[] = [
  {
    id: "reel-1",
    title: "UNILAG Lagoon Front Sunset Hangout 🌅",
    caption: "Late evening breeze by the lagoon after 4 hours of lectures. Campus life hits different here! #UNILAG #CampusVibes",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    authorName: "Tunde Alabi",
    authorHandle: "@tunde_unilag",
    universityName: "University of Lagos",
    likesCount: 1420,
    commentsCount: 184,
  },
  {
    id: "reel-2",
    title: "FUTA Tech Hackathon Recap 🚀",
    caption: "Built a drone delivery prototype in 48 hours with the team! Tech in Akure is moving fast. #FUTAHacks #TechCampus",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    authorName: "Chidinma Okafor",
    authorHandle: "@chidi_dev",
    universityName: "Federal University of Technology, Akure",
    likesCount: 980,
    commentsCount: 96,
  },
  {
    id: "reel-ad-1",
    title: "50% Off Campus Student Village Self-Con Hostels",
    caption: "Sponsored: Clean water, 24/7 security, zero agent commission for first 20 students. Inspect today! #CampusHostels",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    authorName: "Prime Living Hostels",
    authorHandle: "@prime_hostels",
    universityName: "All Campuses",
    likesCount: 650,
    commentsCount: 42,
    isSponsored: true,
    sponsorName: "Prime Living Hostels Ltd",
    ctaText: "WhatsApp Agent",
    ctaUrl: "https://wa.me/2348051454564?text=Hello%20Prime%20Hostels,%20I%20saw%20your%20CampusHub%20reel",
  },
  {
    id: "reel-3",
    title: "OAU Amphitheatre Night Performance 🎭",
    caption: "The crowd energy tonight was unmatched. If you know you know! #OAU #GreatIfe #CampusCulture",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    authorName: "Great Ife Creatives",
    authorHandle: "@oau_theatre",
    universityName: "Obafemi Awolowo University",
    likesCount: 2130,
    commentsCount: 310,
  },
];

const Explore = () => {
  const [activeTab, setActiveTab] = useState("reels");
  const [fullscreenReelIndex, setFullscreenReelIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch real trending posts from Supabase
  const trendingGistsQuery = useQuery({
    queryKey: ["explore-trending-gists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, created_at, university_id, universities(name)")
        .order("likes_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch verified active video ads to blend into reels
  const videoAdsQuery = useQuery({
    queryKey: ["explore-video-ads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, title, description, creative_url, sponsor_name, cta_text, cta_url")
        .eq("status", "active")
        .contains("placement_slots", ["reels"])
        .limit(4);

      return data ?? [];
    },
  });

  // Combine curated student reels + live active video ads
  const combinedReels: ReelItem[] = [
    ...SAMPLE_CAMPUS_REELS,
    ...(videoAdsQuery.data ?? []).map((ad): ReelItem => ({
      id: `live-ad-${ad.id}`,
      title: ad.title,
      caption: `Sponsored: ${ad.description}`,
      videoUrl: ad.creative_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      posterUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      authorName: ad.sponsor_name,
      authorHandle: `@${ad.sponsor_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      universityName: "Campus Sponsor",
      likesCount: 150,
      commentsCount: 12,
      isSponsored: true,
      sponsorName: ad.sponsor_name,
      ctaText: ad.cta_text || "Contact Advertiser",
      ctaUrl: ad.cta_url || "https://wa.me/2348051454564",
    })),
  ];

  const currentReel = fullscreenReelIndex !== null ? combinedReels[fullscreenReelIndex] : null;

  useEffect(() => {
    if (videoRef.current && fullscreenReelIndex !== null) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [fullscreenReelIndex]);

  const handleNextReel = () => {
    if (fullscreenReelIndex !== null && fullscreenReelIndex < combinedReels.length - 1) {
      setFullscreenReelIndex(fullscreenReelIndex + 1);
    }
  };

  const handlePrevReel = () => {
    if (fullscreenReelIndex !== null && fullscreenReelIndex > 0) {
      setFullscreenReelIndex(fullscreenReelIndex - 1);
    }
  };

  const toggleLike = (reelId: string) => {
    setLikedReels((prev) =>
      prev.includes(reelId) ? prev.filter((id) => id !== reelId) : [...prev, reelId]
    );
  };

  const handleShare = (reel: ReelItem) => {
    const text = `Watch "${reel.title}" on CampusHub Connect! https://campushub.ng/explore`;
    if (navigator.share) {
      navigator.share({ title: reel.title, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold md:text-3xl flex items-center gap-2">
              <Compass className="w-7 h-7 text-primary" />
              Campus <span className="gradient-text">Explore</span>
            </h1>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Nationwide Pulse
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover viral campus reels, inter-university gists, and student ambassadors across Nigeria.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="reels" className="text-xs gap-1.5">
              <Play className="w-3.5 h-3.5 text-blue-500" />
              Reels Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Top Gists
            </TabsTrigger>
            <TabsTrigger value="creators" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Ambassadors
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-teal-500" />
              Services Near Me
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* TAB 1: CAMPUS REELS FEED */}
      {activeTab === "reels" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold">Continuous Video Reels</span>
            </div>
            <span className="text-xs text-muted-foreground">Tap any video to expand continuous player</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {combinedReels.map((reel, idx) => (
              <Card
                key={reel.id}
                onClick={() => setFullscreenReelIndex(idx)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/70 hover:border-primary/50 transition-all shadow-md bg-black"
              >
                {/* Poster / Thumbnail image */}
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-900">
                  <img
                    src={reel.posterUrl}
                    alt={reel.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Play badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {reel.isSponsored ? (
                      <Badge className="bg-amber-500 text-black font-bold text-[10px] gap-1">
                        <Megaphone className="w-3 h-3" /> Sponsored Ad
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[10px] text-white">
                        {reel.universityName.split(" ")[0]}
                      </Badge>
                    )}

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span>{formatCompactNumber(reel.likesCount)}</span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1.5 text-white">
                    <p className="font-display font-semibold text-xs line-clamp-2 leading-tight">
                      {reel.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span>{reel.authorHandle}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NATIONWIDE TRENDING GISTS */}
      {activeTab === "trending" && (
        <div className="grid gap-4 md:grid-cols-2">
          {(trendingGistsQuery.data ?? []).map((post, i) => (
            <Card key={post.id} className="glass-card hover-lift">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {(post.universities as any)?.name || "All Campuses"}
                    </span>
                  </div>
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>

                <p className="text-sm leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    {post.likes_count || 0} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                    {post.comments_count || 0} comments
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: CAMPUS AMBASSADORS */}
      {activeTab === "creators" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "Olamide Davies", campus: "UNILAG (Faculty of Law)", role: "Campus Ambassador", followers: "3.4k students", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
            { name: "Chinedu Eze", campus: "FUTA (Software Engineering)", role: "Course Rep Lead", followers: "2.1k students", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
            { name: "Amina Bello", campus: "ABU Zaria (Mass Comm)", role: "Campus Creator", followers: "4.8k students", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
          ].map((c) => (
            <Card key={c.name} className="glass-card text-center p-5">
              <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary/30">
                <AvatarImage src={c.img} />
                <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-display font-semibold text-sm">{c.name}</h3>
              <p className="text-xs text-primary font-medium">{c.campus}</p>
              <Badge variant="outline" className="mt-2 text-[10px]">
                {c.role} &bull; {c.followers}
              </Badge>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="w-full text-xs h-8">
                  Connect on Campus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: SERVICES NEAR ME */}
      {activeTab === "services" && (
        <ServicesNearMe />
      )}

      {/* ================= FULLSCREEN TIKTOK / X STYLE CONTINUOUS REEL MODAL ================= */}
      {currentReel && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none">
          {/* Top navigation controls */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <School className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium">{currentReel.universityName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setFullscreenReelIndex(null)}
                className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-colors"
                title="Exit Reel Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vertical Video Element */}
          <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={currentReel.videoUrl}
              poster={currentReel.posterUrl}
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) videoRef.current.play();
                  else videoRef.current.pause();
                }
              }}
            />

            {/* Gradient bottom shadow for caption legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none" />

            {/* UP/DOWN CONTINUOUS SWIPE NAVIGATION BUTTONS */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePrevReel}
                disabled={fullscreenReelIndex === 0}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white disabled:opacity-30 hover:bg-black/80 transition-colors border border-white/10"
                title="Previous Reel"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextReel}
                disabled={fullscreenReelIndex === combinedReels.length - 1}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white disabled:opacity-30 hover:bg-black/80 transition-colors border border-white/10"
                title="Next Reel"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* RIGHT INTERACTION DOCK */}
            <div className="absolute right-4 bottom-24 z-40 flex flex-col items-center gap-5 text-white">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => toggleLike(currentReel.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                    likedReels.includes(currentReel.id)
                      ? "bg-red-500 text-white"
                      : "bg-black/40 text-white border border-white/15 hover:bg-black/60"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedReels.includes(currentReel.id) ? "fill-white" : ""
                    }`}
                  />
                </div>
                <span className="text-[11px] font-medium font-mono">
                  {formatCompactNumber(
                    currentReel.likesCount + (likedReels.includes(currentReel.id) ? 1 : 0)
                  )}
                </span>
              </button>

              {/* Comments Button */}
              <button
                type="button"
                onClick={() => toast.info("Opening comments discussion...")}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium font-mono">
                  {formatCompactNumber(currentReel.commentsCount)}
                </span>
              </button>

              {/* Share to WhatsApp Button */}
              <button
                type="button"
                onClick={() => handleShare(currentReel)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">Share</span>
              </button>
            </div>

            {/* BOTTOM CAPTION & SPONSORED CTA DOCK */}
            <div className="absolute bottom-6 left-4 right-20 z-40 space-y-2 text-white">
              {currentReel.isSponsored && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-black font-bold text-[10px]">
                    <Megaphone className="w-3 h-3 mr-1" /> Sponsored Reel
                  </Badge>
                  {currentReel.ctaUrl && (
                    <a
                      href={currentReel.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 underline hover:text-amber-300"
                    >
                      {currentReel.ctaText || "Learn More"} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm">{currentReel.authorName}</span>
                <span className="text-xs text-slate-300">{currentReel.authorHandle}</span>
              </div>

              <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                {currentReel.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
