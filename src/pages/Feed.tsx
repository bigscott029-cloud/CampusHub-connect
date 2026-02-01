import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Newspaper,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Link2,
  TrendingUp,
  Clock,
  Flame,
  Hash,
  MapPin,
  Verified,
  Send,
  Sparkles,
} from "lucide-react";

const trendingTopics = [
  { tag: "ExamTimetable", count: "2.3K" },
  { tag: "SUGElections", count: "1.8K" },
  { tag: "LibraryHours", count: "956" },
  { tag: "FacultyWeek", count: "745" },
];

const mockPosts = [
  {
    id: 1,
    author: {
      name: "CSC Department",
      handle: "@csc_official",
      avatar: "C",
      verified: true,
    },
    type: "official",
    content: "📢 Important Notice: All CSC 401 practical sessions have been moved to the New ICT Center. Please take note and inform your colleagues. #CSC401 #Update",
    time: "2 hours ago",
    likes: 234,
    comments: 45,
    shares: 89,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    author: {
      name: "Tunde Adebayo",
      handle: "@tundeA",
      avatar: "T",
      verified: false,
    },
    type: "gist",
    content: "The new cafeteria prices are actually reasonable! Got a full meal for just ₦800. The jollof rice slaps different this semester 🍚🔥 #CampusFood #FoodReview",
    time: "4 hours ago",
    likes: 567,
    comments: 123,
    shares: 34,
    isLiked: true,
    isBookmarked: false,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    author: {
      name: "Student Affairs",
      handle: "@student_affairs",
      avatar: "S",
      verified: true,
    },
    type: "event",
    content: "🎉 Mark your calendars! The Annual Inter-Faculty Sports Competition kicks off next Monday. Registration is still open for all sports categories. Don't miss out!",
    time: "6 hours ago",
    likes: 890,
    comments: 234,
    shares: 156,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 4,
    author: {
      name: "Amaka Obi",
      handle: "@amakaO",
      avatar: "A",
      verified: false,
    },
    type: "gist",
    content: "Just finished my final year project presentation! 🎓 The panel was tough but I think it went well. Thanks to everyone who helped me prepare. On to the next chapter! 💪",
    time: "8 hours ago",
    likes: 1234,
    comments: 456,
    shares: 78,
    isLiked: true,
    isBookmarked: false,
  },
];

const Feed = () => {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl module-gists border flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Campus Gists</h1>
                <p className="text-sm text-muted-foreground">What's happening on campus</p>
              </div>
            </div>
          </div>

          {/* Create Post */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's the gist? Share campus news, events, or just your thoughts..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[80px] resize-none border-none bg-muted/50 focus-visible:ring-1"
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Link2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Hash className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="hero" size="sm" disabled={!newPost.trim()}>
                      <Send className="w-4 h-4 mr-1" />
                      Post Gist
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed Tabs */}
          <Tabs defaultValue="foryou">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="foryou" className="gap-1">
                <Sparkles className="w-4 h-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-1">
                <Flame className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-1">
                <Clock className="w-4 h-4" />
                Following
              </TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="mt-4 space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="glass-card hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.author.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">{post.author.name}</span>
                            {post.author.verified && (
                              <Verified className="w-4 h-4 text-primary fill-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{post.author.handle}</span>
                            <span>•</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={post.type === "official" ? "default" : post.type === "event" ? "secondary" : "outline"} className="text-xs capitalize">
                          {post.type}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image && (
                      <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                        <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`gap-1 ${post.isLiked ? "text-destructive" : "text-muted-foreground"}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <Share2 className="w-4 h-4" />
                          {post.shares}
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${post.isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="trending" className="mt-4">
              <Card className="glass-card p-6 text-center">
                <Flame className="w-12 h-12 mx-auto text-accent mb-4" />
                <h3 className="font-semibold mb-2">Trending Posts</h3>
                <p className="text-sm text-muted-foreground">Posts with the most engagement right now</p>
              </Card>
            </TabsContent>

            <TabsContent value="following" className="mt-4">
              <Card className="glass-card p-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Following Feed</h3>
                <p className="text-sm text-muted-foreground">Latest from people you follow</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Trending Topics */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold">Trending Topics</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    <span className="font-medium text-sm">#{topic.tag}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{topic.count} posts</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Who to Follow */}
          <Card className="glass-card">
            <CardHeader>
              <h3 className="font-display font-bold">Suggested for You</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {["CSC Department", "Student Affairs", "Library Updates"].map((account, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {account.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{account}</p>
                      <p className="text-xs text-muted-foreground">@{account.toLowerCase().replace(/\s/g, "_")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Follow</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feed;
