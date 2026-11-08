import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Calendar,
  Globe,
  MapPin,
  Upload,
  Video,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  X,
  School,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { launchPaystackCheckout } from "@/lib/paystack";

interface AdPlacementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type CampaignScope = "local" | "global" | "student_spotlight";
export type CampaignDuration = "1_day" | "2_days" | "3_days" | "1_week";

export const AD_PRICING: Record<CampaignScope, Record<CampaignDuration, number>> = {
  local: {
    "1_day": 5000,
    "2_days": 8000,
    "3_days": 11000,
    "1_week": 30000,
  },
  global: {
    "1_day": 15000,
    "2_days": 25000,
    "3_days": 35000,
    "1_week": 80000,
  },
  student_spotlight: {
    "1_day": 2500,
    "2_days": 4000,
    "3_days": 5500,
    "1_week": 12000,
  },
};

export const AdPlacementModal = ({ open, onOpenChange }: AdPlacementModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"catalogue" | "creative" | "success">("catalogue");
  const [scope, setScope] = useState<CampaignScope>("local");
  const [duration, setDuration] = useState<CampaignDuration>("1_day");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sponsorName, setSponsorName] = useState(user?.user_metadata?.display_name || "");
  const [ctaUrl, setCtaUrl] = useState(`https://wa.me/2348051454564`);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submittedAdId, setSubmittedAdId] = useState<string | null>(null);

  const price = AD_PRICING[scope][duration];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/ads/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-media")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
      setMediaUrl(data.publicUrl);
      toast.success("Media uploaded successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload media";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const adMutation = useMutation({
    mutationFn: async (paymentReference?: string) => {
      if (!user) throw new Error("Please sign in to place an ad.");
      if (!title.trim() || !description.trim()) {
        throw new Error("Please fill in ad title and brief description.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("university_id, home_region")
        .eq("user_id", user.id)
        .maybeSingle();

      const daysCount =
        duration === "1_day" ? 1 : duration === "2_days" ? 2 : duration === "3_days" ? 3 : 7;

      const now = new Date();
      const endsAt = new Date(now.getTime() + daysCount * 24 * 60 * 60 * 1000);

      const placementSlots = ["popup", "marketplace", "feed"];
      if (mediaType === "video") {
        placementSlots.push("reels");
      }

      const { data: newAd, error } = await supabase
        .from("ads")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          sponsor_name: sponsorName.trim() || "Campus Brand",
          creative_url: mediaUrl.trim() || null,
          cta_text: "Contact Advertiser",
          cta_url: ctaUrl.trim() || "https://wa.me/2348051454564",
          placement_type: scope === "global" ? "global" : "geo",
          target_scope: scope === "global" ? "general" : "region",
          geo_region: profile?.home_region || null,
          target_university_id: scope === "local" ? profile?.university_id : null,
          placement_slots: placementSlots,
          status: "pending_review",
          payment_status: paymentReference ? "paid" : "pending",
          tier_name: `${scope}_${duration}`,
          tier_price: price,
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
          admin_notes: `Reference: ${paymentReference || "Manual review"}. Submitted via Ad Placement Portal. Support Hotline: 08051454564`,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Submit admin request notification
      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "ad_placement",
        reference_id: newAd.id,
        status: "pending",
      });

      return newAd.id;
    },
    onSuccess: (adId) => {
      setSubmittedAdId(adId);
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["active-ads"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to place ad";
      toast.error(msg);
    },
  });

  const handleStartPayment = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please add your ad title and copy before checkout.");
      return;
    }

    launchPaystackCheckout({
      email: user?.email || "billing@campushub.ng",
      amount: price,
      purpose: "ad_campaign_sponsorship",
      referenceId: user?.id || "GUEST",
      metadata: {
        scope,
        duration,
        adTitle: title,
      },
      onSuccess: (reference) => {
        adMutation.mutate(reference);
      },
      onClose: () => {
        // Fallback option if user closes checkout
        toast.info("Checkout postponed. You can also finalize via WhatsApp support: 08051454564");
      },
    });
  };

  const resetForm = () => {
    setStep("catalogue");
    setTitle("");
    setDescription("");
    setMediaUrl("");
    setSubmittedAdId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-bold">
                CampusHub Ad &amp; Boost Portal
              </DialogTitle>
              <DialogDescription className="text-xs">
                Broadcast your brand, business, hostel room, or campus event to thousands of students.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "catalogue" && (
          <div className="space-y-5 pt-2">
            {/* Step 1: Choose Scope */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1. Select Audience Reach
              </Label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setScope("local")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === "local"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-primary mb-1.5" />
                  <p className="text-xs font-bold">Local Campus</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Your university region</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("global")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === "global"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <Globe className="w-4 h-4 text-blue-500 mb-1.5" />
                  <p className="text-xs font-bold">Nationwide</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">All 36 states &amp; campuses</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("student_spotlight")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === "student_spotlight"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <School className="w-4 h-4 text-emerald-500 mb-1.5" />
                  <p className="text-xs font-bold">Student Tier</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Events, gigs &amp; tutorials</p>
                </button>
              </div>
            </div>

            {/* Step 2: Choose Duration */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2. Select Campaign Duration
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "1_day" as CampaignDuration, label: "1 Day", tag: "Single Day" },
                  { id: "2_days" as CampaignDuration, label: "2 Days", tag: "Weekend" },
                  { id: "3_days" as CampaignDuration, label: "3 Days", tag: "Popular" },
                  { id: "1_week" as CampaignDuration, label: "1 Week", tag: "Maximum ROI" },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDuration(dur.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      duration === dur.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs font-semibold">{dur.label}</p>
                    <p className="text-[11px] font-mono text-primary mt-1">
                      {formatCurrency(AD_PRICING[scope][dur.id])}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Price Card */}
            <Card className="glass-card bg-muted/40 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Calculated Placement Fee</p>
                  <p className="text-2xl font-bold font-display text-primary">{formatCurrency(price)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Target: {scope.replace(/_/g, " ").toUpperCase()} &bull; Duration: {duration.replace(/_/g, " ")}
                  </p>
                </div>

                <Button
                  onClick={() => setStep("creative")}
                  className="bg-primary text-white hover:bg-primary/90 text-xs px-5 h-10 rounded-xl"
                >
                  Continue to Ad Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "creative" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-medium text-muted-foreground">Fill in your campaign creatives:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("catalogue")}
                className="text-xs text-primary h-7 px-2"
              >
                &larr; Change Plan ({formatCurrency(price)})
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Ad Title / Headline *</Label>
                <Input
                  placeholder="e.g. 50% Off Laptop Bags & Gadgets at SUB Gate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Sponsor or Business Name</Label>
                <Input
                  placeholder="e.g. Apex Tech Campus Store"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Short Ad Copy &amp; Description *</Label>
                <Textarea
                  placeholder="Describe your offer, event date, discounts, or hostel room specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Media Type Toggle: Image vs Video */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs">Creative Format</Label>
                  <div className="inline-flex p-0.5 rounded-lg bg-muted text-xs">
                    <button
                      type="button"
                      onClick={() => setMediaType("image")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        mediaType === "image" ? "bg-background font-semibold shadow-sm" : ""
                      }`}
                    >
                      Image Flyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType("video")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        mediaType === "video" ? "bg-background font-semibold shadow-sm" : ""
                      }`}
                    >
                      Video Ad (Reels Ready)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder={
                      mediaType === "video"
                        ? "Paste video MP4 URL or YouTube link"
                        : "Paste image creative URL (or upload below)"
                    }
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="text-xs"
                  />

                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed rounded-xl border-border hover:bg-muted/40 cursor-pointer text-xs text-muted-foreground">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Uploading file..." : "Upload from Device"}</span>
                      </div>
                      <input
                        type="file"
                        accept={mediaType === "video" ? "video/*" : "image/*"}
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Call-to-Action Link or WhatsApp Number</Label>
                <Input
                  placeholder="https://wa.me/2348051454564"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Default support fallback is 08051454564.
                </p>
              </div>
            </div>

            {/* Policy & Guarantee Alert */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Admin Review &amp; Refund Policy:
              </p>
              <p>
                After successful checkout, your ad is submitted to the CMS for compliance review. Once approved, it broadcasts across designated feeds. If rejected for policy reasons, a full refund is issued within 24–48 hours.
              </p>
            </div>

            <Button
              onClick={handleStartPayment}
              disabled={adMutation.isPending || isUploading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold h-11 rounded-xl shadow-md text-sm gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay {formatCurrency(price)} &amp; Submit Ad
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold">Ad Submitted for Approval!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your campaign was created successfully. The admin moderation team will approve and publish it to the designated campus placement within hours.
              </p>
            </div>

            <Card className="glass-card bg-muted/30 max-w-sm mx-auto text-left text-xs p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placement:</span>
                <span className="font-semibold uppercase">{scope} ({duration})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold text-primary">{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Support Hotline:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">08051454564</span>
              </div>
            </Card>

            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-white text-xs px-6 h-10 rounded-xl"
            >
              Back to CampusHub
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdPlacementModal;
