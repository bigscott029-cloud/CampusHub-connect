import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  MapPin,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const preferenceOptions = [
  "Non-smoker",
  "Quiet",
  "Clean",
  "Early riser",
  "Night owl",
  "Studious",
  "Friendly",
  "Religious",
  "LGBTQ+ friendly",
  "Pet-friendly",
];

const CreateRoommateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    preferredLocation: "",
    preferences: [] as string[],
  });

  const togglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.budgetMin || !formData.budgetMax) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("roommate_requests").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        budget_min: parseFloat(formData.budgetMin),
        budget_max: parseFloat(formData.budgetMax),
        preferred_location: formData.preferredLocation,
        preferences: formData.preferences.join(", "),
        status: "pending",
      });

      if (error) throw error;

      // Create admin request
      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "roommate_request",
        status: "pending",
      });

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Request Submitted",
        description: "Your roommate request is being reviewed by an admin.",
        type: "listing",
        is_important: true,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold">Request Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your roommate request is being reviewed. You'll receive a notification once it's approved.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/hostel")}>
                View Listings
              </Button>
              <Button variant="hero" onClick={() => navigate("/notifications")}>
                Check Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Find a Roommate</h1>
            <p className="text-sm text-muted-foreground">Post your roommate request</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">About You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., 300L Computer Science student looking for roommate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">About You & What You're Looking For</Label>
              <Textarea
                id="description"
                placeholder="Tell potential roommates about yourself, your lifestyle, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Budget Range</CardTitle>
            <CardDescription>Your preferred rent budget per year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Minimum (₦) *</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="budgetMax">Maximum (₦) *</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="e.g., 300000"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Preferred Location</Label>
              <Input
                id="location"
                placeholder="e.g., Near campus gate, Student Village"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Your Preferences</CardTitle>
            <CardDescription>Select traits that describe you or what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map((pref) => (
                <Badge
                  key={pref}
                  variant={formData.preferences.includes(pref) ? "default" : "outline"}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => togglePreference(pref)}
                >
                  {formData.preferences.includes(pref) && <CheckCircle className="w-3 h-3 mr-1" />}
                  {pref}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoommateRequest;
