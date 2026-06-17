import { toast } from "sonner";

export type PaymentPurpose = "marketplace_upfront_fee" | "agent_verification";

export interface PaymentLinkOptions {
  amount: number;
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

export const getFlutterwavePaymentUrl = ({
  amount,
  purpose,
  referenceId,
  customerEmail,
  customerName,
  paymentReference,
}: PaymentLinkOptions) => {
  const baseUrl = import.meta.env.VITE_FLUTTERWAVE_PAYMENT_LINK_URL as string | undefined;
  const currency = (import.meta.env.VITE_FLUTTERWAVE_CURRENCY as string | undefined) || "NGN";

  if (!baseUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    toast.error("Flutterwave payment link is invalid. Please check VITE_FLUTTERWAVE_PAYMENT_LINK_URL.");
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
  amount,
  purpose,
  referenceId,
  customerEmail,
  customerName,
  paymentReference,
}: PaymentLinkOptions) => {
  const backupUrl = (import.meta.env.VITE_BACKUP_PAYMENT_DM_URL as string | undefined) || "https://wa.me/2347074474275";
  const currency = (import.meta.env.VITE_FLUTTERWAVE_CURRENCY as string | undefined) || "NGN";
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
    toast.error("Backup payment DM link is invalid. Please check VITE_BACKUP_PAYMENT_DM_URL.");
    return null;
  }

  const message = [
    "Hello CampusHub, I want to complete a payment.",
    `Amount: ${amountText}`,
    `Purpose: ${purpose.replace(/_/g, " ")}`,
    `Reference: ${reference}`,
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

    const dmWindow = window.open(backupUrl, "_blank", "noopener,noreferrer");
    if (!dmWindow) {
      toast.info("Backup payment DM is ready. Use the payment button to open it.");
    } else {
      toast.info("Flutterwave is not active yet, so payment is continuing through CampusHub DM.");
    }

    return {
      url: backupUrl,
      channel: "dm",
      label: "Message CampusHub to Pay",
    } satisfies PaymentOpenResult;
  }

  const checkoutWindow = window.open(paymentUrl, "_blank", "noopener,noreferrer");
  if (!checkoutWindow) {
    toast.info("Checkout is ready. Use the payment button to open Flutterwave.");
  }

  return {
    url: paymentUrl,
    channel: "flutterwave",
    label: "Open Flutterwave Checkout",
  } satisfies PaymentOpenResult;
};
