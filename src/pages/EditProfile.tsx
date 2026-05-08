import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  User,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const departments = ["Computer Science", "Medicine", "Engineering", "Law", "Business Administration", "Mass Communication", "Accounting", "Economics", "Other"];
const levels = ["100L", "200L", "300L", "400L", "500L", "600L", "Postgraduate"];

interface UniversityOption {
  id: string;
  name: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [universityChangeWarning, setUniversityChangeWarning] = useState(false);
  const [universityChangeCount, setUniversityChangeCount] = useState(0);
  const [initialUniversityId, setInitialUniversityId] = useState("");
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    department: "",
    level: "",
    universityId: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsBootstrapping(true);

      const [{ data: profile }, { data: universityOptions }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("universities").select("id, name").order("name"),
      ]);

      if (profile) {
        setFormData({
          displayName: profile.display_name || "",
          bio: profile.bio || "",
          avatarUrl: profile.avatar_url || "",
          department: profile.department || "",
          level: profile.level || "",
          universityId: profile.university_id || "",
        });
        setInitialUniversityId(profile.university_id || "");
        setUniversityChangeCount(profile.university_change_count || 0);
      }

      setUniversities(universityOptions || []);
      setIsBootstrapping(false);
    };

    loadProfile();
  }, [user]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: loadEvent.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUniversitySelect = (value: string) => {
    if (initialUniversityId && value !== initialUniversityId && value !== formData.universityId) {
      setUniversityChangeWarning(true);
    }

    setFormData((prev) => ({ ...prev, universityId: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const universityChanged = formData.universityId !== initialUniversityId;
    const isTrackedUniversityChange = Boolean(initialUniversityId) && universityChanged;

    if (isTrackedUniversityChange && universityChangeCount >= 2) {
      toast.error("You have reached the university change limit. An admin request has been created.");
      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "university_verification",
        status: "pending",
      });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "University change needs review",
        description: "An admin needs to verify additional university changes on your account.",
        type: "warning",
        is_important: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Record<string, string | number | null> = {
        display_name: formData.displayName,
        bio: formData.bio || null,
        avatar_url: formData.avatarUrl || null,
        department: formData.department || null,
        level: formData.level || null,
        university_id: formData.universityId || null,
      };

      if (isTrackedUniversityChange) {
        updateData.university_change_count = universityChangeCount + 1;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                    {formData.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Click avatar to upload from device</p>
                <p className="text-xs text-muted-foreground">Or enter a URL below</p>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl.startsWith("data:") ? "" : formData.avatarUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                placeholder="Your display name"
                value={formData.displayName}
                onChange={(event) => setFormData((prev) => ({ ...prev, displayName: event.target.value }))}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>University</Label>
              <Select
                value={formData.universityId || "__none__"}
                onValueChange={(value) => handleUniversitySelect(value === "__none__" ? "" : value)}
                disabled={isBootstrapping}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No university selected</SelectItem>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              University Change Policy
            </CardTitle>
            <CardDescription>
              You have {Math.max(0, 2 - universityChangeCount)} tracked university change(s) remaining before manual admin review is required.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The first time you set a university does not count toward the limit. Switching from one existing university to another does.
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isLoading || isBootstrapping}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <AlertDialog open={universityChangeWarning} onOpenChange={setUniversityChangeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              University Change Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have used {universityChangeCount} of 2 tracked university changes. Additional changes after the limit require admin review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.info(`You have ${Math.max(0, 2 - universityChangeCount)} tracked change(s) remaining.`)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProfile;
