import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Check, Trash2, Settings, Clock, Newspaper, AlertCircle, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "comment" | "marketplace" | "hostel" | "academic" | "system" | "ad";
  isImportant?: boolean;
  referenceId?: string;
  fullContent?: string;
}

const mockNotifications: Notification[] = [
  { id: 1, title: "New comment on your post", description: "Jane Doe commented on your gist about campus events", time: "5 mins ago", read: false, type: "comment", fullContent: "Jane Doe said: 'This is really helpful information! Thanks for sharing the event details. Will definitely be there.'" },
  { id: 2, title: "Your listing got a response", description: "Someone is interested in your laptop listing", time: "1 hour ago", read: false, type: "marketplace", isImportant: true, referenceId: "listing-1", fullContent: "A potential buyer is interested in your HP Pavilion Laptop listing. They've sent you a message with questions about the condition and warranty." },
  { id: 3, title: "New hostel listing in your area", description: "A new self-contain was listed near campus gate", time: "3 hours ago", read: true, type: "hostel", referenceId: "hostel-1" },
  { id: 4, title: "Study group reminder", description: "CSC 301 study group meeting in 30 minutes", time: "5 hours ago", read: true, type: "academic", isImportant: true },
  { id: 5, title: "Sponsored: New Tech Gadgets Store", description: "Check out the latest smartphones and accessories at student prices!", time: "6 hours ago", read: true, type: "ad", referenceId: "ad-123" },
  { id: 6, title: "Listing Approved", description: "Your hostel listing has been approved and is now visible", time: "1 day ago", read: true, type: "system", isImportant: true },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.type === "comment") {
      setSelectedNotif(notif);
      setDetailOpen(true);
    } else if (notif.type === "marketplace") {
      setSelectedNotif(notif);
      setDetailOpen(true);
    } else if (notif.type === "hostel" && notif.referenceId) {
      navigate("/hostel");
    } else if (notif.type === "ad") {
      setSelectedNotif(notif);
      setDetailOpen(true);
    } else {
      setSelectedNotif(notif);
      setDetailOpen(true);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case "recent": return notifications.filter(n => !n.read);
      case "posts": return notifications.filter(n => n.type === "ad" || n.type === "comment");
      case "important": return notifications.filter(n => n.isImportant);
      default: return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center"><Bell className="w-5 h-5 text-accent" /></div>
          <div><h1 className="text-2xl font-display font-bold">Notifications</h1><p className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}><Check className="w-4 h-4 mr-1" />Mark all read</Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><Settings className="w-4 h-4" /></Button>
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all" className="gap-1">All<Badge variant="secondary" className="ml-1 h-5 px-1.5">{notifications.length}</Badge></TabsTrigger>
          <TabsTrigger value="recent" className="gap-1"><Clock className="w-4 h-4" />Recent</TabsTrigger>
          <TabsTrigger value="posts" className="gap-1"><Newspaper className="w-4 h-4" />Posts</TabsTrigger>
          <TabsTrigger value="important" className="gap-1"><AlertCircle className="w-4 h-4" />Important</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="glass-card">
        <CardContent className="divide-y divide-border/50">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center"><Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No notifications in this category</p></div>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className={`flex items-start gap-4 py-4 first:pt-6 last:pb-6 cursor-pointer hover:bg-muted/30 -mx-6 px-6 ${!notification.read ? "bg-primary/5" : ""}`} onClick={() => handleNotificationClick(notification)}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notification.read ? "bg-primary" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {notification.isImportant && <Badge variant="destructive" className="text-xs h-5">Important</Badge>}
                    {notification.type === "ad" && <Badge variant="secondary" className="text-xs h-5">Sponsored</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                    {notification.referenceId && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification); }}><Eye className="w-3 h-3 mr-1" />View</Button>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedNotif?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedNotif?.fullContent || selectedNotif?.description}</p>
            <p className="text-xs text-muted-foreground">{selectedNotif?.time}</p>
            {selectedNotif?.type === "marketplace" && <Button variant="hero" className="w-full" onClick={() => { setDetailOpen(false); navigate("/marketplace"); }}>View Listing</Button>}
            {selectedNotif?.type === "comment" && <Button variant="hero" className="w-full" onClick={() => { setDetailOpen(false); navigate("/feed"); }}>View Post</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
