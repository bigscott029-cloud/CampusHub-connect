import React from "react";
import { Shield, Users, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export const AdminScreen: React.FC = () => {
  return (
    <div className="min-h-full pb-24 text-slate-100 p-4 space-y-6">
      <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 p-4 rounded-3xl text-rose-300">
        <Shield className="w-6 h-6 shrink-0 text-rose-400" />
        <div>
          <h2 className="font-bold text-sm">Campus Moderation Control</h2>
          <p className="text-[11px] text-rose-300/80">Admin Panel & System Security</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs block">Active Users</span>
          <span className="text-xl font-black text-yellow-400">1,248</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs block">Pending Reports</span>
          <span className="text-xl font-black text-rose-400">0</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="font-bold text-xs text-slate-200">Moderation Logs</h3>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          System operating clean - No spam detected
        </div>
      </div>
    </div>
  );
};
