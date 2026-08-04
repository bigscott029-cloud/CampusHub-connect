import { toast } from "sonner";

export type PaymentPurpose =
  | "agent_verification"
  | "marketplace_upfront_fee"
  | "ad_campaign_sponsorship"
  | "hostel_listing_boost";

export const FIXED_PAYMENT_AMOUNTS: Record<PaymentPurpose, number> = {
  agent_verification: 20000,
  marketplace_upfront_fee: 1000,
  ad_campaign_sponsorship: 5000,
  hostel_listing_boost: 3000,
};

export interface PaymentLinkOptions {
  amount?: number;
  purpose: PaymentPurpose;
  referenceId?: string;
  customerEmail?: string | null;
  customerName?: string | null;
  paymentReference?: string;
}

export interface PaymentOpenResult {
  url: string;
  channel: "flutterwave" | "dm";
  label: string;
}

export const formatPaymentReference = (purpose: PaymentPurpose, referenceId?: string) => {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `CH-${purpose.replace(/_/g, "-").toUpperCase()}-${referenceId?.slice(0, 8) || "NEW"}-${suffix}`;
};

export const getEnforcedPaymentAmount = (purpose: PaymentPurpose, customAmount?: number): number => {
  return FIXED_PAYMENT_AMOUNTS[purpose] ?? customAmount ?? 1000;
};

export const getFlutterwavePaymentUrl = ({
  amount: customAmount,
  purpose,
  referenceId,
  customerEmail,
  customerName,
  paymentReference,
}: PaymentLinkOptions) => {
  const baseUrl = (import.meta.env.VITE_FLUTTERWAVE_PAYMENT_LINK_URL as string | undefined) || "https://flutterwave.com/pay/nt8rhfn1rmnm";
  const currency = (import.meta.env.VITE_FLUTTERWAVE_CURRENCY as string | undefined) || "NGN";
  const amount = getEnforcedPaymentAmount(purpose, customAmount);

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    toast.error("Flutterwave payment link is invalid. Falling back to WhatsApp support payment.");
    return null;
  }

  url.searchParams.set("amount", String(Math.round(amount)));
  url.searchParams.set("currency", currency);
  url.searchParams.set("tx_ref", paymentReference || formatPaymentReference(purpose, referenceId));
  url.searchParams.set("purpose", purpose);

  if (referenceId) url.searchParams.set("reference_id", referenceId);
  if (customerEmail) url.searchParams.set("email", customerEmail);
  if (customerName) url.searchParams.set("name", customerName);

  return url.toString();
};

export const getBackupPaymentDmUrl = ({
  amount: customAmount,
  purpose,
  referenceId,
  customerEmail,
  customerName,
  paymentReference,
}: PaymentLinkOptions) => {
  const backupUrl = (import.meta.env.VITE_BACKUP_PAYMENT_DM_URL as string | undefined) || "https://wa.me/2347074474275";
  const currency = (import.meta.env.VITE_FLUTTERWAVE_CURRENCY as string | undefined) || "NGN";
  const amount = getEnforcedPaymentAmount(purpose, customAmount);
  const reference = paymentReference || formatPaymentReference(purpose, referenceId);
  
  const amountText = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  let url: URL;
  try {
    url = new URL(backupUrl);
  } catch {
    toast.error("Backup payment DM link is invalid.");
    return null;
  }

  const message = [
    "Hello CampusHub Billing Team, I want to make a payment.",
    `Enforced Amount: ${amountText}`,
    `Purpose: ${purpose.replace(/_/g, " ").toUpperCase()}`,
    `Transaction Ref: ${reference}`,
    referenceId ? `Record ID: ${referenceId}` : null,
    customerName ? `Name: ${customerName}` : null,
    customerEmail ? `Email: ${customerEmail}` : null,
  ].filter(Boolean).join("\n");

  if (url.hostname.includes("wa.me") || url.hostname.includes("whatsapp")) {
    url.searchParams.set("text", message);
  } else {
    url.searchParams.set("message", message);
    url.searchParams.set("amount", String(Math.round(amount)));
    url.searchParams.set("currency", currency);
    url.searchParams.set("reference", reference);
  }

  return url.toString();
};

export const openFlutterwavePayment = (options: PaymentLinkOptions) => {
  const paymentReference = formatPaymentReference(options.purpose, options.referenceId);
  const paymentOptions = { ...options, paymentReference };
  const paymentUrl = getFlutterwavePaymentUrl(paymentOptions);

  if (!paymentUrl) {
    const backupUrl = getBackupPaymentDmUrl(paymentOptions);
    if (!backupUrl) return null;

    window.open(backupUrl, "_blank", "noopener,noreferrer");
    toast.info("Opened WhatsApp manual payment support fallback.");

    return {
      url: backupUrl,
      channel: "dm",
      label: "Message CampusHub to Pay (Manual Fallback)",
    } satisfies PaymentOpenResult;
  }

  window.open(paymentUrl, "_blank", "noopener,noreferrer");
  toast.success("Opening Flutterwave Payment Gateway. Complete your payment to activate.");

  return {
    url: paymentUrl,
    channel: "flutterwave",
    label: "Open Flutterwave Checkout",
  } satisfies PaymentOpenResult;
};
