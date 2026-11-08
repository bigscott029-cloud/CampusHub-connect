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
  Pencil,
  Share2,
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
  const [createTextStatusOpen, setCreateTextStatusOpen] = useState(false);
  const [createMediaStatusOpen, setCreateMediaStatusOpen] = useState(false);
  const [textBgGradient, setTextBgGradient] = useState("from-indigo-600 to-purple-800");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<"text" | "image" | "video">("text");
  const [storyContent, setStoryContent] = useState("");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyReplyText, setStoryReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelected = (file: File) => {
    setStoryFile(file);
    const isVid = file.type.startsWith("video");
    setStoryType(isVid ? "video" : "image");
    setMediaPreviewUrl(URL.createObjectURL(file));
    setCreateMediaStatusOpen(true);
  };

  const handleShareStatus = async () => {
    if (!selectedStory) return;
    const shareText = selectedStory.content.text || `Check out ${selectedStory.userName}'s status on CampusHub!`;
    const shareUrl = `${window.location.origin}/messages?story=${selectedStory.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedStory.userName} on CampusHub`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Status link copied to clipboard!");
    }
  };

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
      toast.success("Status posted!");
      setCreateTextStatusOpen(false);
      setCreateMediaStatusOpen(false);
      setStoryContent("");
      setStoryFile(null);
      setMediaPreviewUrl(null);
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
            {/* Hidden native media file picker triggered by Add Status button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaSelected(file);
              }}
            />

            {/* 1. Direct Media Status Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 shrink-0 group"
              title="Add Photo or Video Status"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/70 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all shadow-sm">
                <Plus className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-medium text-foreground">Add Status</span>
            </button>

            {/* 2. Text Status Pen Button (WhatsApp style) */}
            <button
              type="button"
              onClick={() => setCreateTextStatusOpen(true)}
              className="flex flex-col items-center gap-1 shrink-0 group"
              title="Write Text Status"
            >
              <div className="w-16 h-16 rounded-full border border-border/80 flex items-center justify-center bg-muted/60 group-hover:bg-muted transition-all shadow-sm">
                <Pencil className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">Type Status</span>
            </button>

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
                className="flex flex-col items-center gap-1 shrink-0 group"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 shadow-sm group-hover:scale-105 transition-transform">
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

      {/* Dialog A: Media Status Preview & Confirmation */}
      <Dialog open={createMediaStatusOpen} onOpenChange={setCreateMediaStatusOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {storyType === "video" ? <Video className="w-5 h-5 text-primary" /> : <ImageIcon className="w-5 h-5 text-primary" />}
              Post {storyType === "video" ? "Video" : "Photo"} Status
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {mediaPreviewUrl && (
              <div className="relative aspect-[9/12] max-h-72 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {storyType === "video" ? (
                  <video src={mediaPreviewUrl} autoPlay loop muted playsInline className="h-full w-full object-contain" />
                ) : (
                  <img src={mediaPreviewUrl} alt="Preview" className="h-full w-full object-contain" />
                )}
              </div>
            )}

            <Input
              placeholder="Add a caption to your status..."
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
            />

            <p className="text-[11px] text-muted-foreground">Status updates automatically disappear after 24 hours.</p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateMediaStatusOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                disabled={createStoryMutation.isPending}
                onClick={() => createStoryMutation.mutate()}
              >
                {createStoryMutation.isPending ? "Posting..." : "Share Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog B: WhatsApp-Style Text Status Composer */}
      <Dialog open={createTextStatusOpen} onOpenChange={setCreateTextStatusOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Write Text Status
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Color preset selector */}
            <div className="flex items-center gap-2">
              {[
                "from-indigo-600 to-purple-800",
                "from-emerald-600 to-teal-800",
                "from-rose-600 to-pink-800",
                "from-amber-600 to-orange-800",
                "from-blue-600 to-cyan-800",
              ].map((gradient) => (
                <button
                  key={gradient}
                  type="button"
                  onClick={() => setTextBgGradient(gradient)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} border-2 ${
                    textBgGradient === gradient ? "border-white scale-110 shadow" : "border-transparent opacity-80"
                  } transition-all`}
                />
              ))}
            </div>

            {/* Preview Box */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${textBgGradient} min-h-[160px] flex items-center justify-center text-center shadow-inner`}>
              <Textarea
                placeholder="Type your campus status..."
                value={storyContent}
                onChange={(e) => {
                  setStoryType("text");
                  setStoryContent(e.target.value);
                }}
                className="bg-transparent border-none text-white text-lg font-medium placeholder:text-white/60 text-center focus-visible:ring-0 resize-none"
                rows={4}
                maxLength={280}
              />
            </div>

            <p className="text-[11px] text-muted-foreground">Stories disappear after 24 hours.</p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateTextStatusOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                disabled={!storyContent.trim() || createStoryMutation.isPending}
                onClick={() => {
                  setStoryType("text");
                  createStoryMutation.mutate();
                }}
              >
                {createStoryMutation.isPending ? "Posting..." : "Share Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer - [&>button]:hidden prevents duplicate Radix close button */}
      <Dialog open={storyViewerOpen} onOpenChange={setStoryViewerOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden [&>button]:hidden">
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
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {selectedStory.avatarUrl && <AvatarImage src={selectedStory.avatarUrl} alt={selectedStory.userName} />}
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {selectedStory.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">{selectedStory.userName}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleShareStatus}
                    title="Reshare Status"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setStoryViewerOpen(false)}
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
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
                    autoPlay
                    playsInline
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
