import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Check, Trash2, Settings } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    title: "New comment on your post",
    description: "Jane Doe commented on your gist about campus events",
    time: "5 mins ago",
    read: false,
    type: "comment",
  },
  {
    id: 2,
    title: "Your listing got a response",
    description: "Someone is interested in your laptop listing",
    time: "1 hour ago",
    read: false,
    type: "marketplace",
  },
  {
    id: 3,
    title: "New hostel listing in your area",
    description: "A new self-contain was listed near campus gate",
    time: "3 hours ago",
    read: true,
    type: "hostel",
  },
  {
    id: 4,
    title: "Study group reminder",
    description: "CSC 301 study group meeting in 30 minutes",
    time: "5 hours ago",
    read: true,
    type: "academic",
  },
];

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on campus activity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Check className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="divide-y divide-border/50">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 py-4 first:pt-6 last:pb-6 ${
                !notification.read ? "bg-primary/5 -mx-6 px-6" : ""
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notification.read ? "bg-primary" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
