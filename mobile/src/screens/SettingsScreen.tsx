import React from "react";
import { Settings, Shield, Bell, Moon, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const SettingsScreen: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-full pb-24 text-slate-100 p-4 space-y-6">
      <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <Settings className="w-5 h-5 text-yellow-400" />
        <h2 className="font-bold text-sm text-slate-100">Settings & Security</h2>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-200">Push Notifications</span>
          </div>
          <input type="checkbox" defaultChecked className="accent-yellow-400 w-4 h-4" />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-200">Dark Mode</span>
          </div>
          <input type="checkbox" defaultChecked className="accent-yellow-400 w-4 h-4" />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-200">Anonymous Mode Privacy</span>
          </div>
          <input type="checkbox" defaultChecked className="accent-yellow-400 w-4 h-4" />
        </div>
      </div>

      <button
        onClick={() => {
          signOut();
          toast.info("Signed out of CampusHub");
        }}
        className="w-full py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out of App
      </button>
    </div>
  );
};
