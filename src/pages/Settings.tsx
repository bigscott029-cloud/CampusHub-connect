import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Eye,
  Moon,
  LogOut,
  Trash2,
} from "lucide-react";

const Settings = () => {
  const { signOut } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {/* Account Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Edit Profile</p>
              <p className="text-xs text-muted-foreground">Update your name, avatar, and bio</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy
          </CardTitle>
          <CardDescription>Control who can see your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Show Department</Label>
              <p className="text-xs text-muted-foreground">Display your department on your profile</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Show Level</Label>
              <p className="text-xs text-muted-foreground">Display your academic level</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Allow Anonymous DMs</Label>
              <p className="text-xs text-muted-foreground">Let anonymous users message you</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive email updates</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm">Message Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified for new messages</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium text-sm flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Dark Mode
              </Label>
              <p className="text-xs text-muted-foreground">Use dark theme</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg font-display text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-muted-foreground">Log out of your account</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
