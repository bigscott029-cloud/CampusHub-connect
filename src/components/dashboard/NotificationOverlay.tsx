import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  School,
  X,
  Megaphone,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationOverlay = ({
  open,
  onOpenChange,
}: NotificationOverlayProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications-overlay", user?.id],
    enabled: Boolean(user) && open,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data ?? [];
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-overlay"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      queryClient.invalidateQueries({ queryKey: ["notifications-overlay"] });
    }

    onOpenChange(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate("/notifications");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-2xl border-l border-border/70"
      >
        <SheetHeader className="px-5 py-4 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <SheetTitle className="text-base font-display font-bold">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs text-muted-foreground hover:text-primary h-8 px-2"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </SheetHeader>

        {/* Pinned Persistent Campus Alert */}
        <div className="p-4 bg-primary/5 border-b border-primary/20">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Campus Notice</span>
                <span className="text-[10px] text-muted-foreground">Today</span>
              </div>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Inter-University Activity Cup rankings are active! Post gists and interact to boost your campus score.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2.5">
            {notificationsQuery.isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When other campus peers interact with your gists or message you, updates appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? "border-border/40 bg-card/40 hover:bg-muted/40"
                      : "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${notif.is_read ? "font-medium" : "font-semibold text-foreground"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>
                  {notif.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notif.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Bottom Footer Action */}
        <div className="p-3 border-t border-border/50 bg-background/80">
          <Button
            variant="outline"
            className="w-full text-xs font-medium"
            onClick={() => {
              onOpenChange(false);
              navigate("/notifications");
            }}
          >
            Open Full Notifications Hub
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationOverlay;
