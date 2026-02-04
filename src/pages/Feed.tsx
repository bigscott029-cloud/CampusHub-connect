import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Flame,
  Verified,
  Sparkles,
  UserPlus,
  UserCheck,
} from "lucide-react";
import PostComposer from "@/components/feed/PostComposer";

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
      id: "csc_dept",
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
      id: "tunde",
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
      id: "student_affairs",
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
      id: "amaka",
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

const suggestedAccounts = [
  { id: "csc_dept", name: "CSC Department", handle: "@csc_official" },
  { id: "student_affairs", name: "Student Affairs", handle: "@student_affairs" },
  { id: "library", name: "Library Updates", handle: "@library_updates" },
];

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(mockPosts);
  const [following, setFollowing] = useState<string[]>([]);

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

  const handleFollow = (accountId: string) => {
    setFollowing(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/trending/${hashtag}`);
  };

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        const tag = part.substring(1);
        return (
          <span
            key={i}
            className="text-primary cursor-pointer hover:underline"
            onClick={() => handleHashtagClick(tag)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
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
                <Flame className="w-5 h-5" />
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
              <PostComposer />
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {renderContentWithHashtags(post.content)}
                    </p>
                    
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
                <p className="text-sm text-muted-foreground">
                  {following.length > 0 
                    ? `Following ${following.length} accounts`
                    : "Follow some accounts to see their posts here"
                  }
                </p>
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
                <button
                  key={i}
                  onClick={() => handleHashtagClick(topic.tag)}
                  className="w-full flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    <span className="font-medium text-sm text-primary hover:underline">#{topic.tag}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{topic.count} posts</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Who to Follow */}
          <Card className="glass-card">
            <CardHeader>
              <h3 className="font-display font-bold">Suggested for You</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {account.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.handle}</p>
                    </div>
                  </div>
                  <Button 
                    variant={following.includes(account.id) ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => handleFollow(account.id)}
                  >
                    {following.includes(account.id) ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
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
