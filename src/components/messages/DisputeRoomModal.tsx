import { useState } from "react";
import {
  ShieldAlert,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Send,
  Lock,
  User,
  Scale,
  X,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface DisputeMessage {
  id: string;
  sender: "buyer" | "vendor" | "admin";
  senderName: string;
  text: string;
  time: string;
}

interface DisputeRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    itemTitle: string;
    amount: number;
    buyerName: string;
    vendorName: string;
    disputeReason?: string;
  } | null;
  isAdmin?: boolean;
  onResolve?: (action: "refund" | "release" | "reengage") => void;
}

export const DisputeRoomModal = ({
  open,
  onOpenChange,
  order,
  isAdmin = false,
  onResolve,
}: DisputeRoomModalProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisputeMessage[]>([
    {
      id: "m-1",
      sender: "admin",
      senderName: "CampusHub Support",
      text: "Notice: This dispute room is recorded by CampusHub Support for fraud prevention and legal compliance. Please state the delivery and inspection state of the item.",
      time: "Just now",
    },
  ]);
  const [newText, setNewText] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  if (!order) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const role: "buyer" | "vendor" | "admin" = isAdmin ? "admin" : "buyer";
    const senderName = isAdmin
      ? "Support Admin (Lead)"
      : user?.user_metadata?.display_name || "Buyer";

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: role,
        senderName,
        text: newText.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setNewText("");
  };

  const handleAdminAction = (action: "refund" | "release" | "reengage") => {
    if (action === "reengage") {
      toast.success("Delivery prompt re-engaged! Sent to buyer DM for instant re-confirmation.");
    } else if (action === "refund") {
      toast.success("Dispute resolved: Buyer refund queued for 24–48hr release.");
    } else {
      toast.success("Dispute resolved: Funds authorized for payout to vendor's bank account.");
    }
    onResolve?.(action);
    setShowConfirmClose(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] flex flex-col p-0 rounded-2xl overflow-hidden bg-background">
        {/* Header */}
        <div className="p-4 bg-muted/60 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-display font-bold flex items-center gap-2">
                  SecurePay Dispute Resolution Space
                  <Badge variant="destructive" className="text-[10px]">Active Review</Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Order #{order.id} &bull; {order.itemTitle} ({formatCurrency(order.amount)})
                </DialogDescription>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Legal disclaimer banner */}
          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>This space is actively recorded and logged for verification against fraud.</span>
          </div>
        </div>

        {/* Dispute Details Card */}
        <div className="px-4 py-2 bg-muted/20 border-b border-border/40 text-xs flex items-center justify-between text-muted-foreground">
          <span>Buyer: <strong className="text-foreground">{order.buyerName}</strong></span>
          <span>Vendor: <strong className="text-foreground">{order.vendorName}</strong></span>
          <span>Escrow: <strong className="text-primary font-mono">{formatCurrency(order.amount)}</strong></span>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px] max-h-[340px]">
          {messages.map((m) => {
            const isAdminMsg = m.sender === "admin";
            const isSelf = (!isAdmin && m.sender === "buyer") || (isAdmin && m.sender === "admin");

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <span>{m.senderName}</span>
                  <span>&bull;</span>
                  <span>{m.time}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isAdminMsg
                      ? "bg-amber-500/15 border border-amber-500/30 text-foreground"
                      : isSelf
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* ADMIN SUPER CONTROLS (Only visible to admin, as requested) */}
        {isAdmin && (
          <div className="p-3 bg-card border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <Scale className="w-3.5 h-3.5" />
                Admin Dispute Actions (Confidential Console):
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">Support Hotline: 08051454564</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdminAction("reengage")}
                className="text-xs h-9 border-blue-500/40 text-blue-600 hover:bg-blue-500/10 gap-1"
                title="Resend delivery confirmation prompt to buyer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-engage
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdminAction("refund")}
                className="text-xs h-9 border-red-500/40 text-red-600 hover:bg-red-500/10 gap-1"
                title="Refund buyer within 24-48 hours"
              >
                <XCircle className="w-3.5 h-3.5" />
                Refund Buyer
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdminAction("release")}
                className="text-xs h-9 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1"
                title="Credit vendor bank account"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pay Vendor
              </Button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 flex items-center gap-2 bg-background">
          <Input
            placeholder="Type your explanation or evidence..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="text-xs h-10"
          />
          <Button type="submit" size="sm" className="h-10 px-4 bg-primary text-white">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeRoomModal;
