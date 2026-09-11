import React from "react";
import { Newspaper, Ghost, Plus, ShoppingBag, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

export type TabType = "feed" | "anon" | "marketplace" | "messages";

interface SnapDockBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickCreate: () => void;
  unreadMessagesCount?: number;
}

export const SnapDockBar: React.FC<SnapDockBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickCreate,
  unreadMessagesCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pointer-events-none mb-2">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-dock rounded-full px-3 py-2 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-2xl">
          
          {/* Feed Tab (X / Campus Gists) */}
          <button
            onClick={() => setActiveTab("feed")}
            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
          >
            {activeTab === "feed" && (
              <motion.div
                layoutId="activeDockGlow"
                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Newspaper
              className={`w-6 h-6 transition-transform duration-200 ${
                activeTab === "feed" ? "text-yellow-400 scale-110" : "text-slate-400 hover:text-slate-200"
              }`}
            />
            <span className="text-[9px] font-medium mt-0.5 text-slate-400">Gists</span>
          </button>

          {/* Anonymous Tab (Snapchat Ghost feel) */}
          <button
            onClick={() => setActiveTab("anon")}
            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
          >
            {activeTab === "anon" && (
              <motion.div
                layoutId="activeDockGlow"
                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Ghost
              className={`w-6 h-6 transition-transform duration-200 ${
                activeTab === "anon" ? "text-yellow-400 scale-110" : "text-slate-400 hover:text-slate-200"
              }`}
            />
            <span className="text-[9px] font-medium mt-0.5 text-slate-400">Anon</span>
          </button>

          {/* (+) Central Action Launcher (Snapchat style glowing yellow action trigger) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onOpenQuickCreate}
            className="relative -top-2 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 text-slate-950 font-bold shadow-glow border-2 border-slate-950 shadow-yellow-400/50"
          >
            <Plus className="w-8 h-8 stroke-[2.5]" />
          </motion.button>

          {/* Marketplace & Hostel Tab */}
          <button
            onClick={() => setActiveTab("marketplace")}
            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
          >
            {activeTab === "marketplace" && (
              <motion.div
                layoutId="activeDockGlow"
                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <ShoppingBag
              className={`w-6 h-6 transition-transform duration-200 ${
                activeTab === "marketplace" ? "text-yellow-400 scale-110" : "text-slate-400 hover:text-slate-200"
              }`}
            />
            <span className="text-[9px] font-medium mt-0.5 text-slate-400">Market</span>
          </button>

          {/* Messages Tab (WhatsApp / Telegram style with unread badge) */}
          <button
            onClick={() => setActiveTab("messages")}
            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
          >
            {activeTab === "messages" && (
              <motion.div
                layoutId="activeDockGlow"
                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative">
              <MessageSquareText
                className={`w-6 h-6 transition-transform duration-200 ${
                  activeTab === "messages" ? "text-yellow-400 scale-110" : "text-slate-400 hover:text-slate-200"
                }`}
              />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium mt-0.5 text-slate-400">Chats</span>
          </button>

        </div>
      </div>
    </div>
  );
};
