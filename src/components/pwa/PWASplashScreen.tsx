import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  School,
  Store,
  Users,
  ArrowRight,
  LogIn,
  UserPlus,
  Compass,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  type AudiencePersona,
  getSavedAudience,
  setSavedAudience,
  hasSeenSessionSplash,
  markSessionSplashSeen,
} from "@/lib/pwa";

interface PersonaConfig {
  id: AudiencePersona;
  badgeLabel: string;
  badgeColor: string;
  icon: typeof School;
  headline: string;
  subheadline: string;
  bgGradient: string;
  bgImage: string;
  accentColor: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

const PERSONA_CONFIGS: Record<AudiencePersona, PersonaConfig> = {
  student: {
    id: "student",
    badgeLabel: "Target Audience: Student Hub",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: School,
    headline: "Everything for Your Campus Life",
    subheadline: "Real-time campus gists, roommate matchers, exam alerts, and student gear trading.",
    bgGradient: "from-blue-950/80 via-slate-950/90 to-black",
    // Unsplash curated warm campus student life photography
    bgImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    accentColor: "from-blue-500 to-indigo-500",
    primaryActionLabel: "Enter Student Feed",
    secondaryActionLabel: "Find Roommates",
  },
  trader_agent: {
    id: "trader_agent",
    badgeLabel: "Enterprise & Vendor Hub",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Store,
    headline: "Commercial Campus Command Center",
    subheadline: "Post hostel units, list marketplace inventory, sponsor ads, and close buyer inquiries.",
    bgGradient: "from-amber-950/80 via-zinc-950/90 to-black",
    // Unsplash modern commerce/office setting
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    accentColor: "from-amber-500 to-orange-500",
    primaryActionLabel: "Open Vendor Console",
    secondaryActionLabel: "Manage Listings",
  },
  community: {
    id: "community",
    badgeLabel: "Community & Resident Zone",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Users,
    headline: "Your Campus Neighborhood in Real-Time",
    subheadline: "Connect with fellow peers, join university clubs, follow state trends, and share laughs.",
    bgGradient: "from-emerald-950/80 via-slate-950/90 to-black",
    // Friends together laughing happily with smartphones
    bgImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80",
    accentColor: "from-emerald-500 to-teal-500",
    primaryActionLabel: "Join Discussions",
    secondaryActionLabel: "Explore Groups",
  },
  explorer: {
    id: "explorer",
    badgeLabel: "CampusHub Nationwide",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Compass,
    headline: "Your Campus, Connected Together",
    subheadline: "The modern operating system for Nigerian universities, polytechnics, and colleges.",
    bgGradient: "from-purple-950/80 via-slate-950/90 to-black",
    bgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    accentColor: "from-purple-500 to-pink-500",
    primaryActionLabel: "Explore Campuses",
    secondaryActionLabel: "Create Account",
  },
};

interface PWASplashScreenProps {
  onDismiss?: () => void;
  forceShow?: boolean;
}

export const PWASplashScreen = ({ onDismiss, forceShow = false }: PWASplashScreenProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"intro" | "persona">("intro");
  const [selectedPersona, setSelectedPersona] = useState<AudiencePersona>("student");
  const [isOpen, setIsOpen] = useState(() => {
    if (forceShow) return true;
    return !hasSeenSessionSplash();
  });

  useEffect(() => {
    let personaToUse: AudiencePersona = getSavedAudience();
    if (user?.user_metadata?.user_type) {
      const ut = user.user_metadata.user_type;
      if (ut === "agent_trader" || ut === "trader" || ut === "agent") {
        personaToUse = "trader_agent";
      } else if (ut === "community" || ut === "regular") {
        personaToUse = "community";
      } else {
        personaToUse = "student";
      }
      setSavedAudience(personaToUse);
    }
    setSelectedPersona(personaToUse);

    // 1.3s introductory signature logo animation then smoothly crossfade to persona card
    const timer = setTimeout(() => {
      setPhase("persona");
    }, 1300);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSelectPersona = (p: AudiencePersona) => {
    setSelectedPersona(p);
    setSavedAudience(p);
  };

  const handleEnter = (destination?: string) => {
    markSessionSplashSeen();
    setIsOpen(false);
    onDismiss?.();
    if (destination) {
      navigate(destination);
    } else if (user) {
      navigate("/dashboard");
    } else {
      navigate("/feed");
    }
  };

  const config = PERSONA_CONFIGS[selectedPersona] || PERSONA_CONFIGS.student;
  const PersonaIcon = config.icon;

  if (!isOpen && !forceShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white font-sans select-none">
      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          // ================= PHASE 1: 1.2S SIGNATURE INTRO LOGO ANIMATION =================
          <motion.div
            key="intro-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative mb-6">
              {/* Glowing animated halo */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.35, 0.7, 0.35],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-4 rounded-full bg-blue-600/30 blur-2xl"
              />

              <motion.img
                src="/CampusHub-logo.png"
                alt="CampusHub"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative h-20 w-auto object-contain drop-shadow-[0_10px_25px_rgba(37,99,235,0.5)]"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                Campus<span className="text-blue-500">HUB</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-widest uppercase">
                Your Campus, Connected
              </p>
            </motion.div>

            {/* Micro loading progress pill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 140 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="mt-6 h-1 rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500"
            />
          </motion.div>
        ) : (
          // ================= PHASE 2: ADAPTIVE PERSONA BACKGROUND (Vatar/Lagos Life Style) =================
          <motion.div
            key="persona-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Dynamic Background Image with subtle Ken Burns zoom */}
            <motion.div
              key={config.bgImage}
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.38 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${config.bgImage})` }}
            />

            {/* Gradient Overlays for optimal readability & mood */}
            <div className={`absolute inset-0 bg-gradient-to-t ${config.bgGradient} opacity-95 pointer-events-none`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-black pointer-events-none" />

            {/* TOP HEADER: Logo & Close/Skip button */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/CampusHub-logo.png"
                  alt="CampusHub"
                  className="h-8 w-auto object-contain"
                />
                <Badge variant="outline" className={`text-[11px] border ${config.badgeColor}`}>
                  <PersonaIcon className="w-3 h-3 mr-1" />
                  {config.badgeLabel}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEnter()}
                className="text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-8 px-3 gap-1"
              >
                Skip <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* CENTER CONTENT: Dynamic Value Hook & Headline */}
            <div className="relative z-10 max-w-xl mx-auto text-center space-y-4 my-auto py-6">
              <motion.div
                key={`text-${selectedPersona}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Personalized Campus Mode</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-tight">
                  {config.headline}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                  {config.subheadline}
                </p>
              </motion.div>

              {/* Persona Switcher Pills */}
              <div className="pt-3">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                  Select Your Primary Campus Role
                </p>
                <div className="inline-flex p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 gap-1">
                  {(["student", "trader_agent", "community"] as AudiencePersona[]).map((role) => {
                    const isSelected = selectedPersona === role;
                    const rConfig = PERSONA_CONFIGS[role];
                    const RIcon = rConfig.icon;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectPersona(role)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-white text-black shadow-md font-semibold"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <RIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{role === "trader_agent" ? "Trader" : role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIONS: Sign in, Sign up, or Jump into Dashboard */}
            <div className="relative z-10 max-w-md w-full mx-auto space-y-3">
              {user ? (
                // Returning Authenticated User
                <div className="space-y-2">
                  <Button
                    onClick={() => handleEnter("/dashboard")}
                    size="lg"
                    className={`w-full bg-gradient-to-r ${config.accentColor} text-white font-semibold shadow-lg hover:opacity-95 text-sm h-12 rounded-xl`}
                  >
                    <span>{config.primaryActionLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEnter("/feed")}
                    className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs h-10 rounded-xl"
                  >
                    Open Campus Gists
                  </Button>
                </div>
              ) : (
                // Guest / First time visitor
                <div className="space-y-2">
                  <Button
                    onClick={() => handleEnter("/signup")}
                    size="lg"
                    className={`w-full bg-gradient-to-r ${config.accentColor} text-white font-semibold shadow-lg hover:opacity-95 text-sm h-12 rounded-xl`}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Campus Community
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEnter("/login")}
                      className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs h-10 rounded-xl"
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1.5" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEnter("/feed")}
                      className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs h-10 rounded-xl"
                    >
                      Browse First
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-center text-slate-500 pt-1">
                CampusHub Connect &bull; Optimized for Mobile &amp; PWA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PWASplashScreen;
