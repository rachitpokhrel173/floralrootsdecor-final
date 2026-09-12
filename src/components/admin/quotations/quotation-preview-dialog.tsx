"use client";

import { useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Wallet, ZoomIn } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import type { QuotationStatus } from "@/types/database.types";
import { RecordPaymentDialog } from "@/components/admin/payments/record-payment-dialog";
import { ImageLightbox } from "./image-lightbox";

interface QuotationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: QuotationWithBooking | null;
  companyProfile: CompanyProfileValues;
  onPaymentRecorded?: () => void;
}

const STATUS_META: Record<QuotationStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#78716c" },
  sent: { label: "Sent", color: "#1d4ed8" },
  approved: { label: "Approved", color: "#15803d" },
  rejected: { label: "Rejected", color: "#b91c1c" },
  expired: { label: "Expired", color: "#b45309" },
};

// Fixed hex palette (not theme tokens) so the printed document always looks the
// same regardless of the admin light/dark theme.
const INK = "#1f1d1a";
const NIGHT = "#171512";
const GOLD = "#c9a961";
const GOLD_DARK = "#a67f3d";
const LINE = "#e7e2d8";
const MUTE = "#6b6862";
const FAINT = "#9c9890";

export function QuotationPreviewDialog({
  open,
  onOpenChange,
  quotation,
  companyProfile,
  onPaymentRecorded,
}: QuotationPreviewDialogProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Scale the sheet so the quotation always fills one A4 page — shrinking a
  // long one down, or enlarging a short one up — instead of leaving a short
  // quotation stranded at the top with blank space below. `zoom` (unlike
  // `transform`) affects layout, so Chrome paginates the scaled result. The
  // width is compensated by the same factor so the effective printed width
  // always stays at 186mm (never overflows the page when scaling up).
  // Clamped to [0.5, 1.35] so extremely long/short content stays legible.
  function handlePrint() {
    const el = printAreaRef.current;
    if (el) {
      const PX_PER_MM = 96 / 25.4;
      const printableHeightPx = (297 - 24) * PX_PER_MM; // A4 minus 12mm top+bottom
      const printableWidthMm = 186; // A4 minus 12mm left+right
      const naturalHeightPx = el.scrollHeight;
      const zoom = Math.min(1.35, Math.max(0.5, printableHeightPx / naturalHeightPx));
      el.style.setProperty("--print-zoom", String(zoom));
      el.style.setProperty("--print-width", `${printableWidthMm / zoom}mm`);
    }
    window.print();
  }

  if (!quotation) return null;

  const received = quotation.totalReceived ?? 0;
  const balanceRemaining = Math.max(quotation.total - received, 0);

  const discountAmount =
    quotation.discount_type === "percent"
      ? (quotation.subtotal * (quotation.discount_value ?? 0)) / 100
      : quotation.discount_type === "flat"
        ? (quotation.discount_value ?? 0)
        : 0;

  const discountLabel =
    quotation.discount_type === "percent"
      ? `Discount (${quotation.discount_value}%)`
      : quotation.discount_type === "flat"
        ? "Discount"
        : null;

  const afterDiscount = quotation.subtotal - discountAmount;
  const taxAmount = Math.max(quotation.total - afterDiscount, 0);

  const status = STATUS_META[quotation.status];
  const contactLine = [companyProfile.phone, companyProfile.email].filter(Boolean).join("  ·  ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] gap-0 overflow-y-auto p-0 print:max-h-none print:overflow-visible">
        <DialogTitle className="sr-only">
          Quotation {quotation.quotation_number} for {quotation.booking?.full_name ?? "client"}
        </DialogTitle>

        <div className="flex items-center justify-between gap-2 border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPaymentDialogOpen(true)}>
              <Wallet className="mr-2 h-4 w-4" /> Record Payment
            </Button>
            {received > 0 && (
              <Badge variant={balanceRemaining === 0 ? "success" : "warning"}>
                {balanceRemaining === 0
                  ? "Fully Paid"
                  : `${formatCurrency(received)} in · ${formatCurrency(balanceRemaining)} due`}
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
          </Button>
        </div>

        <div id="quotation-print-sheet">
        <div
          ref={printAreaRef}
          id="quotation-print-area"
          className="bg-white p-8 text-[13px] [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:p-0 print:text-[11px]"
          style={{ color: INK }}
        >
          {/* ── Letterhead ── */}
          <div
            className="flex items-start justify-between gap-6 rounded-2xl px-7 py-6 text-white [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:rounded-xl print:px-5 print:py-3.5"
            style={{ backgroundColor: NIGHT }}
          >
            <div className="flex items-start gap-3.5">
              {companyProfile.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={companyProfile.logo_url}
                  alt={companyProfile.name}
                  className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1 print:h-11 print:w-11"
                />
              )}
              <div>
                <h1 className="font-serif text-2xl font-semibold leading-tight print:text-xl">
                  {companyProfile.name}
                </h1>
                {companyProfile.tagline && (
                  <p className="text-[13px] text-white/60">{companyProfile.tagline}</p>
                )}
                {companyProfile.address && (
                  <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-white/55 print:mt-1">
                    {companyProfile.address}
                  </p>
                )}
                {contactLine && <p className="text-[11px] text-white/55">{contactLine}</p>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="font-serif text-3xl font-semibold tracking-[0.12em] print:text-2xl"
                style={{ color: GOLD }}
              >
                QUOTATION
              </p>
              <p className="mt-1 text-sm font-medium">{quotation.quotation_number}</p>
              <p className="text-[11px] text-white/55">Revision {quotation.version}</p>
            </div>
          </div>

          {/* ── Meta strip ── */}
          <div
            className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border text-sm sm:grid-cols-3 print:mt-3 print:text-xs"
            style={{ borderColor: LINE, backgroundColor: LINE }}
          >
            <Meta label="Issue Date" value={formatDate(quotation.created_at)} />
            <Meta
              label="Valid Until"
              value={quotation.valid_until ? formatDate(quotation.valid_until) : "—"}
            />
            <Meta
              label="Status"
              value={
                <span className="font-semibold" style={{ color: status.color }}>
                  {status.label}
                </span>
              }
            />
          </div>

          {/* ── Parties ── */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 print:mt-3">
            <div>
              <SectionLabel>Billed To</SectionLabel>
              <p className="font-semibold">{quotation.booking?.full_name ?? "—"}</p>
              {quotation.booking?.phone && (
                <p className="text-sm" style={{ color: MUTE }}>
                  {quotation.booking.phone}
                </p>
              )}
              {quotation.booking?.email && (
                <p className="text-sm" style={{ color: MUTE }}>
                  {quotation.booking.email}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <SectionLabel>Event</SectionLabel>
              <p className="font-semibold">{quotation.booking?.event_type ?? "—"}</p>
              {quotation.booking?.event_date && (
                <p className="text-sm" style={{ color: MUTE }}>
                  {formatDate(quotation.booking.event_date)}
                </p>
              )}
              {quotation.booking?.booking_code && (
                <p className="mt-0.5 text-xs" style={{ color: FAINT }}>
                  Booking ref · {quotation.booking.booking_code}
                </p>
              )}
            </div>
          </div>

          {/* ── Line items ── */}
          <table className="mt-7 w-full border-collapse text-sm print:mt-3 print:text-xs">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wider text-white [-webkit-print-color-adjust:exact] [print-color-adjust:exact]"
                style={{ backgroundColor: NIGHT }}
              >
                <th className="w-9 rounded-l-lg py-2.5 pl-3 font-semibold print:py-1.5">#</th>
                <th className="py-2.5 font-semibold print:py-1.5">Description</th>
                <th className="py-2.5 text-right font-semibold print:py-1.5">Qty</th>
                <th className="py-2.5 text-right font-semibold print:py-1.5">Rate</th>
                <th className="rounded-r-lg py-2.5 pr-3 text-right font-semibold print:py-1.5">Amount</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-[#faf7f1]">
              {quotation.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="break-inside-avoid border-b align-top"
                  style={{ borderColor: "#eee9df" }}
                >
                  <td className="py-3 pl-3 print:py-1.5" style={{ color: FAINT }}>
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 pr-4 print:py-1.5">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs" style={{ color: "#8a867e" }}>
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right tabular-nums print:py-1.5">{item.qty}</td>
                  <td className="py-3 text-right tabular-nums print:py-1.5">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 pr-3 text-right font-medium tabular-nums print:py-1.5">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Totals ── */}
          <div className="mt-6 flex break-inside-avoid justify-end print:mt-3">
            <div className="w-full max-w-xs space-y-2 text-sm print:space-y-1 print:text-xs">
              <TotalRow label="Subtotal" value={formatCurrency(quotation.subtotal)} />
              {discountLabel && (
                <TotalRow label={discountLabel} value={`- ${formatCurrency(discountAmount)}`} />
              )}
              {!!quotation.tax_percent && (
                <TotalRow label={`Tax (${quotation.tax_percent}%)`} value={formatCurrency(taxAmount)} />
              )}
              <div
                className="flex items-center justify-between rounded-lg px-4 py-2.5 text-base font-semibold text-white [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:py-1.5 print:text-sm"
                style={{ backgroundColor: NIGHT }}
              >
                <span>Grand Total</span>
                <span className="tabular-nums" style={{ color: GOLD }}>
                  {formatCurrency(quotation.total)}
                </span>
              </div>
              {received > 0 && (
                <>
                  <TotalRow
                    label="Advance received"
                    value={`- ${formatCurrency(received)}`}
                    valueColor="#15803d"
                  />
                  <div
                    className="flex items-center justify-between border-t pt-2 text-base font-semibold"
                    style={{ borderColor: LINE }}
                  >
                    <span>Balance Due</span>
                    <span className="tabular-nums">{formatCurrency(balanceRemaining)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Reference images ── */}
          {quotation.images?.length > 0 && (
            <div className="mt-8 break-inside-avoid print:mt-3">
              <SectionLabel>Reference &amp; Inspiration</SectionLabel>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 print:grid-cols-6 print:gap-1.5">
                {quotation.images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setZoomSrc(url)}
                    className="group relative aspect-square w-full overflow-hidden rounded-lg border print:pointer-events-none"
                    style={{ borderColor: LINE }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Reference ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100 print:hidden">
                      <ZoomIn className="h-5 w-5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Terms & notes ── */}
          <div className="mt-8 grid grid-cols-1 gap-6 break-inside-avoid sm:grid-cols-2 print:mt-3 print:gap-4">
            <div>
              <SectionLabel>Terms &amp; Conditions</SectionLabel>
              <ul className="space-y-1 text-xs leading-relaxed" style={{ color: MUTE }}>
                <li>50% advance confirms the booking; the balance is due before the event date.</li>
                <li>
                  Prices are valid{" "}
                  {quotation.valid_until
                    ? `until ${formatDate(quotation.valid_until)}`
                    : "for 15 days from the issue date"}
                  .
                </li>
                <li>Final setup is subject to venue access and on-site conditions.</li>
                <li>Applicable taxes are included as itemised above.</li>
              </ul>
            </div>
            {quotation.notes && (
              <div>
                <SectionLabel>Notes</SectionLabel>
                <p className="whitespace-pre-line text-xs leading-relaxed" style={{ color: MUTE }}>
                  {quotation.notes}
                </p>
              </div>
            )}
          </div>

          {/* ── Signatures ── */}
          <div className="mt-10 grid grid-cols-2 gap-10 break-inside-avoid print:mt-6">
            <div>
              <div className="h-10 border-b print:h-8" style={{ borderColor: "#bfb9ab" }} />
              <p className="mt-1.5 text-xs font-medium">For {companyProfile.name}</p>
              <p className="text-[11px]" style={{ color: FAINT }}>
                Authorised Signatory
              </p>
            </div>
            <div>
              <div className="h-10 border-b print:h-8" style={{ borderColor: "#bfb9ab" }} />
              <p className="mt-1.5 text-xs font-medium">Client Acceptance</p>
              <p className="text-[11px]" style={{ color: FAINT }}>
                Signature &amp; Date
              </p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="mt-10 border-t pt-4 text-center print:mt-5 print:pt-3" style={{ borderColor: LINE }}>
            <p className="font-serif text-sm" style={{ color: NIGHT }}>
              Thank you for considering {companyProfile.name}.
            </p>
            <p className="mt-1 text-[11px]" style={{ color: FAINT }}>
              {contactLine && `${contactLine}  ·  `}This is a computer-generated quotation.
            </p>
          </div>
        </div>
        </div>
        <ImageLightbox src={zoomSrc} alt="Quotation reference" onClose={() => setZoomSrc(null)} />
      </DialogContent>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        bookingId={quotation.booking_id}
        totalAmount={quotation.total}
        alreadyReceived={received}
        onRecorded={onPaymentRecorded}
      />
    </Dialog>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: GOLD_DARK }}
    >
      {children}
    </p>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TotalRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: MUTE }}>{label}</span>
      <span className="tabular-nums" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}
