import React from "react";
import { Bell, Heart, MessageCircle, Sparkles, Award } from "lucide-react";

export const NotificationsScreen: React.FC = () => {
  const notifications = [
    { id: "1", title: "New Gist Reaction", body: "Someone liked your post on #ExamsPrep", time: "5m ago", icon: Heart, color: "text-rose-400" },
    { id: "2", title: "Reputation Bonus", body: "You earned +15 XP points for community activity!", time: "1h ago", icon: Award, color: "text-yellow-400" },
    { id: "3", title: "New Hostel Listing", body: "A new hostel near Campus Gate matching your criteria was posted.", time: "3h ago", icon: Sparkles, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-full pb-24 text-slate-100 p-4 space-y-4">
      <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <Bell className="w-5 h-5 text-yellow-400" />
        <h2 className="font-bold text-sm text-slate-100">Activity Notifications</h2>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl bg-slate-800 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-100">{item.title}</h4>
                <span className="text-[10px] text-slate-500">{item.time}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
