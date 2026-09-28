"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ZoomIn } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import type { QuotationStatus } from "@/types/database.types";
import { ImageLightbox } from "@/components/admin/quotations/image-lightbox";

/*
 * The client-facing quotation document, shared by the admin preview dialog and
 * the public share page (/q/[token]).
 *
 * Styling note: compact print styles use the custom `pdf:` variant (see
 * globals.css), which applies both under `@media print` AND while an ancestor
 * carries `data-print-mode`. That lets `usePrintFit` switch the sheet into its
 * exact print layout on screen, measure it, and pick a zoom that fits one A4
 * page — measuring the screen layout instead (the old approach) gave the wrong
 * height and the overflow was clipped off the printout.
 */

const STATUS_META: Record<QuotationStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#78716c" },
  sent: { label: "Sent", color: "#1d4ed8" },
  approved: { label: "Approved", color: "#15803d" },
  rejected: { label: "Rejected", color: "#b91c1c" },
  expired: { label: "Expired", color: "#b45309" },
};

// Fixed hex palette (not theme tokens) so the document always looks the same
// regardless of the viewer's light/dark theme.
const INK = "#1f1d1a";
const NIGHT = "#171512";
const GOLD = "#c9a961";
const GOLD_DARK = "#a67f3d";
const LINE = "#e7e2d8";
const MUTE = "#6b6862";
const FAINT = "#9c9890";

const PX_PER_MM = 96 / 25.4;
const PRINTABLE_WIDTH_MM = 186; // A4 minus 12mm left+right @page margins
const PRINTABLE_HEIGHT_PX = (297 - 24) * PX_PER_MM * 0.985; // small safety margin
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1.3;

/**
 * Before the browser paginates (Print button or Ctrl+P), lay the sheet out in
 * print mode, measure it, and set --print-zoom so it fills a single A4 page —
 * shrinking long quotations and enlarging short ones. `zoom` (unlike
 * `transform`) affects layout, so the scaled result is what gets paginated.
 * The width is pre-compensated so the printed width always stays 186mm.
 * Nothing is clipped: if content is still too long at MIN_ZOOM it simply
 * continues onto a second page.
 */
function usePrintFit() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function apply(zoom: number) {
      const area = areaRef.current!;
      area.style.setProperty("--print-zoom", String(zoom));
      area.style.setProperty("--print-width", `${PRINTABLE_WIDTH_MM / zoom}mm`);
    }

    function beforePrint() {
      const sheet = sheetRef.current;
      const area = areaRef.current;
      if (!sheet || !area) return;

      sheet.setAttribute("data-print-mode", "");
      apply(1);

      let zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, PRINTABLE_HEIGHT_PX / area.scrollHeight));
      apply(zoom);

      // Changing the width re-wraps text, so refine against the real rendered
      // height a couple of times rather than trusting the first estimate.
      for (let i = 0; i < 3 && zoom > MIN_ZOOM; i++) {
        const rendered = area.getBoundingClientRect().height;
        if (rendered <= PRINTABLE_HEIGHT_PX) break;
        zoom = Math.max(MIN_ZOOM, zoom * (PRINTABLE_HEIGHT_PX / rendered));
        apply(zoom);
      }
    }

    function afterPrint() {
      sheetRef.current?.removeAttribute("data-print-mode");
      areaRef.current?.style.removeProperty("--print-zoom");
      areaRef.current?.style.removeProperty("--print-width");
    }

    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  return { sheetRef, areaRef };
}

/** Discount / tax breakdown derived from the stored (authoritative) totals. */
export function quotationBreakdown(quotation: QuotationWithBooking) {
  const subtotal = Number(quotation.subtotal) || 0;
  const total = Number(quotation.total) || 0;
  const discountValue = Number(quotation.discount_value) || 0;

  const isPercent = quotation.discount_type === "percent";
  // "fixed" is the legacy DB default; the app writes "flat".
  const isFlat = quotation.discount_type === "flat" || quotation.discount_type === "fixed";

  const rawDiscount = isPercent ? (subtotal * discountValue) / 100 : isFlat ? discountValue : 0;
  const discountAmount = Math.round(Math.min(rawDiscount, subtotal) * 100) / 100;

  const discountLabel =
    discountAmount > 0 ? (isPercent ? `Discount (${discountValue}%)` : "Discount") : null;

  const taxAmount = Math.max(Math.round((total - (subtotal - discountAmount)) * 100) / 100, 0);
  const received = quotation.totalReceived ?? 0;
  const balanceRemaining = Math.max(total - received, 0);

  return { subtotal, total, discountAmount, discountLabel, taxAmount, received, balanceRemaining };
}

