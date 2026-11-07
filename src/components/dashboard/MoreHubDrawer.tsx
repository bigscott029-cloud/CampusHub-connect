import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ghost,
  Home,
  Users,
  Compass,
  Trophy,
  Megaphone,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface MoreHubDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAdModal?: () => void;
}

export const MoreHubDrawer = ({
  open,
  onOpenChange,
  onOpenAdModal,
}: MoreHubDrawerProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const userType = user?.user_metadata?.user_type || "student";
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl p-0 overflow-hidden flex flex-col"
      >
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-1" />

        <SheetHeader className="px-6 py-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <SheetTitle className="text-base font-display font-semibold flex items-center gap-1.5">
                {displayName}
                {user?.user_metadata?.verified_badge && (
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                )}
              </SheetTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {user?.email}
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="capitalize text-xs">
            {userType.replace(/_/g, " ")}
          </Badge>
        </SheetHeader>

        {/* Content Modules Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Quick Ad Placement & Support Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenAdModal?.();
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-left hover:border-amber-500/60 transition-colors"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Promote Ad</p>
                <p className="text-[10px] text-muted-foreground">Boost products & leads</p>
              </div>
            </button>

            <a
              href="https://wa.me/2348051454564?text=Hello%20CampusHub%20Support,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left hover:border-emerald-500/60 transition-colors"
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">WhatsApp Help</p>
                <p className="text-[10px] text-muted-foreground">08051454564</p>
              </div>
            </a>
          </div>

          {/* Secondary Campus Tools */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Campus Utilities &amp; Discovery
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleNavigate("/explore")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Explore Reels</p>
                  <p className="text-[10px] text-muted-foreground">Nationwide video feed</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/anonymous")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                  <Ghost className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Anonymous Zone</p>
                  <p className="text-[10px] text-muted-foreground">Secret confessions</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/hostel")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Hostel Hub</p>
                  <p className="text-[10px] text-muted-foreground">Rooms &amp; apartments</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/hostel/roommate")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Roommate Match</p>
                  <p className="text-[10px] text-muted-foreground">Find student partners</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/groups")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Campus Groups</p>
                  <p className="text-[10px] text-muted-foreground">Clubs &amp; circles</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/reputation")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Rivalry Leaderboard</p>
                  <p className="text-[10px] text-muted-foreground">Campus XP Cup</p>
                </div>
              </button>
            </div>
          </div>

          {/* Account & System Preferences */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">Theme Mode</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 gap-2 text-xs"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Dark Mode
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("/settings")}
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-3.5 h-3.5" /> Settings &amp; Support
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  signOut();
                }}
                className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreHubDrawer;
