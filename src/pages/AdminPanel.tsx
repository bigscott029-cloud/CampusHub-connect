/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [anonymousReports, setAnonymousReports] = useState<any[]>([]);
  const [studentVerificationRequests, setStudentVerificationRequests] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
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
        .select("id, title, price, total_student_price, student_service_fee_amount, escrow_status, location, status, created_at, user_id")
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
        .select("id, title, price, category, is_urgent, status, created_at, user_id, listing_plan, platform_fee_amount, payment_status, target_scope")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (marketplaceError) throw marketplaceError;

      const { data: reports, error: reportsError } = await (supabase as any)
        .from("anonymous_reports")
        .select("id, post_id, reporter_id, reason, details, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      const { data: studentVerifications, error: studentVerificationError } = await (supabase as any)
        .from("student_verification_requests")
        .select("id, user_id, university_id, matric_number, student_id_number, document_url, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (studentVerificationError) throw studentVerificationError;

      const { data: agents, error: agentError } = await (supabase as any)
        .from("agent_verification_requests")
        .select("id, user_id, university_id, legal_name, phone_number, business_name, fee_amount, status, created_at")
        .in("status", ["pending_payment", "pending_review"])
        .order("created_at", { ascending: false });

      if (agentError) throw agentError;

      setHostelRequests(hostels || []);
      setRoommateRequests(roommates || []);
      setMarketplaceRequests(marketplace || []);
      setAnonymousReports(reports || []);
      setStudentVerificationRequests(studentVerifications || []);
      setAgentRequests(agents || []);
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
      const request = [...hostelRequests, ...roommateRequests, ...marketplaceRequests].find((item) => item.id === id);
      const updateData: Record<string, string> = { status: "approved" };

      if (type === "marketplace" && request?.listing_plan === "upfront_fee") {
        updateData.payment_status = "paid";
      }

      if (type === "hostel") {
        updateData.escrow_status = "pending_payment";
      }

      const { error } = await (supabase as any).from(table).update(updateData).eq("id", id);

      if (error) throw error;

      if (request?.user_id) {
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          title: "Request approved",
          description: `Your ${type} submission has been approved and is now live.`,
          type: "admin",
          is_important: true,
          reference_type: type,
          reference_id: id,
        });
      }

      await supabase
        .from("admin_requests")
        .update({ status: "approved", admin_notes: "Approved from admin panel" })
        .eq("reference_id", id);

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

      const request = [...hostelRequests, ...roommateRequests, ...marketplaceRequests].find((item) => item.id === id);
      if (request?.user_id) {
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          title: "Request rejected",
          description: `Your ${type} submission was not approved. Please review the guidelines and try again.`,
          type: "admin",
          is_important: true,
          reference_type: type,
          reference_id: id,
        });
      }

      await supabase
        .from("admin_requests")
        .update({ status: "rejected", admin_notes: "Rejected from admin panel" })
        .eq("reference_id", id);

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
        if (!messageContent.trim()) {
          toast.error("Please type a message.");
          return;
        }

        await supabase.from("notifications").insert({
          user_id: selectedRequest.user_id,
          title: "Message from admin",
          description: messageContent.trim(),
          type: "admin",
          is_important: true,
          reference_type: selectedRequest.requestType,
          reference_id: selectedRequest.id,
        });
        toast.success("Admin notification sent.");
        setActionDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in confirmAction:", error);
    }
  };

  const promoteToSubAdmin = async (request: any) => {
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: roleError } = await (supabase as any)
        .from("user_roles")
        .upsert({ user_id: request.user_id, role: "sub_admin" }, { onConflict: "user_id,role" });

      if (roleError) throw roleError;

      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .update({ verified_badge: true, sub_admin_expires_at: expiresAt.toISOString() })
        .eq("user_id", request.user_id);

      if (profileError) throw profileError;

      await (supabase as any).from("user_subscriptions").upsert({
        user_id: request.user_id,
        plan_type: "sub_admin",
        provider: "manual",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: expiresAt.toISOString(),
      }, { onConflict: "user_id,plan_type" });

      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: "Sub-admin access activated",
        description: "Your verified vendor badge and sub-admin access are active for this billing period.",
        type: "subscription",
        is_important: true,
      });

      toast.success("User promoted to sub-admin for one month.");
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user.");
    }
  };

  const resolveReport = async (report: any, status: "resolved" | "dismissed") => {
    try {
      const { error } = await (supabase as any)
        .from("anonymous_reports")
        .update({ status, admin_notes: `${status} from admin panel` })
        .eq("id", report.id);

      if (error) throw error;
      toast.success(`Report ${status}.`);
      await fetchRequests();
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Failed to update report.");
    }
  };

  const resolveStudentVerification = async (request: any, status: "verified" | "rejected") => {
    try {
      const { error } = await (supabase as any)
        .from("student_verification_requests")
        .update({ status, admin_notes: `${status} from admin panel` })
        .eq("id", request.id);

      if (error) throw error;

      await (supabase as any)
        .from("profiles")
        .update({
          student_verification_status: status,
          matric_number: request.matric_number || null,
          student_id_number: request.student_id_number || null,
          verification_document_url: request.document_url || null,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        })
        .eq("user_id", request.user_id);

      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: status === "verified" ? "Student verification approved" : "Student verification rejected",
        description: status === "verified" ? "You can now submit housing and roommate posts." : "Please review your student details and submit again.",
        type: "verification",
        is_important: true,
      });

      await supabase
        .from("admin_requests")
        .update({ status, admin_notes: `${status} from student verification panel` })
        .eq("reference_id", request.id);

      toast.success(`Student verification ${status}.`);
      await fetchRequests();
    } catch (error) {
      console.error("Error resolving student verification:", error);
      toast.error("Failed to update student verification.");
    }
  };

  const resolveAgentRequest = async (request: any, status: "verified" | "rejected") => {
    try {
      const { error } = await (supabase as any)
        .from("agent_verification_requests")
        .update({ status, admin_notes: `${status} from admin panel` })
        .eq("id", request.id);

      if (error) throw error;

      await (supabase as any)
        .from("profiles")
        .update({
          agent_verification_status: status,
          verified_badge: status === "verified",
          agent_paid_at: status === "verified" ? new Date().toISOString() : null,
        })
        .eq("user_id", request.user_id);

      if (status === "verified") {
        await (supabase as any)
          .from("user_roles")
          .upsert({ user_id: request.user_id, role: "sub_admin" }, { onConflict: "user_id,role" });
      }

      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: status === "verified" ? "Verified agent approved" : "Agent verification rejected",
        description: status === "verified" ? "Your verified badge is active. Listing limits now apply to your account." : "Your agent verification was not approved.",
        type: "verification",
        is_important: true,
      });

      await supabase
        .from("admin_requests")
        .update({ status, admin_notes: `${status} from agent verification panel` })
        .eq("reference_id", request.id);

      toast.success(`Agent request ${status}.`);
      await fetchRequests();
    } catch (error) {
      console.error("Error resolving agent request:", error);
      toast.error("Failed to update agent request.");
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
                {type === "marketplace" && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{request.listing_plan || "commission"}</Badge>
                    <Badge variant="outline">{request.target_scope || "local"}</Badge>
                    <Badge variant={request.payment_status === "paid" || request.payment_status === "not_required" ? "secondary" : "destructive"}>
                      {request.payment_status || "not_required"}
                    </Badge>
                    {Number(request.platform_fee_amount ?? 0) > 0 && (
                      <Badge variant="secondary">Fee ₦{Number(request.platform_fee_amount).toLocaleString()}</Badge>
                    )}
                  </div>
                )}
                {type === "hostel" && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {Number(request.student_service_fee_amount ?? 0) > 0 && (
                      <Badge variant="secondary">Student fee ₦{Number(request.student_service_fee_amount).toLocaleString()}</Badge>
                    )}
                    {Number(request.total_student_price ?? 0) > 0 && (
                      <Badge variant="outline">Total ₦{Number(request.total_student_price).toLocaleString()}</Badge>
                    )}
                    <Badge variant="outline">{request.escrow_status || "not_started"}</Badge>
                  </div>
                )}
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
            <Button variant="outline" size="sm" onClick={() => toast.info("Review details are shown in this card.")}>
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => promoteToSubAdmin(request)}>
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              Sub-admin
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
              {hostelRequests.length + roommateRequests.length + marketplaceRequests.length + anonymousReports.length + studentVerificationRequests.length + agentRequests.length}
            </p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hostel" className="space-y-6">
        <TabsList className="h-auto flex-wrap bg-muted/50 p-1">
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
          <TabsTrigger value="reports" className="gap-1">
            <AlertTriangle className="w-4 h-4" />
            Reports ({anonymousReports.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-1">
            <Shield className="w-4 h-4" />
            Students ({studentVerificationRequests.length})
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-1">
            <CreditCard className="w-4 h-4" />
            Agents ({agentRequests.length})
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

        <TabsContent value="reports" className="space-y-4">
          {anonymousReports.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending anonymous reports</p>
              </CardContent>
            </Card>
          ) : (
            anonymousReports.map((report) => (
              <Card key={report.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{report.reason}</h3>
                      <p className="text-sm text-muted-foreground">Post: {report.post_id}</p>
                      {report.details && <p className="text-sm mt-2">{report.details}</p>}
                    </div>
                    <Badge variant="secondary">{report.status}</Badge>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 border-t border-border/50 pt-4">
                    <Button variant="outline" size="sm" onClick={() => resolveReport(report, "dismissed")}>Dismiss</Button>
                    <Button variant="destructive" size="sm" onClick={() => resolveReport(report, "resolved")}>Resolve</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {studentVerificationRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending student verifications</p>
              </CardContent>
            </Card>
          ) : (
            studentVerificationRequests.map((request) => (
              <Card key={request.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Student Verification</h3>
                      <p className="text-sm text-muted-foreground">User: {request.user_id}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        {request.matric_number && <p>Matric: {request.matric_number}</p>}
                        {request.student_id_number && <p>Student ID: {request.student_id_number}</p>}
                        {request.document_url && (
                          <a href={request.document_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            View document
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 border-t border-border/50 pt-4">
                    <Button variant="destructive" size="sm" onClick={() => resolveStudentVerification(request, "rejected")}>Reject</Button>
                    <Button size="sm" onClick={() => resolveStudentVerification(request, "verified")}>Verify Student</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          {agentRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending agent requests</p>
              </CardContent>
            </Card>
          ) : (
            agentRequests.map((request) => (
              <Card key={request.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{request.legal_name}</h3>
                      <p className="text-sm text-muted-foreground">User: {request.user_id}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Phone: {request.phone_number}</p>
                        {request.business_name && <p>Business: {request.business_name}</p>}
                        <p>One-time fee: ₦{Number(request.fee_amount ?? 20000).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 border-t border-border/50 pt-4">
                    <Button variant="destructive" size="sm" onClick={() => resolveAgentRequest(request, "rejected")}>Reject</Button>
                    <Button size="sm" onClick={() => resolveAgentRequest(request, "verified")}>Approve Agent</Button>
                  </div>
                </CardContent>
              </Card>
            ))
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
