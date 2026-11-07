import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building,
  AlertTriangle,
  ArrowRight,
  Sparkles,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { launchPaystackCheckout } from "@/lib/paystack";
import { useAuth } from "@/hooks/useAuth";

interface SecurePayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    price: number;
    sellerId: string;
    sellerName: string;
    sellerPhone?: string;
  } | null;
  onOrderCreated?: (orderId: string) => void;
}

export const SecurePayModal = ({
  open,
  onOpenChange,
  product,
  onOrderCreated,
}: SecurePayModalProps) => {
  const { user } = useAuth();
  const [method, setMethod] = useState<"secure_pay" | "in_person">("secure_pay");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product) return null;

  // 2.5% Buyer Protection Escrow Fee (minimum ₦300, maximum ₦2,500)
  const protectionFee = Math.min(2500, Math.max(300, Math.round(product.price * 0.025)));
  const totalAmount = method === "secure_pay" ? product.price + protectionFee : product.price;

  const handleStartCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed with this purchase.");
      return;
    }

    if (method === "in_person") {
      // In-person meetup fallback
      const waUrl = `https://wa.me/${product.sellerPhone?.replace(/[^0-9]/g, "") || "2348051454564"}?text=${encodeURIComponent(
        `Hello ${product.sellerName}, I am interested in buying "${product.title}" (${formatCurrency(product.price)}) on CampusHub Connect. Let's arrange a physical inspection at a public campus spot.`
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      toast.success("Opened seller WhatsApp chat for physical inspection.");
      onOpenChange(false);
      return;
    }

    // SecurePay Escrow via Paystack
    setIsProcessing(true);
    launchPaystackCheckout({
      email: user.email || "buyer@campushub.ng",
      amount: totalAmount,
      purpose: "secure_pay_escrow",
      referenceId: product.id,
      metadata: {
        productTitle: product.title,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        protectionFee,
      },
      onSuccess: (reference) => {
        setIsProcessing(false);
        const orderId = `order-${Date.now()}`;
        toast.success("Payment locked in SecurePay Escrow! Vendor notified to deliver.");
        onOrderCreated?.(orderId);
        onOpenChange(false);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-bold">
                CampusHub SecurePay Escrow
              </DialogTitle>
              <DialogDescription className="text-xs">
                Protect your student trade against fraud and ghost sellers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Product summary card */}
        <Card className="glass-card bg-muted/30 border-border/60">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{product.title}</p>
              <p className="text-[11px] text-muted-foreground">
                Seller: {product.sellerName}
              </p>
            </div>
            <p className="text-sm font-bold font-display text-primary shrink-0 ml-2">
              {formatCurrency(product.price)}
            </p>
          </CardContent>
        </Card>

        {/* Mode Selector */}
        <div className="space-y-3 pt-1">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Choose Transaction Security
          </Label>

          <div className="space-y-2">
            {/* Option A: SecurePay Escrow */}
            <button
              type="button"
              onClick={() => setMethod("secure_pay")}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                method === "secure_pay"
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/60 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  SecurePay Escrow (Recommended)
                </span>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                  100% Protected
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your payment is held safely by CampusHub until you physically inspect and confirm delivery.
              </p>
            </button>

            {/* Option B: Free in-person meetup */}
            <button
              type="button"
              onClick={() => setMethod("in_person")}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                method === "in_person"
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/60 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  In-Person Meetup &amp; Direct Chat
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Self Inspection
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Chat seller via WhatsApp/DM and inspect in a public campus space. Never send money in advance!
              </p>
            </button>
          </div>
        </div>

        {/* Pricing breakdown for SecurePay */}
        {method === "secure_pay" && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Item Price:</span>
              <span>{formatCurrency(product.price)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Buyer Protection Fee (2.5%):</span>
              <span>{formatCurrency(protectionFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/40">
              <span>Total in Escrow:</span>
              <span className="text-primary font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleStartCheckout}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold h-11 rounded-xl shadow-md text-sm gap-2"
        >
          {method === "secure_pay" ? (
            <>
              <Lock className="w-4 h-4" />
              Pay {formatCurrency(totalAmount)} to Escrow
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Open Seller WhatsApp Chat
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SecurePayModal;
