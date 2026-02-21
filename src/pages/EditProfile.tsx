import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, User, Camera, AlertTriangle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect } from "react";

const departments = ["Computer Science", "Medicine", "Engineering", "Law", "Business Administration", "Mass Communication", "Accounting", "Economics", "Other"];
const levels = ["100L", "200L", "300L", "400L", "500L", "600L", "Postgraduate"];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [universityChangeWarning, setUniversityChangeWarning] = useState(false);
  const [universityChangeCount, setUniversityChangeCount] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ displayName: "", bio: "", avatarUrl: "", department: "", level: "", universityId: "" });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setFormData({ displayName: data.display_name || "", bio: data.bio || "", avatarUrl: data.avatar_url || "", department: data.department || "", level: data.level || "", universityId: data.university_id || "" });
        setUniversityChangeCount(data.university_change_count || 0);
      }
    };
    loadProfile();
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setFormData({ ...formData, avatarUrl: ev.target?.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleUniversityChange = () => {
    if (universityChangeCount >= 2) {
      toast.error("You've reached the maximum university changes. This requires admin verification.");
      if (user) {
        supabase.from("admin_requests").insert({ user_id: user.id, request_type: "university_verification", status: "pending" });
        supabase.from("notifications").insert({ user_id: user.id, title: "Verification Required", description: "Your university change request requires admin verification.", type: "warning", is_important: true });
      }
      return;
    }
    setUniversityChangeWarning(true);
  };

  const confirmUniversityChange = () => {
    setUniversityChangeWarning(false);
    toast.info(`You have ${2 - universityChangeCount} university change(s) remaining.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const updateData: Record<string, any> = { display_name: formData.displayName, bio: formData.bio, department: formData.department, level: formData.level };
      if (formData.avatarUrl.startsWith("http")) updateData.avatar_url = formData.avatarUrl;
      const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
          <div><h1 className="text-2xl font-display font-bold">Edit Profile</h1><p className="text-sm text-muted-foreground">Update your personal information</p></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Profile Picture</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">{formData.displayName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Camera className="w-4 h-4 text-primary-foreground" /></div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Click avatar to upload from device</p>
                <p className="text-xs text-muted-foreground">Or enter a URL below</p>
                <Input placeholder="https://example.com/avatar.jpg" value={formData.avatarUrl.startsWith("data:") ? "" : formData.avatarUrl} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Display Name</Label><Input placeholder="Your display name" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea placeholder="Tell others about yourself..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} /></div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Academic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Department</Label><Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Level</Label><Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />University</CardTitle>
            <CardDescription>You can only change your university {2 - universityChangeCount} more time(s). After that, admin verification is required.</CardDescription>
          </CardHeader>
          <CardContent><Button type="button" variant="outline" onClick={handleUniversityChange} disabled={universityChangeCount >= 2}>{universityChangeCount >= 2 ? "Requires Admin Verification" : "Change University"}</Button></CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>

      <AlertDialog open={universityChangeWarning} onOpenChange={setUniversityChangeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />University Change Warning</AlertDialogTitle>
            <AlertDialogDescription>You have used {universityChangeCount} of 2 allowed university changes. After the second change, any further modifications will require admin verification.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmUniversityChange}>I Understand, Proceed</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProfile;
