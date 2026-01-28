import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Clock, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const posts = [
  {
    id: 1,
    author: "Jessica M.",
    avatar: "JM",
    university: "University of Lagos",
    department: "Computer Science",
    time: "2 hours ago",
    content: "Just found out the library is open 24/7 during exam period! 📚 Who's pulling an all-nighter with me?",
    likes: 127,
    comments: 34,
    type: "gist",
    trending: true
  },
  {
    id: 2,
    author: "Anonymous Eagle",
    avatar: "🦅",
    university: "University of Lagos",
    time: "4 hours ago",
    content: "To the person who returned my laptop at the cafeteria yesterday — you're a real one. Faith in humanity restored. 🙏",
    likes: 256,
    comments: 42,
    type: "anonymous"
  },
  {
    id: 3,
    author: "Student Affairs",
    avatar: "SA",
    university: "University of Lagos",
    time: "6 hours ago",
    content: "📢 IMPORTANT: Course registration deadline extended to Friday. Make sure to complete yours before then!",
    likes: 89,
    comments: 12,
    type: "official",
    pinned: true
  }
];

const FeedPreview = () => {
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

            <Button variant="hero" size="lg">
              View Your Feed
            </Button>
          </div>

          {/* Right side - Feed mockup */}
          <div className="relative">
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div 
                  key={post.id}
                  className={`glass-card rounded-2xl p-5 animate-slide-in-right ${
                    post.type === 'anonymous' ? 'border-l-4 border-l-anonymous' : 
                    post.type === 'official' ? 'border-l-4 border-l-primary' : ''
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
                          {post.pinned && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              Pinned
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {post.department && <span>{post.department}</span>}
                          <span>•</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-4">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
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
