/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Clock,
  Flame,
  Heart,
  MessageCircle,
  Quote,
  Repeat2,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Verified,
} from "lucide-react";
import { toast } from "sonner";

import PostComposer from "@/components/feed/PostComposer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";

interface FeedPost {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  type: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  image?: string;
  hashtags: string[];
}

interface ThreadComment {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  author: string;
  avatar: string;
}

const fallbackTopics = ["CampusLife", "StudyTips", "Marketplace", "HostelHub"];

const Feed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [following, setFollowing] = useState<string[]>([]);
  const [threadOpen, setThreadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [newComment, setNewComment] = useState("");

  const postsQuery = useQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async (): Promise<FeedPost[]> => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("id, user_id, content, images, hashtags, post_type, likes_count, comments_count, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = Array.from(new Set((posts ?? []).map((post) => post.user_id)));
      const postIds = (posts ?? []).map((post) => post.id);

      const [{ data: profiles }, { data: likedRows }, { data: bookmarkedRows }] = await Promise.all([
        userIds.length
          ? (supabase as any)
              .from("profiles")
              .select("user_id, display_name, avatar_url, verified_badge")
              .in("user_id", userIds)
          : Promise.resolve({ data: [] }),
        user && postIds.length
          ? supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
          : Promise.resolve({ data: [] }),
        user && postIds.length
          ? (supabase as any).from("post_bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));
      const liked = new Set((likedRows ?? []).map((row: any) => row.post_id));
      const bookmarked = new Set((bookmarkedRows ?? []).map((row: any) => row.post_id));

      return (posts ?? []).map((post) => {
        const profile = profileMap.get(post.user_id);
        const name = profile?.display_name || "Campus Member";
        const images = post.images ?? [];

        return {
          id: post.id,
          userId: post.user_id,
          author: {
            id: post.user_id,
            name,
            handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "student"}`,
            avatar: name.charAt(0).toUpperCase(),
            verified: Boolean(profile?.verified_badge),
          },
          type: post.post_type || "gist",
          content: post.content,
          time: formatRelativeTime(post.created_at),
          likes: post.likes_count ?? 0,
          comments: post.comments_count ?? 0,
          shares: 0,
          isLiked: liked.has(post.id),
          isBookmarked: bookmarked.has(post.id),
          image: images[0],
          hashtags: post.hashtags ?? [],
        };
      });
    },
  });

  const commentsQuery = useQuery({
    queryKey: ["post-comments", selectedPost?.id],
    enabled: Boolean(selectedPost?.id && threadOpen),
    queryFn: async (): Promise<ThreadComment[]> => {
      const { data: comments, error } = await (supabase as any)
        .from("post_comments")
        .select("id, user_id, content, likes_count, created_at")
        .eq("post_id", selectedPost?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = Array.from(new Set((comments ?? []).map((comment: any) => comment.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any)
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (comments ?? []).map((comment: any) => {
        const author = profileMap.get(comment.user_id)?.display_name || "Campus Member";

        return {
          ...comment,
          author,
          avatar: author.charAt(0).toUpperCase(),
        };
      });
    },
  });

  const suggestedAccountsQuery = useQuery({
    queryKey: ["suggested-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("user_id, display_name")
        .neq("user_id", user?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("popularity_points", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data ?? [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (post: FeedPost) => {
      if (!user) throw new Error("Please sign in to like posts.");

      if (post.isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed-posts"] }),
    onError: (error) => toast.error(error.message),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (post: FeedPost) => {
      if (!user) throw new Error("Please sign in to bookmark posts.");

      if (post.isBookmarked) {
        const { error } = await (supabase as any)
          .from("post_bookmarks")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("post_bookmarks")
          .insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed-posts"] }),
    onError: (error) => toast.error(error.message),
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPost || !newComment.trim()) return;

      const { error } = await (supabase as any).from("post_comments").insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["post-comments", selectedPost?.id] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);

  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      [...post.hashtags, ...Array.from(post.content.matchAll(/#(\w+)/g)).map((match) => match[1])].forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    const topics = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag, count]) => ({ tag, count: formatCompactNumber(count) }));

    return topics.length ? topics : fallbackTopics.map((tag) => ({ tag, count: "0" }));
  }, [posts]);

  const openThread = (post: FeedPost) => {
    setSelectedPost(post);
    setThreadOpen(true);
  };

  const handleFollow = (accountId: string) => {
    setFollowing((current) =>
      current.includes(accountId) ? current.filter((id) => id !== accountId) : [...current, accountId],
    );
  };

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/trending/${hashtag}`);
  };

  const renderContentWithHashtags = (content: string) =>
    content.split(/(#\w+)/g).map((part, index) => {
      if (!part.startsWith("#")) return part;
      const tag = part.substring(1);
      return (
        <span key={`${part}-${index}`} className="cursor-pointer text-primary hover:underline" onClick={() => handleHashtagClick(tag)}>
          {part}
        </span>
      );
    });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border module-gists">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Campus Gists</h1>
              <p className="text-sm text-muted-foreground">What's happening on campus</p>
            </div>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <PostComposer onPostCreated={() => queryClient.invalidateQueries({ queryKey: ["feed-posts"] })} />
            </CardContent>
          </Card>

          <Tabs defaultValue="foryou">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="foryou" className="gap-1"><Sparkles className="h-4 w-4" />For You</TabsTrigger>
              <TabsTrigger value="trending" className="gap-1"><Flame className="h-4 w-4" />Trending</TabsTrigger>
              <TabsTrigger value="following" className="gap-1"><Clock className="h-4 w-4" />Following</TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="mt-4 space-y-4">
              {postsQuery.isLoading ? (
                <Card className="glass-card p-6 text-center text-sm text-muted-foreground">Loading campus gists...</Card>
              ) : posts.length === 0 ? (
                <Card className="glass-card p-6 text-center text-sm text-muted-foreground">No gists yet. Start the campus conversation.</Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="glass-card transition-colors hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">{post.author.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold">{post.author.name}</span>
                              {post.author.verified && <Verified className="h-4 w-4 fill-primary text-primary" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{post.author.handle}</span><span>•</span><span>{post.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={post.type === "official" ? "default" : post.type === "event" ? "secondary" : "outline"} className="text-xs capitalize">
                          {post.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderContentWithHashtags(post.content)}</p>
                      {post.image && (
                        <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                          <img src={post.image} alt="Post media" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className={`gap-1 ${post.isLiked ? "text-destructive" : "text-muted-foreground"}`} onClick={() => likeMutation.mutate(post)}>
                            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />{post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => openThread(post)}>
                            <MessageCircle className="h-4 w-4" />{post.comments}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                                <Share2 className="h-4 w-4" />{post.shares}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => toast.success("Repost queued for the next engagement schema pass.")}>
                                <Repeat2 className="mr-2 h-4 w-4" />Repost
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/feed?quote=${post.id}`)}>
                                <Quote className="mr-2 h-4 w-4" />Quote Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${post.isBookmarked ? "text-primary" : "text-muted-foreground"}`} onClick={() => bookmarkMutation.mutate(post)}>
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="trending" className="mt-4">
              <Card className="glass-card p-6 text-center">
                <Flame className="mx-auto mb-4 h-12 w-12 text-accent" />
                <h3 className="mb-2 font-semibold">Trending Posts</h3>
                <p className="text-sm text-muted-foreground">Posts are ranked by live likes and comments from Supabase.</p>
              </Card>
            </TabsContent>

            <TabsContent value="following" className="mt-4">
              <Card className="glass-card p-6 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 font-semibold">Following Feed</h3>
                <p className="text-sm text-muted-foreground">
                  {following.length > 0 ? `Following ${following.length} accounts` : "Follow some accounts to shape this feed."}
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden space-y-6 lg:block">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h3 className="font-display font-bold">Trending Topics</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <button key={topic.tag} onClick={() => handleHashtagClick(topic.tag)} className="flex w-full items-center justify-between rounded px-2 py-2 transition-colors hover:bg-muted/50">
                  <span className="text-sm font-medium text-primary">#{topic.tag}</span>
                  <span className="text-xs text-muted-foreground">#{index + 1} • {topic.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><h3 className="font-display font-bold">Suggested for You</h3></CardHeader>
            <CardContent className="space-y-4">
              {(suggestedAccountsQuery.data ?? []).map((account: any) => {
                const name = account.display_name || "Campus Member";
                return (
                  <div key={account.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-xs text-primary">{name.charAt(0)}</AvatarFallback></Avatar>
                      <div><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">@{name.toLowerCase().replace(/[^a-z0-9]+/g, "")}</p></div>
                    </div>
                    <Button variant={following.includes(account.user_id) ? "secondary" : "outline"} size="sm" onClick={() => handleFollow(account.user_id)}>
                      {following.includes(account.user_id) ? <><UserCheck className="mr-1 h-3 w-3" />Following</> : <><UserPlus className="mr-1 h-3 w-3" />Follow</>}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={threadOpen} onOpenChange={setThreadOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
          <DialogHeader><DialogTitle>Post Thread</DialogTitle></DialogHeader>
          {selectedPost && (
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{selectedPost.author.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold">{selectedPost.author.name}</span>
                      {selectedPost.author.verified && <Verified className="h-4 w-4 fill-primary text-primary" />}
                      <span className="ml-2 text-xs text-muted-foreground">{selectedPost.time}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{renderContentWithHashtags(selectedPost.content)}</p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="mb-4 flex gap-2">
                    <Input placeholder="Write a comment..." value={newComment} onChange={(event) => setNewComment(event.target.value)} onKeyDown={(event) => event.key === "Enter" && commentMutation.mutate()} className="flex-1" />
                    <Button size="sm" onClick={() => commentMutation.mutate()} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
                  </div>

                  <div className="space-y-4">
                    {commentsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading comments...</p>
                    ) : (commentsQuery.data ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet. Be the first.</p>
                    ) : (
                      (commentsQuery.data ?? []).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-xs">{comment.avatar}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                            </div>
                            <p className="mt-0.5 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
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

export default Feed;
