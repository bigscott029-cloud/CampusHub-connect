import { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import CampusAIButton from "@/components/ai/CampusAIButton";
import { Menu, ShieldAlert, Megaphone, X, Bell } from "lucide-react";
import AdaptiveBottomNav from "@/components/dashboard/AdaptiveBottomNav";
import MoreHubDrawer from "@/components/dashboard/MoreHubDrawer";
import LeftProfileDrawer from "@/components/dashboard/LeftProfileDrawer";
import NotificationOverlay from "@/components/dashboard/NotificationOverlay";
import AdPlacementModal from "@/components/ads/AdPlacementModal";
import { useAuth } from "@/hooks/useAuth";
import useInactivityLogout from "@/hooks/useInactivityLogout";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout = () => {
  const { user, isEmailVerified, gracePeriodDaysRemaining } = useAuth();
  useInactivityLogout();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [hideBanner, setHideBanner] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const lastScrollY = useRef(0);
  const touchStartX = useRef<number | null>(null);

  // Unread notifications count
  const notifCountQuery = useQuery({
    queryKey: ["header-unread-notifs", user?.id],
    enabled: Boolean(user),
    refetchInterval: 25000,
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      return count ?? 0;
    },
  });

  const unreadNotifs = notifCountQuery.data ?? 0;

  // TikTok / X hide-on-scroll-down, reveal-on-scroll-up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 70) {
        if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 12) {
          setHeaderVisible(false); // scrolling down
        } else if (lastScrollY.current - currentScrollY > 12) {
          setHeaderVisible(true); // scrolling up
        }
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // X-Style Left Edge Swipe Detection
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // If user starts touch within 35px of left screen edge
      if (e.touches[0].clientX < 35) {
        touchStartX.current = e.touches[0].clientX;
      } else {
        touchStartX.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current !== null) {
        const deltaX = e.touches[0].clientX - touchStartX.current;
        if (deltaX > 45) {
          setLeftDrawerOpen(true);
          touchStartX.current = null;
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Mobile Top Header (X-Style: Logo Center, Place Ad Left, Bell Right) */}
          <header
            className={`md:hidden h-14 border-b border-border/50 flex items-center justify-between px-3.5 bg-background/90 backdrop-blur-xl sticky top-0 z-40 transition-transform duration-300 ${
              headerVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            {/* Left: Place Ad & Profile Drawer Trigger */}
            <div className="flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => setLeftDrawerOpen(true)}
                className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground rounded-lg active:scale-95 transition-all"
                title="Profile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setAdModalOpen(true)}
                className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-amber-500/20 active:scale-95 transition-all"
              >
                <Megaphone className="w-3 h-3" /> Place Ad
              </button>
            </div>

            {/* Center: CampusHUB Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
              <img
                src="/CampusHub-logo.png"
                alt="CampusHub"
                className="h-7 w-auto max-w-[125px] object-contain drop-shadow-sm"
              />
            </div>

            {/* Right: Notification Bell Button */}
            <div className="flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 active:scale-95 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                )}
              </button>
            </div>
          </header>

          {/* Soft Onboarding Grace Period Warning Banner */}
          {!isEmailVerified && !hideBanner && (
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>7-Day Grace Period:</strong> You have{" "}
                  <span className="font-bold underline">{gracePeriodDaysRemaining} days</span> to verify your email. Need instant help?{" "}
                  <a
                    href="https://wa.me/2348051454564?text=Hello%20CampusHub%20Support,%20please%20help%20me%20verify%20my%20account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    WhatsApp 08051454564
                  </a>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHideBanner(true)}
                className="p-1 rounded-md hover:bg-amber-500/20 text-muted-foreground hover:text-foreground shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Page Area with pb-28 on mobile for safe-area & bottom dock */}
          <div className="flex-1 w-full max-w-full px-2 sm:px-4 md:p-6 lg:p-8 pb-28 md:pb-8 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </div>

          <CampusAIButton />

          {/* Adaptive Mobile 5-Item Bottom Navigation */}
          <AdaptiveBottomNav onOpenMore={() => setMoreDrawerOpen(true)} />

          {/* X-Style Left Swipe Drawer */}
          <LeftProfileDrawer
            open={leftDrawerOpen}
            onOpenChange={setLeftDrawerOpen}
            onOpenAI={() => {
              // Trigger AI Assistant modal
              const btn = document.querySelector('button[title*="AI"]') as HTMLButtonElement | null;
              btn?.click();
            }}
          />

          {/* Notification Overlay Sheet */}
          <NotificationOverlay
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          />

          {/* Animated More Hub Spring Action Drawer */}
          <MoreHubDrawer
            open={moreDrawerOpen}
            onOpenChange={setMoreDrawerOpen}
            onOpenAdModal={() => setAdModalOpen(true)}
          />

          {/* Ad Placement & Sponsorship Modal */}
          <AdPlacementModal open={adModalOpen} onOpenChange={setAdModalOpen} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
