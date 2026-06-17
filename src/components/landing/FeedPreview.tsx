import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Clock, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicFeedPreview } from "@/lib/liveMetrics";

const FeedPreview = () => {
  const feedQuery = useQuery({
    queryKey: ["public-feed-preview"],
    queryFn: () => getPublicFeedPreview(3),
  });

  const posts = feedQuery.data ?? [];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Description */}
          <div className="lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Live Feed</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Stay in the Loop,
              <span className="gradient-text"> Always</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-6">
              From breaking campus news to anonymous confessions — your personalized feed keeps you connected to everything happening around your university.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Trending & Latest</h4>
                  <p className="text-sm text-muted-foreground">See what's buzzing on campus right now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Engage & Connect</h4>
                  <p className="text-sm text-muted-foreground">Like, comment, and share with your campus</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-anonymous/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-anonymous" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground">Never miss important announcements</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">View Your Feed</Link>
            </Button>
          </div>

          {/* Right side - Live feed preview */}
          <div className="relative">
            <div className="space-y-4">
              {feedQuery.isLoading && (
                [0, 1, 2].map((item) => (
                  <Card key={item} className="glass-card rounded-2xl">
                    <CardContent className="p-5">
                      <div className="mb-4 h-10 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="mb-2 h-4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))
              )}

              {!feedQuery.isLoading && posts.length === 0 && (
                <Card className="glass-card rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold">No public feed activity yet</h3>
                    <p className="text-sm text-muted-foreground">
                      The latest gists and anonymous posts will appear here once students start posting.
                    </p>
                  </CardContent>
                </Card>
              )}

              {posts.map((post, index) => (
                <div 
                  key={post.id}
                  className={`glass-card rounded-2xl p-5 animate-slide-in-right ${
                    post.type === 'anonymous' ? 'border-l-4 border-l-anonymous' : 
                    ''
                  }`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className={post.type === 'anonymous' ? 'gradient-anonymous' : ''}>
                        {post.type === 'anonymous' ? (
                          <AvatarFallback className="text-lg">{post.avatar}</AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {post.avatar}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{post.author}</span>
                          {post.trending && (
                            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                              Trending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.type === "anonymous" ? "Anonymous Zone" : "Campus Gists"}</span>
                          <span aria-hidden="true">•</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-4">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.comments}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Share2 className="w-4 h-4" />
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      <Bookmark className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedPreview;
