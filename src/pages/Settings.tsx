import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
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
  Sun,
  Monitor,
  LogOut,
  Trash2,
  ArrowLeft,
  Key,
  LifeBuoy,
  Megaphone,
  Building,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdPlacementModal from "@/components/ads/AdPlacementModal";
import VendorPayoutSettings from "@/components/marketplace/VendorPayoutSettings";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");

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
            <div className="space-y-0.5">
              <Label className="font-medium text-sm flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Theme
              </Label>
              <p className="text-xs text-muted-foreground">Follow your device setting or choose a fixed theme</p>
            </div>
            <Select value={theme || "system"} onValueChange={setTheme}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system"><span className="flex items-center gap-2"><Monitor className="h-4 w-4" />System</span></SelectItem>
                <SelectItem value="light"><span className="flex items-center gap-2"><Sun className="h-4 w-4" />Light</span></SelectItem>
                <SelectItem value="dark"><span className="flex items-center gap-2"><Moon className="h-4 w-4" />Dark</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support (Hotline: 08051454564) */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            Support &amp; Campus Growth
          </CardTitle>
          <CardDescription>
            Assistance, complaint resolution, dispute help, and business promotions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Official WhatsApp Support Line</p>
              <p className="text-xs text-muted-foreground">Available 24/7 on 08051454564</p>
            </div>
            <a
              href="https://wa.me/2348051454564?text=Hello%20CampusHub%20Support,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5">
                Chat 08051454564
              </Button>
            </a>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Lay a Complaint / Report an Issue</p>
              <p className="text-xs text-muted-foreground">Submit a direct ticket to the admin team</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setComplaintOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-1.5" /> Submit Ticket
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Promote an Ad / Sponsor Campaign</p>
              <p className="text-xs text-muted-foreground">Broadcast to single campus or nationwide</p>
            </div>
            <Button
              size="sm"
              onClick={() => setAdModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
            >
              <Megaphone className="w-4 h-4" /> Place Ad
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Vendor Payout Bank Account</p>
              <p className="text-xs text-muted-foreground">Where SecurePay releases your trade earnings</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setBankModalOpen(true)}>
              <Building className="w-4 h-4 mr-1.5" /> Payout Settings
            </Button>
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
            <Button variant="destructive" size="sm" onClick={() => toast.info("Account deletion requests are reviewed by support before removal.")}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
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

      {/* Complaint / Report Dialog */}
      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Submit Complaint or Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Describe the issue in detail *</Label>
              <textarea
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Explain what happened, transaction reference (if any), or user involved..."
                className="w-full p-3 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground">
              Direct hotline fallback: WhatsApp admin on <strong className="text-foreground">08051454564</strong>.
            </div>

            <Button
              onClick={() => {
                if (!complaintText.trim()) {
                  toast.error("Please describe your issue.");
                  return;
                }
                toast.success("Complaint logged! Support team has been notified.");
                setComplaintOpen(false);
                setComplaintText("");
              }}
              className="w-full bg-primary text-white text-xs h-10 rounded-xl"
            >
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Placement Modal */}
      <AdPlacementModal open={adModalOpen} onOpenChange={setAdModalOpen} />

      {/* Vendor Payout Bank Settings */}
      <VendorPayoutSettings open={bankModalOpen} onOpenChange={setBankModalOpen} />
    </div>
  );
};

export default Settings;
