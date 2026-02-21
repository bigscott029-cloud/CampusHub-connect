import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Flag,
  Ghost,
  Send,
  Shuffle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AnonymousNameModal from "@/components/anonymous/AnonymousNameModal";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AnonComment {
  id: number;
  author: string;
  content: string;
  time: string;
  likes: number;
}

const mockConfessions = [
  { id: 1, name: "Anonymous Eagle 🦅", content: "I've been struggling with anxiety about my grades but everyone thinks I have it all together. Sometimes the pressure is just too much. Just needed to say this somewhere.", likes: 89, comments: 34, time: "1 hour ago", category: "confession", mockComments: [
    { id: 11, author: "Silent Fox 🦊", content: "You're not alone. Many of us feel the same.", time: "45 min ago", likes: 5 },
    { id: 12, author: "Calm Turtle 🐢", content: "Have you tried talking to the counselor? They really help.", time: "30 min ago", likes: 3 },
  ] as AnonComment[] },
  { id: 2, name: "Silent Phoenix 🔥", content: "To the person who returned my laptop that I left in the library - THANK YOU! You restored my faith in humanity. I hope good karma finds you! 🙏", likes: 156, comments: 12, time: "3 hours ago", category: "gratitude", mockComments: [] as AnonComment[] },
  { id: 3, name: "Mystery Owl 🦉", content: "Hot take: The cafeteria food has actually improved this semester. Don't @ me. 🍔", likes: 67, comments: 45, time: "5 hours ago", category: "opinion", mockComments: [] as AnonComment[] },
];

const reportReasons = [
  "Harassment or bullying",
  "Hate speech",
  "Spam or misleading",
  "Inappropriate content",
  "Threat of violence",
  "Personal information shared",
];

const Anonymous = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [anonymousName, setAnonymousName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState(mockConfessions);

  // Report state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportCustom, setReportCustom] = useState("");

  // Thread state
  const [threadOpen, setThreadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<typeof mockConfessions[0] | null>(null);
  const [threadComments, setThreadComments] = useState<AnonComment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const checkAnonymousName = async () => {
      if (!user) return;
      const { data } = await supabase
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
      setPosts([{ id: Date.now(), name: anonymousName, content: newPost.trim(), likes: 0, comments: 0, time: "Just now", category: "confession", mockComments: [] }, ...posts]);
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
    setPosts(posts.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  };

  const openReport = (postId: number) => {
    setReportPostId(postId);
    setReportReason("");
    setReportCustom("");
    setReportDialogOpen(true);
  };

  const submitReport = () => {
    if (!reportReason && !reportCustom.trim()) {
      toast.error("Please select a reason or provide details.");
      return;
    }
    toast.success("Report submitted. An admin will review this post.");
    setReportDialogOpen(false);
  };

  const openThread = (post: typeof mockConfessions[0]) => {
    setSelectedPost(post);
    setThreadComments(post.mockComments || []);
    setThreadOpen(true);
  };

  const addThreadComment = () => {
    if (!newComment.trim() || !anonymousName) return;
    const comment: AnonComment = { id: Date.now(), author: anonymousName, content: newComment.trim(), time: "Just now", likes: 0 };
    setThreadComments([...threadComments, comment]);
    setNewComment("");
  };

  if (isLoading) {
    return (<div className="max-w-2xl mx-auto flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Loading...</div></div>);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnonymousNameModal open={showNameModal} onClose={handleNameSelected} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-anonymous border flex items-center justify-center"><Ghost className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-display font-bold">Anonymous Zone</h1>
            <p className="text-sm text-muted-foreground">Share freely, stay anonymous</p>
          </div>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-muted-foreground">Keep it respectful. Harassment and harmful content will be removed.</p>
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card className="glass-card border-2 border-dashed border-[hsl(var(--anonymous))]/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="gradient-anonymous text-white"><Shuffle className="w-3 h-3 mr-1" />Posting as: {anonymousName || "..."}</Badge>
          </div>
          <Textarea placeholder="Share your thoughts anonymously..." value={newPost} onChange={(e) => setNewPost(e.target.value)} className="min-h-[100px] resize-none border-none bg-muted/50 focus-visible:ring-1" />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">Your identity is completely hidden</p>
            <Button variant="anonymous" size="sm" disabled={!newPost.trim() || isPosting} onClick={handlePost}>
              <Send className="w-4 h-4" />{isPosting ? "Posting..." : "Post Anonymously"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="glass-card hover:border-[hsl(var(--anonymous))]/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-anonymous flex items-center justify-center"><Ghost className="w-5 h-5 text-white" /></div>
                  <div><p className="font-semibold text-sm">{post.name}</p><p className="text-xs text-muted-foreground">{post.time}</p></div>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-[hsl(var(--anonymous))]" onClick={() => handleLike(post.id)}>
                    <Heart className="w-4 h-4" />{post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => openThread(post)}>
                    <MessageCircle className="w-4 h-4" />{post.comments}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => openReport(post.id)}>
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-destructive" />Report Post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select a reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Choose a reason..." /></SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional details (optional)</Label>
              <Textarea placeholder="Provide more context..." value={reportCustom} onChange={(e) => setReportCustom(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReportDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={submitReport}>Submit Report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thread/Comments Dialog */}
      <Dialog open={threadOpen} onOpenChange={setThreadOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Anonymous Post</DialogTitle></DialogHeader>
          {selectedPost && (
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full gradient-anonymous flex items-center justify-center shrink-0"><Ghost className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-semibold text-sm">{selectedPost.name}</p>
                    <p className="text-sm leading-relaxed mt-1">{selectedPost.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedPost.time}</p>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-4">
                  <div className="flex gap-2 mb-4">
                    <Input placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addThreadComment()} className="flex-1" />
                    <Button size="sm" onClick={addThreadComment} disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-3">
                    {threadComments.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-muted">{c.author.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <div className="flex items-center gap-2"><span className="font-medium text-xs">{c.author}</span><span className="text-xs text-muted-foreground">{c.time}</span></div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    {threadComments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Anonymous;
