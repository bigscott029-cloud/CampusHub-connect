import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Edit,
  Star,
  Newspaper,
  ShoppingBag,
  Home,
  TrendingUp,
  Award,
  Trash2,
} from "lucide-react";

const mockPosts = [
  { id: 1, content: "Just finished my project presentation! 🎓", likes: 45, time: "2 days ago" },
  { id: 2, content: "The new cafeteria menu is actually good!", likes: 23, time: "1 week ago" },
];

const mockListings = [
  { id: 1, title: "HP Laptop - Core i5", price: "₦280,000", status: "active" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  // Mock reputation data
  const reputationPoints = 245;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="glass-card overflow-hidden">
        <div className="h-32 gradient-hero-bg" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-display font-bold">{displayName}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  <Building className="w-3 h-3 mr-1" />
                  Demo University
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => navigate("/reputation")}
                >
                  <Star className="w-3 h-3 mr-1 text-warning" />
                  {reputationPoints} XP
                  <TrendingUp className="w-3 h-3 ml-1 text-success" />
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="shrink-0" onClick={() => navigate("/profile/edit")}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Display Name</p>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">University</p>
                <p className="text-sm font-medium">Demo University</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-muted-foreground">Not set</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reputation Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary-foreground">{reputationPoints}</span>
              </div>
              <p className="text-sm text-muted-foreground">Experience Points</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Tier</span>
                <Badge>Regular</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posts</span>
                <span className="font-medium">{mockPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Likes</span>
                <span className="font-medium">{mockPosts.reduce((a, p) => a + p.likes, 0)}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate("/reputation")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>

        {/* Activity */}
        <div className="md:col-span-1">
          {/* Empty for layout balance */}
        </div>

        {/* Tabs for Posts/Listings */}
        <div className="md:col-span-3">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts" className="gap-1">
                <Newspaper className="w-4 h-4" />
                Posts ({mockPosts.length})
              </TabsTrigger>
              <TabsTrigger value="listings" className="gap-1">
                <ShoppingBag className="w-4 h-4" />
                Listings ({mockListings.length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1">
                <Home className="w-4 h-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {mockPosts.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/feed")}>
                      Create your first post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockPosts.map((post) => (
                  <Card key={post.id} className="glass-card">
                    <CardContent className="pt-6">
                      <p className="text-sm">{post.content}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {post.likes} likes
                          </span>
                          <span>{post.time}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="listings" className="mt-4 space-y-4">
              {mockListings.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No listings yet</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/marketplace")}>
                      Sell something
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockListings.map((listing) => (
                  <Card key={listing.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{listing.title}</h3>
                          <p className="text-sm text-primary font-medium">{listing.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{listing.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Home className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No saved items yet</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
