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
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

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
                <Badge variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  0 Reputation
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="shrink-0">
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

        {/* Activity */}
        <div className="md:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts" className="gap-1">
                <Newspaper className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="listings" className="gap-1">
                <ShoppingBag className="w-4 h-4" />
                Listings
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1">
                <Home className="w-4 h-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No posts yet</p>
                  <Button variant="hero" className="mt-4">
                    Create your first post
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="mt-4">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No listings yet</p>
                  <Button variant="hero" className="mt-4">
                    Sell something
                  </Button>
                </CardContent>
              </Card>
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
