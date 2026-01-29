import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Send,
  TrendingUp,
  Clock,
  Building,
} from "lucide-react";

const mockPosts = [
  {
    id: 1,
    author: "Jane Doe",
    avatar: "",
    department: "Computer Science",
    content: "Just finished my final project presentation! 🎉 The AI-powered campus navigation app got amazing feedback from the panel. Hard work pays off!",
    likes: 45,
    comments: 12,
    time: "2 hours ago",
    type: "gist",
  },
  {
    id: 2,
    author: "Campus News",
    avatar: "",
    department: "Official",
    content: "📢 IMPORTANT: The library will be open 24/7 during exam week starting Monday. Study rooms can be booked through the student portal.",
    likes: 128,
    comments: 23,
    time: "4 hours ago",
    type: "news",
    pinned: true,
  },
  {
    id: 3,
    author: "Mike Johnson",
    avatar: "",
    department: "Engineering",
    content: "Anyone else struggling with the thermodynamics assignment? Let's form a study group! DM me if interested. ☕📚",
    likes: 32,
    comments: 18,
    time: "5 hours ago",
    type: "gist",
  },
];

const Feed = () => {
  const [newPost, setNewPost] = useState("");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Campus Gists</h1>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="w-3 h-3" />
          24 new today
        </Badge>
      </div>

      {/* Create Post */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening on campus?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none border-none bg-muted/50 focus-visible:ring-1"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="hero" size="sm" disabled={!newPost.trim()}>
                  <Send className="w-4 h-4" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Tabs */}
      <Tabs defaultValue="trending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="latest" className="gap-1">
            <Clock className="w-4 h-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="department" className="gap-1">
            <Building className="w-4 h-4" />
            Department
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-4 space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="glass-card">
              {post.pinned && (
                <div className="px-4 pt-3">
                  <Badge variant="secondary" className="text-xs">📌 Pinned</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.department} • {post.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="latest" className="mt-4">
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Latest posts will appear here</p>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="mt-4">
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Department posts will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feed;
