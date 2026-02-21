import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Eye,
  Moon,
  LogOut,
  Trash2,
  ArrowLeft,
  Key,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setChangePasswordOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><SettingsIcon className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {/* Account */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2"><User className="w-5 h-5" />Account</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Edit Profile</p><p className="text-xs text-muted-foreground">Update your name, avatar, and bio</p></div>
            <Button variant="outline" size="sm" onClick={() => navigate("/profile/edit")}>Edit</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Change Password</p><p className="text-xs text-muted-foreground">Update your password</p></div>
            <Button variant="outline" size="sm" onClick={() => setChangePasswordOpen(true)}><Key className="w-4 h-4 mr-1" />Change</Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Shield className="w-5 h-5" />Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Show Department</Label><p className="text-xs text-muted-foreground">Display your department on your profile</p></div><Switch defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Show Level</Label><p className="text-xs text-muted-foreground">Display your academic level</p></div><Switch defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Allow Anonymous DMs</Label><p className="text-xs text-muted-foreground">Let anonymous users message you</p></div><Switch defaultChecked /></div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Push Notifications</Label></div><Switch defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Email Notifications</Label></div><Switch /></div>
          <Separator />
          <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="font-medium text-sm">Message Notifications</Label></div><Switch defaultChecked /></div>
        </CardContent>
      </Card>

      {/* Appearance - Dark Mode */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Eye className="w-5 h-5" />Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label className="font-medium text-sm flex items-center gap-2"><Moon className="w-4 h-4" />Dark Mode</Label><p className="text-xs text-muted-foreground">Use dark theme</p></div>
            <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-destructive/30">
        <CardHeader><CardTitle className="text-lg font-display text-destructive flex items-center gap-2"><Trash2 className="w-5 h-5" />Danger Zone</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Sign Out</p></div>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm text-destructive">Delete Account</p></div>
            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>New Password</Label><Input type="password" placeholder="Enter new password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} /></div>
            <div><Label>Confirm New Password</Label><Input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
            <Button variant="hero" className="w-full" onClick={handleChangePassword}>Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
