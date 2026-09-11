import React, { useState } from "react";
import { SnapDockBar, TabType } from "./SnapDockBar";
import { QuickActionSheet } from "./QuickActionSheet";
import { SideDrawer } from "./SideDrawer";
import { CampusAIModal } from "./CampusAIModal";
import { Menu, Sparkles, Bell, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import Screens
import { FeedScreen } from "@/screens/FeedScreen";
import { AnonymousScreen } from "@/screens/AnonymousScreen";
import { HostelScreen } from "@/screens/HostelScreen";
import { MarketplaceScreen } from "@/screens/MarketplaceScreen";
import { MessagesScreen } from "@/screens/MessagesScreen";
import { AcademicScreen } from "@/screens/AcademicScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AdminScreen } from "@/screens/AdminScreen";

export const MobileShell: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [secondaryTab, setSecondaryTab] = useState<string | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleSelectDrawerOption = (opt: string) => {
    if (opt === "ai") {
      setIsAIOpen(true);
    } else {
      setSecondaryTab(opt);
    }
  };

  const renderMainContent = () => {
    if (secondaryTab) {
      switch (secondaryTab) {
        case "academic":
          return <AcademicScreen />;
        case "notifications":
          return <NotificationsScreen />;
        case "profile":
          return <ProfileScreen />;
        case "settings":
          return <SettingsScreen />;
        case "admin":
          return <AdminScreen />;
        default:
          return <FeedScreen />;
      }
    }

    switch (activeTab) {
      case "feed":
        return <FeedScreen />;
      case "anon":
        return <AnonymousScreen />;
      case "marketplace":
        return <MarketplaceScreen />;
      case "messages":
        return <MessagesScreen />;
      default:
        return <FeedScreen />;
    }
  };

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans border-x border-slate-900 shadow-2xl">
      {/* Snapchat + Apple Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between pt-safe">
        {/* Left Side Drawer Menu Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSideDrawerOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSecondaryTab("profile");
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md"
          >
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>

        {/* Center Logo & Title */}
        <button
          onClick={() => {
            setSecondaryTab(null);
            setActiveTab("feed");
          }}
          className="flex items-center gap-1.5 font-black text-lg tracking-tight text-white"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
          CampusHub
        </button>

        {/* Right Quick Tools: AI Bot & Notifications */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAIOpen(true)}
            className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSecondaryTab("notifications")}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400" />
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 overflow-y-auto">
        {renderMainContent()}
      </main>

      {/* Snapchat Floating Bottom Dock */}
      <SnapDockBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSecondaryTab(null);
          setActiveTab(tab);
        }}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
        unreadMessagesCount={2}
      />

      {/* Quick Action Sheet */}
      <QuickActionSheet
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onPostCreated={() => {
          setSecondaryTab(null);
          setActiveTab("feed");
        }}
      />

      {/* Side Navigation Drawer */}
      <SideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        onSelectOption={handleSelectDrawerOption}
      />

      {/* Campus AI Bot Overlay */}
      <CampusAIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
};
