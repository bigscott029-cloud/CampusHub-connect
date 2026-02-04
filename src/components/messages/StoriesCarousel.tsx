import { useState } from "react";
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
  FileText,
  Type,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Story {
  id: number;
  userId: string;
  userName: string;
  avatar: string;
  content: {
    type: "image" | "video" | "text" | "file";
    url?: string;
    text?: string;
  };
  viewed: boolean;
  expiresAt: Date;
}

const mockStories: Story[] = [
  {
    id: 1,
    userId: "1",
    userName: "Tunde A.",
    avatar: "T",
    content: { type: "text", text: "Just finished my exams! 🎉" },
    viewed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    userId: "2",
    userName: "Amaka O.",
    avatar: "A",
    content: { type: "image", url: "/placeholder.svg" },
    viewed: true,
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
  },
  {
    id: 3,
    userId: "3",
    userName: "John D.",
    avatar: "J",
    content: { type: "text", text: "Study group meeting at 4PM! Who's coming?" },
    viewed: false,
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
  },
  {
    id: 4,
    userId: "4",
    userName: "Jane S.",
    avatar: "J",
    content: { type: "image", url: "/placeholder.svg" },
    viewed: true,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
];

interface StoriesCarouselProps {
  onCreateStory?: () => void;
}

const StoriesCarousel = ({ onCreateStory }: StoriesCarouselProps) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [storyType, setStoryType] = useState<"text" | "image" | "video">("text");
  const [storyContent, setStoryContent] = useState("");

  const viewStory = (story: Story) => {
    setSelectedStory(story);
    setStoryViewerOpen(true);
  };

  const handleCreateStory = () => {
    if (!storyContent.trim()) {
      toast.error("Please add content to your story");
      return;
    }
    toast.success("Story posted!");
    setCreateStoryOpen(false);
    setStoryContent("");
  };

  const navigateStory = (direction: "prev" | "next") => {
    if (!selectedStory) return;
    const currentIndex = mockStories.findIndex((s) => s.id === selectedStory.id);
    const newIndex = direction === "next" 
      ? Math.min(currentIndex + 1, mockStories.length - 1)
      : Math.max(currentIndex - 1, 0);
    setSelectedStory(mockStories[newIndex]);
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

                  <Button onClick={handleCreateStory} className="w-full">
                    Post Story
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Stories */}
            {mockStories.map((story) => (
              <button
                key={story.id}
                onClick={() => viewStory(story)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div
                  className={`w-16 h-16 rounded-full p-0.5 ${
                    story.viewed
                      ? "bg-muted"
                      : "bg-gradient-to-tr from-primary to-accent"
                  }`}
                >
                  <Avatar className="w-full h-full border-2 border-background">
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
                {mockStories.map((story, i) => (
                  <div
                    key={story.id}
                    className={`h-0.5 flex-1 rounded-full ${
                      story.id < selectedStory.id
                        ? "bg-white"
                        : story.id === selectedStory.id
                        ? "bg-white"
                        : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* User info */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
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
                <Eye className="w-4 h-4" />
                <span>12 views</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoriesCarousel;
