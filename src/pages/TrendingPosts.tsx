import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Hash, Heart, MessageCircle, Share2 } from "lucide-react";

// Mock data for trending posts
const mockTrendingPosts: Record<string, any[]> = {
  ExamTimetable: [
    { id: 1, author: "Student Affairs", content: "The exam timetable for 2025/2026 session is now available! Check your portal.", likes: 234, comments: 45 },
    { id: 2, author: "CSC Department", content: "CSC exams will begin on Feb 15th. Prepare accordingly! #ExamTimetable", likes: 156, comments: 23 },
  ],
  SUGElections: [
    { id: 1, author: "Electoral Committee", content: "SUG Elections slated for March 5th. Register to vote! #SUGElections", likes: 567, comments: 89 },
  ],
  LibraryHours: [
    { id: 1, author: "Library Admin", content: "Extended library hours during exam period: 6AM - 12AM #LibraryHours", likes: 345, comments: 12 },
  ],
  FacultyWeek: [
    { id: 1, author: "Faculty of Science", content: "Faculty Week starts Monday! Don't miss the cultural night. #FacultyWeek", likes: 890, comments: 156 },
  ],
};

const TrendingPosts = () => {
  const { hashtag } = useParams();
  const navigate = useNavigate();
  const posts = mockTrendingPosts[hashtag || ""] || [];

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
            <p className="text-sm text-muted-foreground">{posts.length} posts</p>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
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
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
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
