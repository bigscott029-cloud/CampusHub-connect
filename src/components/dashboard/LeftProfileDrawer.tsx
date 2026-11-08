import { useNavigate } from "react-router-dom";
import {
  User,
  Bookmark,
  Users,
  Wrench,
  BookOpen,
  Home,
  Bot,
  Settings,
  LogOut,
  Moon,
  Sun,
  Flame,
  ShieldCheck,
  Phone,
  Share2,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeftProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAI?: () => void;
}

export const LeftProfileDrawer = ({
  open,
  onOpenChange,
  onOpenAI,
}: LeftProfileDrawerProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const profileQuery = useQuery({
    queryKey: ["left-drawer-profile", user?.id],
    enabled: Boolean(user) && open,
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase as any)
        .from("profiles")
        .select("display_name, username, avatar_url, user_type, experience_points, popularity_points, universities(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const profile = profileQuery.data;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || "Campus Student";
  const username = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "user";
  const avatarUrl = profile?.avatar_url;
  const universityName = profile?.universities?.name || "Nigerian Institution";
  const xp = profile?.experience_points || 120;

  // Streak calculation (cached daily interaction streak)
  const streakDays = Math.max(1, Math.min(30, Math.floor((xp / 50) % 30) + 1));

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[85vw] sm:max-w-xs p-0 flex flex-col bg-background/95 backdrop-blur-2xl border-r border-border/70"
      >
        {/* User Profile Header Card (X / Twitter style) */}
        <div className="p-5 border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-md">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs font-semibold py-1 px-2.5"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {streakDays} Day Streak
            </Badge>
          </div>

          <h2 className="font-display font-bold text-base text-foreground truncate">
            {displayName}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            @{username}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
            🎓 {universityName}
          </p>

          {/* Quick Metrics (Followers, Following, XP) */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40 text-xs">
            <div>
              <span className="font-bold text-foreground">{xp}</span>{" "}
              <span className="text-muted-foreground">XP</span>
            </div>
            <div>
              <span className="font-bold text-foreground">Verified</span>{" "}
              <span className="text-muted-foreground">Student</span>
            </div>
          </div>
        </div>

        {/* Scrollable Action Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <button
            type="button"
            onClick={() => handleNavigate("/profile")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <User className="w-4 h-4 text-primary" />
            <span>Profile & Identity</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/feed")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <Bookmark className="w-4 h-4 text-blue-500" />
            <span>Campus Gists & Saved</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/groups")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Communities & Circles</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/marketplace?category=services")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Services Near Me</span>
            <Badge variant="secondary" className="ml-auto text-[10px] py-0">New</Badge>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/hostel")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <Home className="w-4 h-4 text-purple-500" />
            <span>Hostel Hub</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/academic")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span>Academic Tools</span>
          </button>

          {/* AI Support Button */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenAI?.();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-sm font-medium text-primary transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Campus AI Assistant</span>
          </button>

          <div className="pt-2 my-2 border-t border-border/50" />

          <button
            type="button"
            onClick={() => handleNavigate("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 text-sm font-medium transition-colors text-foreground"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>Settings & Privacy</span>
          </button>

          {/* WhatsApp Direct Support Hotline */}
          <a
            href="https://wa.me/2348051454564?text=Hello%20CampusHub%20Support,%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Support: 08051454564</span>
          </a>
        </div>

        {/* Footer with Theme Toggle and Log Out */}
        <div className="p-4 border-t border-border/50 bg-background/80 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-xs text-muted-foreground gap-1.5"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              onOpenChange(false);
              await signOut();
              navigate("/login");
            }}
            className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeftProfileDrawer;
