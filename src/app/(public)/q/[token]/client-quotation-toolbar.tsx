"use client";

import { useEffect } from "react";
import { Download, MessageCircle } from "lucide-react";
import { toWhatsAppNumber } from "@/lib/quotation-share";

/** Wait for every image (logo, reference photos) so the printout isn't missing any. */
async function waitForImages() {
  const images = Array.from(document.images).filter((img) => !img.complete);
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
  await document.fonts?.ready;
}

export function ClientQuotationToolbar({
  companyName,
  companyPhone,
  quotationNumber,
  autoPrint,
}: {
  companyName: string;
  companyPhone: string;
  quotationNumber: string;
  autoPrint: boolean;
}) {
  // ?print=1 — used by the admin "Print / PDF" button, which opens this page
  // in a new tab and lets it print itself once everything has loaded.
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    waitForImages().then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  const whatsAppNumber = toWhatsAppNumber(companyPhone);
  const whatsAppHref = whatsAppNumber
    ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
        `Hi ${companyName}, I have a question about quotation ${quotationNumber}.`
      )}`
    : null;

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/85 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[860px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold leading-tight">{companyName}</p>
          <p className="truncate text-xs text-[#6b6862]">Quotation {quotationNumber}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {whatsAppHref && (
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-3 text-sm font-medium text-[#128C4B] transition hover:bg-[#25D366]/20"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ask a question</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#171512] px-3 text-sm font-medium text-white transition hover:bg-[#2a2622]"
          >
            <Download className="h-4 w-4" />
            <span>
              <span className="hidden sm:inline">Download </span>PDF
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
