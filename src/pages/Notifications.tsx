import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  Clock,
  Eye,
  Newspaper,
  Settings,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data ?? [];
    },
  });

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const selectedNotification = notifications.find((notification) => notification.id === selectedNotifId) ?? null;

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "recent":
        return notifications.filter((notification) => !notification.is_read);
      case "posts":
        return notifications.filter(
          (notification) =>
            notification.type === "comment" ||
            notification.type === "listing" ||
            notification.type === "ad",
        );
      case "important":
        return notifications.filter((notification) => notification.is_important);
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const markAsRead = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Could not update that notification.");
      return;
    }

    await notificationsQuery.refetch();
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      toast.error("Could not mark notifications as read.");
      return;
    }

    toast.success("All notifications marked as read");
    await notificationsQuery.refetch();
  };

  const handleNotificationClick = async (notificationId: string) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification) return;

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setSelectedNotifId(notification.id);
    setDetailOpen(true);
  };

  const openReference = () => {
    if (!selectedNotification) return;

    setDetailOpen(false);

    if (selectedNotification.type === "comment") {
      navigate("/feed");
      return;
    }

    if (selectedNotification.reference_type === "hostel_listing") {
      navigate("/hostel");
      return;
    }

    if (selectedNotification.reference_type === "roommate_request") {
      navigate("/hostel");
      return;
    }

    if (selectedNotification.reference_type === "marketplace_listing" || selectedNotification.type === "listing") {
      navigate("/marketplace");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="mr-1 h-4 w-4" />
            Mark all read
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all" className="gap-1">
            All
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-1">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-1">
            <Newspaper className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="important" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            Important
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="glass-card">
        <CardContent className="divide-y divide-border/50">
          {notificationsQuery.isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading notifications...</div>
          ) : notificationsQuery.isError ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">We couldn&apos;t load your notifications right now.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications in this category</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`-mx-6 flex cursor-pointer items-start gap-4 px-6 py-4 first:pt-6 last:pb-6 hover:bg-muted/30 ${!notification.is_read ? "bg-primary/5" : ""}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${!notification.is_read ? "bg-primary" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.is_important && (
                      <Badge variant="destructive" className="h-5 text-xs">
                        Important
                      </Badge>
                    )}
                    {notification.type === "ad" && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        Sponsored
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{notification.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.created_at)}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNotificationClick(notification.id);
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedNotification?.description || "No additional details available."}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedNotification ? formatRelativeTime(selectedNotification.created_at) : ""}
            </p>
            <Button variant="hero" className="w-full" onClick={openReference}>
              Open Related Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
