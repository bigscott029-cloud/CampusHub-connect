import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

// Mock data for admin requests
const mockHostelRequests = [
  {
    id: 1,
    user: { name: "Tunde Adebayo", email: "tunde@demo.edu.ng", avatar: "T" },
    title: "Spacious Self-Contain Near Campus",
    price: 350000,
    location: "Campus Gate Area",
    status: "pending",
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    user: { name: "Amaka Obi", email: "amaka@demo.edu.ng", avatar: "A" },
    title: "2-Bedroom Flat - Newly Built",
    price: 550000,
    location: "Off Campus Road",
    status: "pending",
    createdAt: "5 hours ago",
  },
];

const mockRoommateRequests = [
  {
    id: 1,
    user: { name: "John Doe", email: "john@demo.edu.ng", avatar: "J" },
    title: "400L CSC student looking for quiet roommate",
    budget: "200K - 300K",
    status: "pending",
    createdAt: "1 hour ago",
  },
];

const mockMarketplaceRequests = [
  {
    id: 1,
    user: { name: "Mike Johnson", email: "mike@demo.edu.ng", avatar: "M" },
    title: "iPhone 13 Pro - 256GB",
    price: 450000,
    isUrgent: true,
    status: "pending",
    createdAt: "3 hours ago",
  },
];

const AdminPanel = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "message">("approve");
  const [messageContent, setMessageContent] = useState("");

  const handleAction = (request: any, type: "approve" | "reject" | "message") => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialogOpen(true);
    
    if (type === "message") {
      setMessageContent(`Hi ${request.user.name},\n\nRegarding your listing: "${request.title}"\n\n`);
    }
  };

  const confirmAction = () => {
    if (actionType === "approve") {
      toast.success(`Listing "${selectedRequest.title}" has been approved!`);
    } else if (actionType === "reject") {
      toast.success(`Listing "${selectedRequest.title}" has been rejected.`);
    } else {
      toast.success("Message sent successfully!");
    }
    setActionDialogOpen(false);
    setSelectedRequest(null);
    setMessageContent("");
  };

  const renderRequestCard = (request: any, type: string) => (
    <Card key={request.id} className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {request.user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{request.title}</h3>
              <p className="text-sm text-muted-foreground">by {request.user.name}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {request.createdAt}
                </span>
                {request.price && (
                  <span className="font-medium text-foreground">₦{(request.price / 1000).toFixed(0)}K</span>
                )}
                {request.budget && (
                  <span className="font-medium text-foreground">₦{request.budget}</span>
                )}
                {request.isUrgent && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Badge variant={request.status === "pending" ? "secondary" : "default"}>
            {request.status}
          </Badge>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={() => handleAction(request, "message")}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Message User
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" onClick={() => handleAction(request, "reject")}>
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button variant="default" size="sm" onClick={() => handleAction(request, "approve")}>
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>

        {request.isUrgent && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" className="flex-1">
              <CreditCard className="w-4 h-4 mr-1" />
              Proceed to Payment
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              Upgrade Tier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage listings and user requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{mockHostelRequests.length}</p>
            <p className="text-sm text-muted-foreground">Hostel Listings</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{mockRoommateRequests.length}</p>
            <p className="text-sm text-muted-foreground">Roommate Requests</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{mockMarketplaceRequests.length}</p>
            <p className="text-sm text-muted-foreground">Marketplace Posts</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent">
              {mockHostelRequests.length + mockRoommateRequests.length + mockMarketplaceRequests.length}
            </p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hostel" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="hostel" className="gap-1">
            <Home className="w-4 h-4" />
            Hostels ({mockHostelRequests.length})
          </TabsTrigger>
          <TabsTrigger value="roommates" className="gap-1">
            <Users className="w-4 h-4" />
            Roommates ({mockRoommateRequests.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1">
            <ShoppingBag className="w-4 h-4" />
            Marketplace ({mockMarketplaceRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hostel" className="space-y-4">
          {mockHostelRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending hostel listings</p>
              </CardContent>
            </Card>
          ) : (
            mockHostelRequests.map((request) => renderRequestCard(request, "hostel"))
          )}
        </TabsContent>

        <TabsContent value="roommates" className="space-y-4">
          {mockRoommateRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending roommate requests</p>
              </CardContent>
            </Card>
          ) : (
            mockRoommateRequests.map((request) => renderRequestCard(request, "roommate"))
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          {mockMarketplaceRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending marketplace posts</p>
              </CardContent>
            </Card>
          ) : (
            mockMarketplaceRequests.map((request) => renderRequestCard(request, "marketplace"))
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
