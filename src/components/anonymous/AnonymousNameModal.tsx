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
import { Ghost, Shuffle, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AnonymousNameModalProps {
  open: boolean;
  onClose: (name?: string) => void;
}

const QUICK_PREFIXES = ["shadow", "phantom", "mystery", "covert", "ghost", "ninja", "scholar", "campus"];

const generateRandomHandle = () => {
  const prefix = QUICK_PREFIXES[Math.floor(Math.random() * QUICK_PREFIXES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${num}`;
};

const AnonymousNameModal = ({ open, onClose }: AnonymousNameModalProps) => {
  const { user } = useAuth();
  const [handleInput, setHandleInput] = useState("");
  const [suggestedSuffix, setSuggestedSuffix] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (open && !handleInput) {
      setHandleInput(generateRandomHandle());
      setSuggestedSuffix(null);
    }
  }, [open]);

  const handleShuffle = () => {
    setHandleInput(generateRandomHandle());
    setSuggestedSuffix(null);
  };

  const sanitizeHandle = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
  };

  const handleSave = async () => {
    if (!user) return;

    const clean = sanitizeHandle(handleInput);
    if (!clean || clean.length < 3) {
      toast.error("Anonymous handle must be at least 3 characters");
      return;
    }

    setIsSaving(true);
    setIsChecking(true);
    try {
      // Check if handle is already taken (case-insensitive)
      const { data: existing, error: checkError } = await (supabase as any)
        .from("anonymous_names")
        .select("anonymous_name")
        .ilike("anonymous_name", clean)
        .maybeSingle();

      let finalHandle = clean;

      if (!checkError && existing) {
        // Collision detected: append numerical suffix
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalHandle = `${clean}${randomSuffix}`;
        setSuggestedSuffix(finalHandle);
        toast.info(`@${clean} is taken. Assigned unique handle @${finalHandle}`);
      }

      const { error: insertError } = await supabase.from("anonymous_names").insert({
        user_id: user.id,
        anonymous_name: finalHandle,
      });

      if (insertError) throw insertError;

      toast.success(`Anonymous identity created: @${finalHandle}`);
      onClose(finalHandle);
    } catch (error: any) {
      console.error("Error saving anonymous handle:", error);
      toast.error(error.message || "Failed to create anonymous handle. Please try again.");
    } finally {
      setIsSaving(false);
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-purple-500" />
            Create Your Anonymous Identity
          </DialogTitle>
          <DialogDescription>
            Choose a custom handle. In the Anonymous Zone, your real profile, department, and photo remain 100% untraceable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Custom Handle Input with Randomizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Custom Anonymous Handle</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShuffle}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Randomize
              </Button>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono font-bold">
                @
              </span>
              <Input
                placeholder="e.g. bigscott, ghost_rider"
                value={handleInput}
                onChange={(e) => {
                  setHandleInput(sanitizeHandle(e.target.value));
                  setSuggestedSuffix(null);
                }}
                className="pl-8 font-mono text-sm"
                maxLength={24}
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Lowercase letters, numbers, and underscores only. Max 24 chars.
            </p>
          </div>

          {/* Suffix Collision Alert */}
          {suggestedSuffix && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Handle was taken. Numerical suffix assigned: <strong>@{suggestedSuffix}</strong></span>
            </div>
          )}

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">Quick handles:</Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PREFIXES.slice(0, 5).map((pref) => {
                const sample = `${pref}${Math.floor(100 + Math.random() * 900)}`;
                return (
                  <Badge
                    key={pref}
                    variant="outline"
                    className="cursor-pointer text-xs font-mono py-1 px-2.5 hover:bg-muted"
                    onClick={() => {
                      setHandleInput(sample);
                      setSuggestedSuffix(null);
                    }}
                  >
                    @{sample}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <p className="text-[11px] text-muted-foreground mb-2">Live Identity Preview:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
                <Ghost className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate font-mono">
                  @{handleInput || "anonymous"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Anonymous Zone Member</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full text-xs sm:text-sm h-10 font-medium"
            variant="hero"
            onClick={handleSave}
            disabled={isSaving || isChecking || !handleInput.trim()}
          >
            {isSaving ? "Verifying & Saving..." : "Confirm Anonymous Handle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnonymousNameModal;
