/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Plus,
  X,
  Image as ImageIcon,
  Video,
  Type,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  avatarUrl: string | null;
  content: {
    type: "image" | "video" | "text";
    url?: string;
    text?: string;
  };
  createdAt: string;
  expiresAt: string;
}

interface StoriesCarouselProps {
  onCreateStory?: () => void;
}

const StoriesCarousel = ({ onCreateStory }: StoriesCarouselProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [storyType, setStoryType] = useState<"text" | "image" | "video">("text");
  const [storyContent, setStoryContent] = useState("");

  const storiesQuery = useQuery({
    queryKey: ["stories-carousel"],
    queryFn: async (): Promise<Story[]> => {
      const { data: stories, error } = await supabase
        .from("stories")
        .select("id, user_id, content_type, content_url, text_content, created_at, expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      const userIds = Array.from(new Set((stories ?? []).map((story) => story.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (stories ?? []).map((story) => {
        const profile = profileMap.get(story.user_id);
        const userName = profile?.display_name || "Campus member";

        return {
          id: story.id,
          userId: story.user_id,
          userName,
          avatar: userName.charAt(0).toUpperCase(),
          avatarUrl: profile?.avatar_url ?? null,
          content: {
            type: story.content_type as Story["content"]["type"],
            url: story.content_url ?? undefined,
            text: story.text_content ?? undefined,
          },
          createdAt: story.created_at,
          expiresAt: story.expires_at,
        };
      });
    },
  });

  const stories = storiesQuery.data ?? [];

  const viewStory = (story: Story) => {
    setSelectedStory(story);
    setStoryViewerOpen(true);
  };

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to post a story.");
      if (!storyContent.trim()) throw new Error("Please add content to your story");

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        content_type: storyType,
        content_url: storyType === "text" ? null : storyContent.trim(),
        text_content: storyType === "text" ? storyContent.trim() : null,
        expires_at: expiresAt,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Story posted!");
      setCreateStoryOpen(false);
      setStoryContent("");
      onCreateStory?.();
      queryClient.invalidateQueries({ queryKey: ["stories-carousel"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const navigateStory = (direction: "prev" | "next") => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex((s) => s.id === selectedStory.id);
    if (currentIndex < 0) return;
    const newIndex = direction === "next" 
      ? Math.min(currentIndex + 1, stories.length - 1)
      : Math.max(currentIndex - 1, 0);
    setSelectedStory(stories[newIndex]);
  };

  return (
    <>
      <div className="px-4 py-3 border-b border-border/50">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {/* Create Story Button */}
            <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
              <DialogTrigger asChild>
                <button className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Add Story</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={storyType === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStoryType("text")}
                    >
                      <Type className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                    <Button
                      variant={storyType === "image" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStoryType("image")}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Image
                    </Button>
                    <Button
                      variant={storyType === "video" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStoryType("video")}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Video
                    </Button>
                  </div>

                  {storyType === "text" ? (
                    <Textarea
                      placeholder="What's on your mind?"
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      rows={4}
                      maxLength={280}
                    />
                  ) : (
                    <Input
                      placeholder={`Paste ${storyType} URL...`}
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                    />
                  )}

                  <p className="text-xs text-muted-foreground">
                    Stories disappear after 24 hours
                  </p>

                  <Button onClick={() => createStoryMutation.mutate()} disabled={createStoryMutation.isPending} className="w-full">
                    {createStoryMutation.isPending ? "Posting..." : "Post Story"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Stories */}
            {storiesQuery.isLoading && (
              [0, 1, 2].map((item) => (
                <div key={item} className="flex shrink-0 flex-col items-center gap-1">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                </div>
              ))
            )}

            {stories.map((story) => (
              <button
                key={story.id}
                onClick={() => viewStory(story)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary to-accent">
                  <Avatar className="w-full h-full border-2 border-background">
                    {story.avatarUrl && <AvatarImage src={story.avatarUrl} alt={story.userName} />}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {story.avatar}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-muted-foreground truncate w-16 text-center">
                  {story.userName}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer */}
      <Dialog open={storyViewerOpen} onOpenChange={setStoryViewerOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {selectedStory && (
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 aspect-[9/16] flex items-center justify-center">
              {/* Progress bars */}
              <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
                {stories.map((story, index) => {
                  const selectedIndex = stories.findIndex((item) => item.id === selectedStory.id);
                  return (
                    <div
                      key={story.id}
                      className={`h-0.5 flex-1 rounded-full ${index <= selectedIndex ? "bg-white" : "bg-white/30"}`}
                    />
                  );
                })}
              </div>

              {/* User info */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {selectedStory.avatarUrl && <AvatarImage src={selectedStory.avatarUrl} alt={selectedStory.userName} />}
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {selectedStory.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">{selectedStory.userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setStoryViewerOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="px-6 text-center">
                {selectedStory.content.type === "text" && (
                  <p className="text-xl font-medium text-white">{selectedStory.content.text}</p>
                )}
                {selectedStory.content.type === "image" && (
                  <img
                    src={selectedStory.content.url}
                    alt=""
                    className="max-w-full max-h-[60vh] rounded-lg"
                  />
                )}
                {selectedStory.content.type === "video" && (
                  <video
                    src={selectedStory.content.url}
                    controls
                    className="max-h-[60vh] max-w-full rounded-lg"
                  />
                )}
              </div>

              {/* Navigation */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full"
                onClick={() => navigateStory("prev")}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full"
                onClick={() => navigateStory("next")}
              />

              {/* Viewers count */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(selectedStory.createdAt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoriesCarousel;
