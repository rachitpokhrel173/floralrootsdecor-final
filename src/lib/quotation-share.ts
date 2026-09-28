import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";

/** Path of the public, login-free client view of a quotation. */
export function quotationSharePath(token: string) {
  return `/q/${token}`;
}

/**
 * Absolute share URL. Uses NEXT_PUBLIC_APP_URL (the official domain) so links
 * sent to clients are always on it — even if staff opened the admin through a
 * *.vercel.app preview URL. Falls back to the current browser origin, and a
 * localhost value is ignored when the admin is running on a real domain (a
 * dev .env copied into the host would otherwise send clients dead links).
 */
export function quotationShareUrl(token: string) {
  const configured = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const isLocal = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
  const useConfigured = configured && !(isLocal(configured) && browserOrigin && !isLocal(browserOrigin));

  const origin = useConfigured ? configured : browserOrigin || configured;
  return `${origin}${quotationSharePath(token)}`;
}

/**
 * Normalise a phone number for wa.me, which wants digits only with the
 * country code. Bare 10-digit Nepali mobiles (98XXXXXXXX / 97XXXXXXXX) get
 * the +977 prefix; anything else is passed through as typed.
 */
export function toWhatsAppNumber(phone: string | null | undefined) {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && /^9[78]/.test(digits)) digits = `977${digits}`;
  return digits;
}

export function quotationShareMessage(
  quotation: QuotationWithBooking,
  companyName: string,
  url: string
) {
  const firstName = quotation.booking?.full_name?.split(" ")[0];
  const event = quotation.booking?.event_type;
  const eventDate = quotation.booking?.event_date ? formatDate(quotation.booking.event_date) : null;

  return [
    `Namaste${firstName ? ` ${firstName}` : ""},`,
    "",
    `Here is your quotation ${quotation.quotation_number} from ${companyName}` +
      (event ? ` for your ${event}${eventDate ? ` on ${eventDate}` : ""}` : "") +
      ".",
    `Total: ${formatCurrency(quotation.total)}`,
    quotation.valid_until ? `Valid until: ${formatDate(quotation.valid_until)}` : null,
    "",
    `View / download: ${url}`,
    "",
    "Feel free to reply here with any questions.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** wa.me deep link. With no number, WhatsApp lets the sender pick a chat. */
export function whatsAppShareLink(phone: string | null | undefined, message: string) {
  const number = toWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
