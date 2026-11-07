import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import CampusAIButton from "@/components/ai/CampusAIButton";
import { Menu, ShieldAlert, Sparkles, X } from "lucide-react";
import AdaptiveBottomNav from "@/components/dashboard/AdaptiveBottomNav";
import MoreHubDrawer from "@/components/dashboard/MoreHubDrawer";
import AdPlacementModal from "@/components/ads/AdPlacementModal";
import { useAuth } from "@/hooks/useAuth";

const DashboardLayout = () => {
  const { user, isEmailVerified, gracePeriodDaysRemaining } = useAuth();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [hideBanner, setHideBanner] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Header */}
          <header className="md:hidden h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger>
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <img src="/CampusHub-logo.png" alt="CampusHub" className="h-8 w-auto max-w-[135px] object-contain" />
            </div>

            <button
              type="button"
              onClick={() => setAdModalOpen(true)}
              className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Place Ad
            </button>
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

          {/* Main Page Area with pb-24 on mobile for Bottom Nav dock */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-auto">
            <Outlet />
          </div>

          <CampusAIButton />

          {/* Adaptive Mobile 5-Item Bottom Navigation */}
          <AdaptiveBottomNav onOpenMore={() => setMoreDrawerOpen(true)} />

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
