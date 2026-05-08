/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Flag,
  Ghost,
  Heart,
  MessageCircle,
  Send,
  Shuffle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";
import { formatRelativeTime } from "@/lib/utils";
import AnonymousNameModal from "@/components/anonymous/AnonymousNameModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnonComment {
  id: string;
  author: string;
  content: string;
  time: string;
  likes: number;
}

interface AnonymousPost {
  id: string;
  name: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  category: string;
  mockComments: AnonComment[];
}

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
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [anonymousName, setAnonymousName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [currentUniversityId, setCurrentUniversityId] = useState<string | null>(null);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportCustom, setReportCustom] = useState("");

  const [threadOpen, setThreadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<AnonymousPost | null>(null);
  const [newComment, setNewComment] = useState("");

  const loadPosts = async (universityId: string | null) => {
    let query = supabase
      .from("anonymous_posts")
      .select("id, anonymous_name, content, likes_count, comments_count, category, created_at")
      .order("created_at", { ascending: false });

    if (universityId) {
      query = query.eq("university_id", universityId);
    }

    const { data, error } = await query;

    if (error) throw error;

    setPosts(
      (data ?? []).map((post) => ({
        id: post.id,
        name: post.anonymous_name,
        content: post.content,
        likes: post.likes_count ?? 0,
        comments: post.comments_count ?? 0,
        time: formatRelativeTime(post.created_at),
        category: post.category || "confession",
        mockComments: [],
      })),
    );
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) return;

      try {
        const [{ data: anonymousIdentity }, { profile }] = await Promise.all([
          supabase
            .from("anonymous_names")
            .select("anonymous_name")
            .eq("user_id", user.id)
            .single(),
          getProfileWithUniversity(user.id),
        ]);

        if (anonymousIdentity) {
          setAnonymousName(anonymousIdentity.anonymous_name);
        } else {
          setShowNameModal(true);
        }

        const universityId = profile?.university_id ?? null;
        setCurrentUniversityId(universityId);
        await loadPosts(universityId);
      } catch (error) {
        console.error("Error loading anonymous feed:", error);
        toast.error("Failed to load anonymous posts.");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("anonymous-zone")
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["anonymous-posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_comments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["anonymous-comments"] });
        queryClient.invalidateQueries({ queryKey: ["anonymous-posts"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const commentsQuery = useQuery({
    queryKey: ["anonymous-comments", selectedPost?.id],
    enabled: Boolean(selectedPost?.id && threadOpen),
    queryFn: async (): Promise<AnonComment[]> => {
      const { data, error } = await (supabase as any)
        .from("anonymous_comments")
        .select("id, anonymous_name, content, likes_count, created_at")
        .eq("post_id", selectedPost?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((comment: any) => ({
        id: comment.id,
        author: comment.anonymous_name,
        content: comment.content,
        time: formatRelativeTime(comment.created_at),
        likes: comment.likes_count ?? 0,
      }));
    },
  });

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
        university_id: currentUniversityId,
      });

      if (error) throw error;

      await loadPosts(currentUniversityId);
      toast.success("Posted anonymously!");
      setNewPost("");
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post,
      ),
    );
  };

  const openReport = (postId: string) => {
    setReportPostId(postId);
    setReportReason("");
    setReportCustom("");
    setReportDialogOpen(true);
  };

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user || !reportPostId) throw new Error("Please sign in to report this post.");
      const reason = reportReason || reportCustom.trim();

      const { error } = await (supabase as any).from("anonymous_reports").insert({
        post_id: reportPostId,
        reporter_id: user.id,
        reason,
        details: reportCustom.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted. An admin will review this post.");
      setReportDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const submitReport = () => {
    if (!reportReason && !reportCustom.trim()) {
      toast.error("Please select a reason or provide details.");
      return;
    }

    reportMutation.mutate();
  };

  const openThread = (post: AnonymousPost) => {
    setSelectedPost(post);
    setThreadOpen(true);
  };

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user || !anonymousName || !selectedPost || !newComment.trim()) return;

      const { error } = await (supabase as any).from("anonymous_comments").insert({
        post_id: selectedPost.id,
        user_id: user.id,
        anonymous_name: anonymousName,
        content: newComment.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["anonymous-comments", selectedPost?.id] });
      loadPosts(currentUniversityId);
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex h-64 max-w-2xl items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AnonymousNameModal open={showNameModal} onClose={handleNameSelected} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border module-anonymous">
            <Ghost className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Anonymous Zone</h1>
            <p className="text-sm text-muted-foreground">Share freely, stay anonymous</p>
          </div>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-3 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">Keep it respectful. Harassment and harmful content will be removed.</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-[hsl(var(--anonymous))]/30 glass-card">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge className="gradient-anonymous text-white">
              <Shuffle className="mr-1 h-3 w-3" />
              Posting as: {anonymousName || "..."}
            </Badge>
          </div>
          <Textarea
            placeholder="Share your thoughts anonymously..."
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
            className="min-h-[100px] resize-none border-none bg-muted/50 focus-visible:ring-1"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Your identity is completely hidden</p>
            <Button variant="anonymous" size="sm" disabled={!newPost.trim() || isPosting} onClick={handlePost}>
              <Send className="h-4 w-4" />
              {isPosting ? "Posting..." : "Post Anonymously"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Ghost className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No anonymous posts yet for this campus.</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="glass-card transition-colors hover:border-[hsl(var(--anonymous))]/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-anonymous">
                      <Ghost className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{post.name}</p>
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
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground hover:text-[hsl(var(--anonymous))]"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground"
                      onClick={() => openThread(post)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => openReport(post.id)}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Anonymous Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional details</Label>
              <Textarea
                placeholder="Add any extra context..."
                value={reportCustom}
                onChange={(event) => setReportCustom(event.target.value)}
              />
            </div>
            <Button className="w-full" variant="destructive" onClick={submitReport}>
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={threadOpen} onOpenChange={setThreadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPost?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selectedPost?.content}</p>
            <div className="space-y-3">
              {commentsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading replies...</p>
              ) : (commentsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No thread replies yet.</p>
              ) : (
                (commentsQuery.data ?? []).map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Reply anonymously..."
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && commentMutation.mutate()}
              />
              <Button onClick={() => commentMutation.mutate()} disabled={!newComment.trim() || commentMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Anonymous;
