import { useState } from "react";
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

const anonymousNames = [
  "Anonymous Eagle 🦅",
  "Silent Phoenix 🔥",
  "Mystery Owl 🦉",
  "Hidden Tiger 🐯",
  "Secret Panda 🐼",
];

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
  const [newPost, setNewPost] = useState("");
  const [anonName] = useState(anonymousNames[Math.floor(Math.random() * anonymousNames.length)]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
              Posting as: {anonName}
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
            <Button variant="anonymous" size="sm" disabled={!newPost.trim()}>
              <Send className="w-4 h-4" />
              Post Anonymously
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Posts */}
      <div className="space-y-4">
        {mockConfessions.map((post) => (
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
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-[hsl(var(--anonymous))]">
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
