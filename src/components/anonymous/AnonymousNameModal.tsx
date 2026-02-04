import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ghost, Shuffle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const anonymousNameSuggestions = [
  "Anonymous Eagle 🦅",
  "Silent Phoenix 🔥",
  "Mystery Owl 🦉",
  "Hidden Tiger 🐯",
  "Secret Panda 🐼",
  "Phantom Wolf 🐺",
  "Shadow Lion 🦁",
  "Mystic Fox 🦊",
  "Stealth Bear 🐻",
  "Covert Hawk 🦅",
  "Ninja Cat 🐱",
  "Ghost Dolphin 🐬",
  "Incognito Penguin 🐧",
  "Masked Raven 🐦",
  "Anonymous Cobra 🐍",
];

interface AnonymousNameModalProps {
  open: boolean;
  onClose: (name: string) => void;
}

const AnonymousNameModal = ({ open, onClose }: AnonymousNameModalProps) => {
  const { user } = useAuth();
  const [customName, setCustomName] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      generateSuggestions();
    }
  }, [open]);

  const generateSuggestions = () => {
    const shuffled = [...anonymousNameSuggestions].sort(() => Math.random() - 0.5);
    setSuggestions(shuffled.slice(0, 5));
    setSelectedName(shuffled[0]);
  };

  const handleSave = async () => {
    if (!user) return;
    
    const nameToSave = customName.trim() || selectedName;
    if (!nameToSave) {
      toast.error("Please select or enter an anonymous name");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("anonymous_names").insert({
        user_id: user.id,
        anonymous_name: nameToSave,
      });

      if (error) throw error;

      toast.success("Anonymous identity created!");
      onClose(nameToSave);
    } catch (error: any) {
      console.error("Error saving anonymous name:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ghost className="w-5 h-5" />
            Create Your Anonymous Identity
          </DialogTitle>
          <DialogDescription>
            Choose or create an anonymous name. This will be your identity in the Anonymous Zone. 
            Your real identity remains completely hidden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Choose from suggestions:</Label>
              <Button variant="ghost" size="sm" onClick={generateSuggestions}>
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((name) => (
                <Badge
                  key={name}
                  variant={selectedName === name ? "default" : "outline"}
                  className="cursor-pointer py-2 px-3 text-sm"
                  onClick={() => {
                    setSelectedName(name);
                    setCustomName("");
                  }}
                >
                  {selectedName === name && <Check className="w-3 h-3 mr-1" />}
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Or create your own:</Label>
            <Input
              placeholder="e.g., Mysterious Scholar 📚"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                if (e.target.value) setSelectedName("");
              }}
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              Add an emoji to make it unique! (Max 30 characters)
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Ghost className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">{customName || selectedName || "Your Anonymous Name"}</p>
                <p className="text-xs text-muted-foreground">Anonymous Zone Member</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSave} 
            disabled={isSaving || (!customName && !selectedName)}
          >
            {isSaving ? "Creating..." : "Create Anonymous Identity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnonymousNameModal;
