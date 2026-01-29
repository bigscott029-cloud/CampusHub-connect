import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Ghost,
  Home,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Users,
  Bell,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { title: "Campus Gists", description: "Latest news & updates", icon: Newspaper, url: "/feed", color: "module-gists" },
  { title: "Anonymous Zone", description: "Share anonymously", icon: Ghost, url: "/anonymous", color: "module-anonymous" },
  { title: "Hostel Hub", description: "Find accommodation", icon: Home, url: "/hostel", color: "module-hostel" },
  { title: "Marketplace", description: "Buy & sell items", icon: ShoppingBag, url: "/marketplace", color: "module-marketplace" },
  { title: "Messages", description: "Chat with peers", icon: MessageCircle, url: "/messages", color: "module-gists" },
  { title: "Academic", description: "Study resources", icon: BookOpen, url: "/academic", color: "module-academic" },
];

const recentActivity = [
  { title: "New gist posted in your department", time: "2 mins ago", type: "gist" },
  { title: "Someone replied to your anonymous post", time: "15 mins ago", type: "anonymous" },
  { title: "New hostel listing in your area", time: "1 hour ago", type: "hostel" },
  { title: "Price drop on a saved item", time: "3 hours ago", type: "marketplace" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Welcome back, <span className="gradient-text">{displayName}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on your campus today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            Demo University
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">New Gists Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.url}>
              <Card className="glass-card hover-lift cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className={`w-12 h-12 rounded-xl ${link.color} border flex items-center justify-center mx-auto mb-3`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm">{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
            <CardDescription>What's been happening on campus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Trending on Campus</CardTitle>
            <CardDescription>Popular topics right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["#ExamSchedule", "#HostelLife", "#StudyGroup", "#MarketplaceSale", "#CampusEvent"].map((tag, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{tag}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.floor(Math.random() * 50 + 10)} posts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
