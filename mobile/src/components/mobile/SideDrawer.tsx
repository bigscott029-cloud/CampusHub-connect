import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  UserCheck,
  Building2,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, onSelectOption }) => {
  const { user, profile, signOut } = useAuth();

  if (!isOpen) return null;

  const handleNav = (opt: string) => {
    onSelectOption(opt);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-4/5 max-w-xs h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10 pt-safe pb-safe"
        >
          <div>
            {/* Top Close Button & Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 truncate max-w-[140px]">
                    {profile?.full_name || profile?.display_name || user?.email?.split("@")[0]}
                  </h4>
                  <p className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {profile?.reputation_points || 120} XP
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <hr className="border-slate-800/80 mb-4" />

            {/* Navigation List */}
            <nav className="space-y-1">
              <button
                onClick={() => handleNav("academic")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  Academic Hub
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleNav("ai")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  Campus AI Bot
                </div>
                <span className="text-[10px] font-bold bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  AI 2.0
                </span>
              </button>

              <button
                onClick={() => handleNav("universities")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  Universities Directory
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleNav("notifications")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  Notifications Stream
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleNav("settings")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  Settings & Security
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleNav("admin")}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  Admin Panel
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </button>
            </nav>
          </div>

          {/* Bottom Logout Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 font-semibold text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
