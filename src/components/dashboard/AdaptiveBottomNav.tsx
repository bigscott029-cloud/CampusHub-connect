import { useLocation, NavLink } from "react-router-dom";
import {
  Newspaper,
  MessageCircle,
  ShoppingBag,
  BookOpen,
  Menu,
  LayoutDashboard,
  PlusCircle,
  Compass,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AdaptiveBottomNavProps {
  onOpenMore: () => void;
}

interface NavItemConfig {
  title: string;
  url: string;
  icon: typeof Newspaper;
  isAction?: boolean;
}

export const AdaptiveBottomNav = ({ onOpenMore }: AdaptiveBottomNavProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const rawRole = user?.user_metadata?.user_type || "student";

  const userCategory =
    rawRole === "agent_trader" || rawRole === "trader" || rawRole === "agent"
      ? "trader_agent"
      : rawRole === "community" || rawRole === "regular"
      ? "community"
      : "student";

  // Unread messages count badge
  const unreadMessagesQuery = useQuery({
    queryKey: ["bottom-nav-unread", user?.id],
    enabled: Boolean(user),
    refetchInterval: 15000,
    queryFn: async () => {
      if (!user) return 0;
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      const ids = (conversations ?? []).map((c) => c.id);
      if (!ids.length) return 0;

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      return count ?? 0;
    },
  });

  const unreadCount = unreadMessagesQuery.data ?? 0;

  // 4 dynamic items per persona + 5th item is always "More ☰"
  let personaNavItems: NavItemConfig[] = [];

  if (userCategory === "trader_agent") {
    personaNavItems = [
      { title: "Business", url: "/dashboard", icon: LayoutDashboard },
      { title: "Post Good", url: "/hostel/create", icon: PlusCircle },
      { title: "Inquiries", url: "/messages", icon: MessageCircle },
      { title: "Market", url: "/marketplace", icon: ShoppingBag },
    ];
  } else if (userCategory === "community") {
    personaNavItems = [
      { title: "Feed", url: "/feed", icon: Newspaper },
      { title: "Explore", url: "/explore", icon: Compass },
      { title: "Market", url: "/marketplace", icon: ShoppingBag },
      { title: "Chats", url: "/messages", icon: MessageCircle },
    ];
  } else {
    // Default Student Hub
    personaNavItems = [
      { title: "Gists", url: "/feed", icon: Newspaper },
      { title: "Chats", url: "/messages", icon: MessageCircle },
      { title: "Market", url: "/marketplace", icon: ShoppingBag },
      { title: "Academic", url: "/academic", icon: BookOpen },
    ];
  }

  const isCurrentActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(url);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/70 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {personaNavItems.map((item) => {
          const active = isCurrentActive(item.url);
          const Icon = item.icon;
          const isMessages = item.url === "/messages";

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 text-center transition-all ${
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    active ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[56px]">
                {item.title}
              </span>

              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}

        {/* 5th slot: The "More Hub" Hamburger Drawer Button */}
        <button
          type="button"
          onClick={onOpenMore}
          className="relative flex flex-col items-center justify-center h-full w-full py-1 text-center text-muted-foreground hover:text-foreground transition-all"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[56px]">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};

export default AdaptiveBottomNav;
