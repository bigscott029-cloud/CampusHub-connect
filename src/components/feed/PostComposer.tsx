import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Video,
  Link2,
  Hash,
  MapPin,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostComposerProps {
  onPostCreated?: () => void;
}

const PostComposer = ({ onPostCreated }: PostComposerProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [newHashtag, setNewHashtag] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [hashtagDialogOpen, setHashtagDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "U";

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim().replace(/^#/, "")]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleImageUrlAdd = (url: string) => {
    if (url.trim() && images.length < 4) {
      setImages([...images, url.trim()]);
    }
  };

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setIsPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        images,
        video_url: videoUrl || null,
        link_url: linkUrl || null,
        hashtags,
        location: location || null,
        post_type: "gist",
      });

      if (error) throw error;

      toast.success("Your gist has been posted!");
      setContent("");
      setImages([]);
      setVideoUrl("");
      setLinkUrl("");
      setHashtags([]);
      setLocation("");
      onPostCreated?.();
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="What's the gist? Share campus news, events, or just your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none border-none bg-muted/50 focus-visible:ring-1"
        />

        {/* Preview attachments */}
        {(images.length > 0 || videoUrl || linkUrl || hashtags.length > 0 || location) && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30 space-y-2">
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {videoUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4" />
                <span className="truncate flex-1">{videoUrl}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setVideoUrl("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {linkUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="w-4 h-4" />
                <span className="truncate flex-1">{linkUrl}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setLinkUrl("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {hashtags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setLocation("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex gap-1">
            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleImageUrlAdd((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Press Enter to add (max 4 images)</p>
                  </div>
                  {images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  <Button onClick={() => setImageDialogOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Video Dialog */}
            <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Video className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Video</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Video URL (YouTube, etc.)</Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setVideoDialogOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Link2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setLinkDialogOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Hashtag Dialog */}
            <Dialog open={hashtagDialogOpen} onOpenChange={setHashtagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Hash className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Hashtags</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter hashtag"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                    />
                    <Button onClick={addHashtag}>Add</Button>
                  </div>
                  {hashtags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          #{tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button onClick={() => setHashtagDialogOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Location Dialog */}
            <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Main Library, Campus Gate"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setLocationDialogOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button variant="hero" size="sm" disabled={!content.trim() || isPosting} onClick={handlePost}>
            <Send className="w-4 h-4 mr-1" />
            {isPosting ? "Posting..." : "Post Gist"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
