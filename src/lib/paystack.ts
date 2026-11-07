import { toast } from "sonner";

export interface PaystackCheckoutOptions {
  email: string;
  amount: number; // in NGN (Naira)
  purpose:
    | "agent_verification"
    | "marketplace_upfront_fee"
    | "ad_campaign_sponsorship"
    | "hostel_listing_boost"
    | "secure_pay_escrow";
  referenceId: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    if ((window as unknown as { PaystackPop?: unknown }).PaystackPop) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const launchPaystackCheckout = async ({
  email,
  amount,
  purpose,
  referenceId,
  metadata = {},
  onSuccess,
  onClose,
}: PaystackCheckoutOptions) => {
  const paystackKey =
    (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined) ||
    "pk_live_campushub_placeholder_key";

  const hasScript = await loadPaystackScript();

  const txRef = `CH-${purpose.replace(/_/g, "-").toUpperCase()}-${referenceId.slice(0, 8)}-${Date.now()}`;

  const paystackHandler = (window as unknown as { PaystackPop?: { setup: (opts: unknown) => { openIframe: () => void } } })
    .PaystackPop;

  if (hasScript && paystackHandler && paystackKey && !paystackKey.includes("placeholder")) {
    const handler = paystackHandler.setup({
      key: paystackKey,
      email,
      amount: Math.round(amount * 100), // Paystack expects amount in kobo
      currency: "NGN",
      ref: txRef,
      metadata: {
        custom_fields: [
          { display_name: "Purpose", variable_name: "purpose", value: purpose },
          { display_name: "Reference ID", variable_name: "reference_id", value: referenceId },
        ],
        ...metadata,
      },
      callback: (response: { reference: string }) => {
        toast.success("Payment verified successfully via Paystack!");
        onSuccess(response.reference);
      },
      onClose: () => {
        toast.info("Transaction cancelled.");
        onClose?.();
      },
    });

    handler.openIframe();
  } else {
    // If Paystack key is pending in .env or fails to load, gracefully prompt user and offer WhatsApp Instant Support
    toast.info("Opening instant checkout verification...");
    
    // Simulate prompt confirmation or WhatsApp fallback
    const fallbackMessage = encodeURIComponent(
      `Hello CampusHub Billing Team (08051454564),\nI want to complete payment:\nPurpose: ${purpose}\nAmount: ₦${amount.toLocaleString()}\nRef: ${txRef}`
    );
    const waUrl = `https://wa.me/2348051454564?text=${fallbackMessage}`;

    // Emulate successful client approval for test mode if on localhost/dev without key
    if (import.meta.env.DEV) {
      const confirmSim = window.confirm(
        `[Dev Test Mode] Paystack Key not set. Simulate successful payment of ₦${amount.toLocaleString()} for ${purpose}?`
      );
      if (confirmSim) {
        onSuccess(txRef);
        return;
      }
    }

    window.open(waUrl, "_blank", "noopener,noreferrer");
    onClose?.();
  }
};
