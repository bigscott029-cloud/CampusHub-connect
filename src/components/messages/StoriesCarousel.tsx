/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
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
  Send,
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
  onSelectUserForChat?: (userId: string, initialMessage?: string) => void;
}

const StoriesCarousel = ({ onCreateStory, onSelectUserForChat }: StoriesCarouselProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [storyType, setStoryType] = useState<"text" | "image" | "video">("text");
  const [storyContent, setStoryContent] = useState("");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyReplyText, setStoryReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendStoryReply = async (customText?: string) => {
    const textToSend = customText || storyReplyText.trim();
    if (!textToSend || !selectedStory || !user) return;
    if (selectedStory.userId === user.id) {
      toast.info("This is your own status!");
      return;
    }

    try {
      setIsSendingReply(true);
      // Check if conversation already exists
      const { data: existingConvs } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${selectedStory.userId}),and(participant_1.eq.${selectedStory.userId},participant_2.eq.${user.id})`)
        .limit(1);

      let conversationId = existingConvs?.[0]?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant_1: user.id,
            participant_2: selectedStory.userId,
            last_message_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      const formattedContent = `[Replied to Status]: "${selectedStory.content.text || 'Photo/Video Status'}"\n${textToSend}`;

      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: formattedContent,
        });

      if (msgError) throw msgError;

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });

      toast.success(`Reply sent to ${selectedStory.userName}!`);
      setStoryReplyText("");
      setStoryViewerOpen(false);

      if (onSelectUserForChat) {
        onSelectUserForChat(selectedStory.userId, formattedContent);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

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
      if (storyType === "text" && !storyContent.trim()) throw new Error("Please add content to your story");
      if (storyType !== "text" && !storyContent.trim() && !storyFile) throw new Error("Please add media to your story");

      let uploadedUrl = storyContent.trim();
      if (storyType !== "text" && storyFile) {
        const ext = storyFile.name.split(".").pop() || (storyType === "video" ? "mp4" : "jpg");
        const path = `${user.id}/stories/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("story-media").upload(path, storyFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("story-media").getPublicUrl(path);
        uploadedUrl = data.publicUrl;
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        content_type: storyType,
        content_url: storyType === "text" ? null : uploadedUrl,
        text_content: storyType === "text" ? storyContent.trim() : null,
        expires_at: expiresAt,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Story posted!");
      setCreateStoryOpen(false);
      setStoryContent("");
      setStoryFile(null);
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
                    <div
                      className="rounded-lg border border-dashed p-4 text-center"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files?.[0];
                        if (file) setStoryFile(file);
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={storyType === "image" ? "image/*" : "video/*"}
                        className="hidden"
                        onChange={(event) => setStoryFile(event.target.files?.[0] ?? null)}
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Choose {storyType}
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {storyFile ? storyFile.name : `Drag and drop a ${storyType}, or paste a URL below.`}
                      </p>
                      <Input
                        className="mt-3"
                        placeholder={`Optional ${storyType} URL...`}
                        value={storyContent}
                        onChange={(e) => setStoryContent(e.target.value)}
                      />
                    </div>
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
                className="absolute left-0 top-1/4 h-1/2 w-1/3 z-10"
                onClick={() => navigateStory("prev")}
                title="Previous story"
              />
              <button
                className="absolute right-0 top-1/4 h-1/2 w-1/3 z-10"
                onClick={() => navigateStory("next")}
                title="Next story"
              />

              {/* Time indicator */}
              <div className="absolute top-16 left-4 flex items-center gap-1 text-white/70 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatRelativeTime(selectedStory.createdAt)}</span>
              </div>

              {/* Bottom Reply Bar (WhatsApp / Instagram style) */}
              {selectedStory.userId !== user?.id && (
                <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-2 rounded-2xl bg-black/60 p-2.5 backdrop-blur-md">
                  {/* Quick reactions */}
                  <div className="flex items-center justify-around py-1 text-lg">
                    {["🔥", "❤️", "👏", "😂", "🙌", "😍"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSendStoryReply(emoji)}
                        disabled={isSendingReply}
                        className="transition-transform active:scale-125 hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendStoryReply();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder={`Reply to ${selectedStory.userName}...`}
                      value={storyReplyText}
                      onChange={(e) => setStoryReplyText(e.target.value)}
                      className="h-9 border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60 focus-visible:ring-white/40"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!storyReplyText.trim() || isSendingReply}
                      className="h-9 shrink-0 gap-1 bg-primary text-primary-foreground text-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoriesCarousel;
