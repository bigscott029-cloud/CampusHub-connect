import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Flag,
  Ghost,
  Send,
  Shuffle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AnonymousNameModal from "@/components/anonymous/AnonymousNameModal";
import { toast } from "sonner";

const mockConfessions = [
  {
    id: 1,
    name: "Anonymous Eagle 🦅",
    content: "I've been struggling with anxiety about my grades but everyone thinks I have it all together. Sometimes the pressure is just too much. Just needed to say this somewhere.",
    likes: 89,
    comments: 34,
    time: "1 hour ago",
    category: "confession",
  },
  {
    id: 2,
    name: "Silent Phoenix 🔥",
    content: "To the person who returned my laptop that I left in the library - THANK YOU! You restored my faith in humanity. I hope good karma finds you! 🙏",
    likes: 156,
    comments: 12,
    time: "3 hours ago",
    category: "gratitude",
  },
  {
    id: 3,
    name: "Mystery Owl 🦉",
    content: "Hot take: The cafeteria food has actually improved this semester. Don't @ me. 🍔",
    likes: 67,
    comments: 45,
    time: "5 hours ago",
    category: "opinion",
  },
];

const Anonymous = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [anonymousName, setAnonymousName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState(mockConfessions);

  useEffect(() => {
    const checkAnonymousName = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("anonymous_names")
        .select("anonymous_name")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setAnonymousName(data.anonymous_name);
      } else {
        setShowNameModal(true);
      }
      setIsLoading(false);
    };

    checkAnonymousName();
  }, [user]);

  const handleNameSelected = (name: string) => {
    setAnonymousName(name);
    setShowNameModal(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user || !anonymousName) return;

    setIsPosting(true);
    try {
      const { error } = await supabase.from("anonymous_posts").insert({
        user_id: user.id,
        anonymous_name: anonymousName,
        content: newPost.trim(),
        category: "confession",
      });

      if (error) throw error;

      // Add to local state
      setPosts([
        {
          id: Date.now(),
          name: anonymousName,
          content: newPost.trim(),
          likes: 0,
          comments: 0,
          time: "Just now",
          category: "confession",
        },
        ...posts,
      ]);

      toast.success("Posted anonymously!");
      setNewPost("");
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnonymousNameModal 
        open={showNameModal} 
        onClose={handleNameSelected} 
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-anonymous border flex items-center justify-center">
            <Ghost className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Anonymous Zone</h1>
            <p className="text-sm text-muted-foreground">Share freely, stay anonymous</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-muted-foreground">
            Keep it respectful. Harassment and harmful content will be removed. 
            <Button variant="link" className="px-1 h-auto text-sm">Community guidelines</Button>
          </p>
        </CardContent>
      </Card>

      {/* Create Anonymous Post */}
      <Card className="glass-card border-2 border-dashed border-[hsl(var(--anonymous))]/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="gradient-anonymous text-white">
              <Shuffle className="w-3 h-3 mr-1" />
              Posting as: {anonymousName || "..."}
            </Badge>
          </div>
          <Textarea
            placeholder="Share your thoughts anonymously... confessions, questions, advice requests welcome."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] resize-none border-none bg-muted/50 focus-visible:ring-1"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Your identity is completely hidden
            </p>
            <Button 
              variant="anonymous" 
              size="sm" 
              disabled={!newPost.trim() || isPosting}
              onClick={handlePost}
            >
              <Send className="w-4 h-4" />
              {isPosting ? "Posting..." : "Post Anonymously"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="glass-card hover:border-[hsl(var(--anonymous))]/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-anonymous flex items-center justify-center">
                    <Ghost className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.name}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {post.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 text-muted-foreground hover:text-[hsl(var(--anonymous))]"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Anonymous;