export function QuotationDocument({
  quotation,
  companyProfile,
  showStatus = true,
}: {
  quotation: QuotationWithBooking;
  companyProfile: CompanyProfileValues;
  /** The client view hides internal statuses like "Draft". */
  showStatus?: boolean;
}) {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const { sheetRef, areaRef } = usePrintFit();

  const { subtotal, total, discountAmount, discountLabel, taxAmount, received, balanceRemaining } =
    quotationBreakdown(quotation);

  const status = STATUS_META[quotation.status];
  const contactLine = [companyProfile.phone, companyProfile.email].filter(Boolean).join("  ·  ");
  const images = quotation.images ?? [];
  // Set when the client accepted through the share link (typed-name signature).
  const accepted =
    quotation.status === "approved" && !!quotation.approved_by_signature && !!quotation.approved_at;

  return (
    <div ref={sheetRef} id="quotation-print-sheet">
      <div
        ref={areaRef}
        id="quotation-print-area"
        className="bg-white p-5 text-[13px] [-webkit-print-color-adjust:exact] [print-color-adjust:exact] sm:p-8 pdf:p-0 pdf:text-[11px]"
        style={{ color: INK }}
      >
        {/* ── Letterhead ── */}
        <div
          className="flex flex-col gap-5 rounded-2xl px-5 py-5 text-white sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-7 sm:py-6 pdf:flex-row pdf:items-start pdf:justify-between pdf:gap-6 pdf:rounded-xl pdf:px-5 pdf:py-3.5"
          style={{ backgroundColor: NIGHT }}
        >
          <div className="flex items-start gap-3.5">
            {companyProfile.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyProfile.logo_url}
                alt={companyProfile.name}
                className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1 pdf:h-11 pdf:w-11"
              />
            )}
            <div className="min-w-0">
              <h1 className="font-serif text-2xl font-semibold leading-tight pdf:text-xl">
                {companyProfile.name}
              </h1>
              {companyProfile.tagline && (
                <p className="text-[13px] text-white/60">{companyProfile.tagline}</p>
              )}
              {companyProfile.address && (
                <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-white/55 pdf:mt-1">
                  {companyProfile.address}
                </p>
              )}
              {contactLine && <p className="text-[11px] text-white/55">{contactLine}</p>}
            </div>
          </div>
          <div className="shrink-0 sm:text-right pdf:text-right">
            <p
              className="font-serif text-3xl font-semibold tracking-[0.12em] pdf:text-2xl"
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
          className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border text-sm sm:grid-cols-3 pdf:mt-3 pdf:grid-cols-3 pdf:text-xs"
          style={{ borderColor: LINE, backgroundColor: LINE }}
        >
          <Meta label="Issue Date" value={formatDate(quotation.created_at)} />
          <Meta
            label="Valid Until"
            value={quotation.valid_until ? formatDate(quotation.valid_until) : "—"}
          />
          {showStatus ? (
            <Meta
              label="Status"
              value={
                <span className="font-semibold" style={{ color: status.color }}>
                  {status.label}
                </span>
              }
            />
          ) : (
            <Meta label="Grand Total" value={formatCurrency(total)} />
          )}
        </div>

        {/* ── Parties ── */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 pdf:mt-3 pdf:grid-cols-2">
          <div>
            <SectionLabel>Billed To</SectionLabel>
            <p className="font-semibold">{quotation.booking?.full_name ?? "—"}</p>
            {quotation.booking?.phone && (
              <p className="text-sm pdf:text-xs" style={{ color: MUTE }}>
                {quotation.booking.phone}
              </p>
            )}
            {quotation.booking?.email && (
              <p className="break-all text-sm pdf:text-xs" style={{ color: MUTE }}>
                {quotation.booking.email}
              </p>
            )}
          </div>
          <div className="sm:text-right pdf:text-right">
            <SectionLabel>Event</SectionLabel>
            <p className="font-semibold">{quotation.booking?.event_type ?? "—"}</p>
            {quotation.booking?.event_date && (
              <p className="text-sm pdf:text-xs" style={{ color: MUTE }}>
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
        <div className="mt-7 -mx-1 overflow-x-auto px-1 pdf:mx-0 pdf:mt-3 pdf:overflow-visible pdf:px-0">
          <table className="w-full min-w-[480px] border-collapse text-sm pdf:min-w-0 pdf:text-xs">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wider text-white"
                style={{ backgroundColor: NIGHT }}
              >
                <th className="w-9 rounded-l-lg py-2.5 pl-3 font-semibold pdf:py-1.5">#</th>
                <th className="py-2.5 font-semibold pdf:py-1.5">Description</th>
                <th className="py-2.5 text-right font-semibold pdf:py-1.5">Qty</th>
                <th className="py-2.5 pl-3 text-right font-semibold pdf:py-1.5">Rate</th>
                <th className="rounded-r-lg py-2.5 pl-3 pr-3 text-right font-semibold pdf:py-1.5">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-[#faf7f1]">
              {quotation.items.map((item, idx) => (
                <tr key={idx} className="break-inside-avoid border-b align-top" style={{ borderColor: "#eee9df" }}>
                  <td className="py-3 pl-3 pdf:py-1.5" style={{ color: FAINT }}>
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 pr-4 pdf:py-1.5">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs pdf:text-[10px]" style={{ color: "#8a867e" }}>
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right tabular-nums pdf:py-1.5">{item.qty}</td>
                  <td className="whitespace-nowrap py-3 pl-3 text-right tabular-nums pdf:py-1.5">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-3 pr-3 text-right font-medium tabular-nums pdf:py-1.5">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Totals ── */}
        <div className="mt-6 flex break-inside-avoid justify-end pdf:mt-3">
          <div className="w-full space-y-2 text-sm sm:max-w-xs pdf:max-w-xs pdf:space-y-1 pdf:text-xs">
            <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
            {discountLabel && <TotalRow label={discountLabel} value={`- ${formatCurrency(discountAmount)}`} />}
            {!!quotation.tax_percent && (
              <TotalRow label={`Tax (${quotation.tax_percent}%)`} value={formatCurrency(taxAmount)} />
            )}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-2.5 text-base font-semibold text-white pdf:py-1.5 pdf:text-sm"
              style={{ backgroundColor: NIGHT }}
            >
              <span>Grand Total</span>
              <span className="tabular-nums" style={{ color: GOLD }}>
                {formatCurrency(total)}
              </span>
            </div>
            {received > 0 && (
              <>
                <TotalRow label="Advance received" value={`- ${formatCurrency(received)}`} valueColor="#15803d" />
                <div
                  className="flex items-center justify-between border-t pt-2 text-base font-semibold pdf:pt-1 pdf:text-sm"
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
        {images.length > 0 && (
          <div className="mt-8 break-inside-avoid pdf:mt-3">
            <SectionLabel>Reference &amp; Inspiration</SectionLabel>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 pdf:grid-cols-6 pdf:gap-1.5">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setZoomSrc(url)}
                  className="group relative aspect-square w-full overflow-hidden rounded-lg border pdf:pointer-events-none"
                  style={{ borderColor: LINE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Reference ${idx + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100 pdf:hidden">
                    <ZoomIn className="h-5 w-5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Terms & notes ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 break-inside-avoid sm:grid-cols-2 pdf:mt-3 pdf:grid-cols-2 pdf:gap-4">
          <div>
            <SectionLabel>Terms &amp; Conditions</SectionLabel>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed pdf:text-[10px]" style={{ color: MUTE }}>
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
              <p className="whitespace-pre-line text-xs leading-relaxed pdf:text-[10px]" style={{ color: MUTE }}>
                {quotation.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Signatures ── */}
        <div className="mt-10 grid grid-cols-2 gap-6 break-inside-avoid sm:gap-10 pdf:mt-6 pdf:gap-10">
          <div>
            <div className="h-10 border-b pdf:h-8" style={{ borderColor: "#bfb9ab" }} />
            <p className="mt-1.5 text-xs font-medium">For {companyProfile.name}</p>
            <p className="text-[11px]" style={{ color: FAINT }}>
              Authorised Signatory
            </p>
          </div>
          <div>
            {accepted ? (
              <div
                className="flex h-10 items-end border-b pb-1 font-serif text-lg italic pdf:h-8 pdf:text-base"
                style={{ borderColor: "#bfb9ab", color: NIGHT }}
              >
                {quotation.approved_by_signature}
              </div>
            ) : (
              <div className="h-10 border-b pdf:h-8" style={{ borderColor: "#bfb9ab" }} />
            )}
            <p className="mt-1.5 text-xs font-medium">Client Acceptance</p>
            <p className="text-[11px]" style={{ color: accepted ? "#15803d" : FAINT }}>
              {accepted
                ? `Accepted online · ${formatDate(quotation.approved_at!)}`
                : "Signature & Date"}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-10 break-inside-avoid border-t pt-4 text-center pdf:mt-5 pdf:pt-3" style={{ borderColor: LINE }}>
          <p className="font-serif text-sm" style={{ color: NIGHT }}>
            Thank you for considering {companyProfile.name}.
          </p>
          <p className="mt-1 text-[11px]" style={{ color: FAINT }}>
            {contactLine && `${contactLine}  ·  `}This is a computer-generated quotation.
          </p>
        </div>
      </div>

      <ImageLightbox src={zoomSrc} alt="Quotation reference" onClose={() => setZoomSrc(null)} />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest pdf:mb-1 pdf:text-[10px]" style={{ color: GOLD_DARK }}>
      {children}
    </p>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white px-3 py-2.5 pdf:py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TotalRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: MUTE }}>{label}</span>
      <span className="tabular-nums" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}
