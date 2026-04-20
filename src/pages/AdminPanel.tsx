import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Home,
  Users,
  ShoppingBag,
  Check,
  X,
  MessageCircle,
  Eye,
  Clock,
  AlertTriangle,
  CreditCard,
  ArrowUpCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "message">("approve");
  const [messageContent, setMessageContent] = useState("");
  const [hostelRequests, setHostelRequests] = useState<any[]>([]);
  const [roommateRequests, setRoommateRequests] = useState<any[]>([]);
  const [marketplaceRequests, setMarketplaceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { adminLogout, adminUsername } = useAdminAuth();
  const navigate = useNavigate();

  // Fetch admin requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Fetch hostel listings pending approval
      const { data: hostels, error: hostelError } = await supabase
        .from("hostel_listings")
        .select("id, title, price, location, status, created_at, user_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (hostelError) throw hostelError;

      // Fetch roommate requests pending approval
      const { data: roommates, error: roommateError } = await supabase
        .from("roommate_requests")
        .select("id, title, budget_min, budget_max, status, created_at, user_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (roommateError) throw roommateError;

      // Fetch marketplace listings pending approval
      const { data: marketplace, error: marketplaceError } = await supabase
        .from("marketplace_listings")
        .select("id, title, price, category, is_urgent, status, created_at, user_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (marketplaceError) throw marketplaceError;

      setHostelRequests(hostels || []);
      setRoommateRequests(roommates || []);
      setMarketplaceRequests(marketplace || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load admin requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: "hostel" | "roommate" | "marketplace") => {
    try {
      const table = type === "hostel" ? "hostel_listings" : type === "roommate" ? "roommate_requests" : "marketplace_listings";
      const { error } = await supabase.from(table).update({ status: "approved" }).eq("id", id);

      if (error) throw error;

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} approved!`);
      await fetchRequests();
      setActionDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string, type: "hostel" | "roommate" | "marketplace") => {
    try {
      const table = type === "hostel" ? "hostel_listings" : type === "roommate" ? "roommate_requests" : "marketplace_listings";
      const { error } = await supabase.from(table).update({ status: "rejected" }).eq("id", id);

      if (error) throw error;

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected`);
      await fetchRequests();
      setActionDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleAction = (request: any, type: "approve" | "reject" | "message", requestType: "hostel" | "roommate" | "marketplace") => {
    setSelectedRequest({ ...request, requestType });
    setActionType(type);
    setActionDialogOpen(true);
    
    if (type === "message") {
      setMessageContent(`Hi,\n\nRegarding your listing: "${request.title}"\n\n`);
    }
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      if (actionType === "approve") {
        await handleApprove(selectedRequest.id, selectedRequest.requestType);
      } else if (actionType === "reject") {
        await handleReject(selectedRequest.id, selectedRequest.requestType);
      } else if (actionType === "message") {
        toast.success("Message feature coming soon!");
      }
    } catch (error) {
      console.error("Error in confirmAction:", error);
    }
  };

  const renderRequestCard = (request: any, type: "hostel" | "roommate" | "marketplace") => {
    const title = request.title || "Untitled";
    const createdAt = request.created_at ? new Date(request.created_at).toLocaleDateString() : "Unknown";
    const price = request.price || request.budget_max || 0;
    const getInitial = () => (title.charAt(0) || "U").toUpperCase();

    return (
      <Card key={request.id} className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">ID: {request.id}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {createdAt}
                  </span>
                  {price > 0 && (
                    <span className="font-medium text-foreground">₦{(price / 1000).toFixed(0)}K</span>
                  )}
                  {request.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={request.status === "pending" ? "secondary" : "default"}>
              {request.status || "pending"}
            </Badge>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={() => handleAction(request, "message", type)}>
              <MessageCircle className="w-4 h-4 mr-1" />
              Message User
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <div className="flex-1" />
            <Button variant="destructive" size="sm" onClick={() => handleAction(request, "reject", type)}>
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button variant="default" size="sm" onClick={() => handleAction(request, "approve", type)}>
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Welcome, {adminUsername}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{hostelRequests.length}</p>
            <p className="text-sm text-muted-foreground">Hostel Listings</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{roommateRequests.length}</p>
            <p className="text-sm text-muted-foreground">Roommate Requests</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{marketplaceRequests.length}</p>
            <p className="text-sm text-muted-foreground">Marketplace Posts</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent">
              {hostelRequests.length + roommateRequests.length + marketplaceRequests.length}
            </p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hostel" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="hostel" className="gap-1">
            <Home className="w-4 h-4" />
            Hostels ({hostelRequests.length})
          </TabsTrigger>
          <TabsTrigger value="roommates" className="gap-1">
            <Users className="w-4 h-4" />
            Roommates ({roommateRequests.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1">
            <ShoppingBag className="w-4 h-4" />
            Marketplace ({marketplaceRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hostel" className="space-y-4">
          {hostelRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending hostel listings</p>
              </CardContent>
            </Card>
          ) : (
            hostelRequests.map((request) => renderRequestCard(request, "hostel"))
          )}
        </TabsContent>

        <TabsContent value="roommates" className="space-y-4">
          {roommateRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending roommate requests</p>
              </CardContent>
            </Card>
          ) : (
            roommateRequests.map((request) => renderRequestCard(request, "roommate"))
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          {marketplaceRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending marketplace posts</p>
              </CardContent>
            </Card>
          ) : (
            marketplaceRequests.map((request) => renderRequestCard(request, "marketplace"))
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Listing"}
              {actionType === "reject" && "Reject Listing"}
              {actionType === "message" && "Send Message"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "This listing will be visible to all users."}
              {actionType === "reject" && "The user will be notified of the rejection."}
              {actionType === "message" && "Send a direct message to the user."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "message" ? (
            <div className="space-y-4">
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                placeholder="Type your message..."
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmAction}>Send Message</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "reject" ? "destructive" : "default"}
                onClick={confirmAction}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
