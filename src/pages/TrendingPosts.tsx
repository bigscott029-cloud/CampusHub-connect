/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Hash, Heart, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

interface TrendingPost {
  id: string;
  userId: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const TrendingPosts = () => {
  const { hashtag } = useParams();
  const navigate = useNavigate();
  const normalizedHashtag = (hashtag ?? "").replace(/^#/, "").trim();

  const postsQuery = useQuery({
    queryKey: ["trending-posts", normalizedHashtag],
    enabled: Boolean(normalizedHashtag),
    queryFn: async (): Promise<TrendingPost[]> => {
      const [hashtagResult, contentResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id, user_id, content, likes_count, comments_count, created_at")
          .contains("hashtags", [normalizedHashtag])
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("posts")
          .select("id, user_id, content, likes_count, comments_count, created_at")
          .ilike("content", `%#${normalizedHashtag}%`)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (hashtagResult.error || contentResult.error) {
        throw hashtagResult.error || contentResult.error;
      }

      const mergedPosts = new Map<string, any>();
      for (const post of [...(hashtagResult.data ?? []), ...(contentResult.data ?? [])]) {
        mergedPosts.set(post.id, post);
      }

      const rows = [...mergedPosts.values()].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const userIds = Array.from(new Set(rows.map((post) => post.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return rows.map((post) => ({
        id: post.id,
        userId: post.user_id,
        author: profileMap.get(post.user_id)?.display_name || "Campus member",
        content: post.content,
        likes: post.likes_count ?? 0,
        comments: post.comments_count ?? 0,
        time: formatRelativeTime(post.created_at),
      }));
    },
  });

  const posts = postsQuery.data ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Hash className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">#{hashtag}</h1>
            <p className="text-sm text-muted-foreground">{postsQuery.isLoading ? "Loading posts..." : `${posts.length} posts`}</p>
          </div>
        </div>
      </div>

      {postsQuery.isLoading ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading hashtag posts...
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Hash className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No posts found</h3>
            <p className="text-sm text-muted-foreground">Be the first to post with #{hashtag}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPosts;
