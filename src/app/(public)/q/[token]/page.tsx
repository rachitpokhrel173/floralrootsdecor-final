import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuotationByShareToken } from "@/lib/data/quotations";
import { getAllSettings } from "@/lib/data/settings";
import { QuotationDocument } from "@/components/quotations/quotation-document";
import { ClientQuotationToolbar } from "./client-quotation-toolbar";
import { AcceptQuotationPanel } from "./accept-quotation-panel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ print?: string }>;
};

// Share links are private — keep them out of search engines and link previews'
// caches as far as we can.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const quotation = await getQuotationByShareToken(token);
  const { companyProfile } = await getAllSettings();

  return {
    title: quotation
      ? `Quotation ${quotation.quotation_number} · ${companyProfile.name}`
      : "Quotation not found",
    description: quotation
      ? `Your event quotation from ${companyProfile.name}.`
      : undefined,
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * Public, login-free client view of a quotation, reached through the share
 * link staff send (usually over WhatsApp). The token in the URL is the only
 * access check — see getQuotationByShareToken.
 */
export default async function SharedQuotationPage({ params, searchParams }: Props) {
  const [{ token }, { print }] = await Promise.all([params, searchParams]);

  const [quotation, { companyProfile }] = await Promise.all([
    getQuotationByShareToken(token),
    getAllSettings(),
  ]);

  if (!quotation) notFound();

  const today = new Date().toISOString().slice(0, 10);
  // An accepted quotation stays valid past its date — the price is locked in.
  const isExpired =
    quotation.status !== "approved" &&
    (quotation.status === "expired" || (!!quotation.valid_until && quotation.valid_until < today));

  return (
    <div className="min-h-screen bg-[#efebe3] pb-12 text-[#1f1d1a] print:bg-white print:p-0">
      <ClientQuotationToolbar
        companyName={companyProfile.name}
        companyPhone={companyProfile.phone ?? ""}
        quotationNumber={quotation.quotation_number}
        autoPrint={print === "1"}
      />

      <main className="mx-auto max-w-[860px] px-3 pt-4 sm:px-6 sm:pt-8 print:max-w-none print:p-0">
        {isExpired && (
          <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
            This quotation has passed its validity date. Prices may have changed — please contact us
            for an updated quotation.
          </p>
        )}
        {quotation.status === "rejected" && (
          <p className="mb-4 rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700 print:hidden">
            This quotation is no longer active. Please contact us if you&apos;d like a new one.
          </p>
        )}

        <div className="overflow-hidden rounded-2xl shadow-[0_10px_40px_-12px_rgba(23,21,18,0.25)] print:overflow-visible print:rounded-none print:shadow-none">
          <QuotationDocument
            quotation={quotation}
            companyProfile={companyProfile}
            showStatus={false}
          />
        </div>

        <AcceptQuotationPanel
          token={token}
          clientName={quotation.booking?.full_name ?? ""}
          companyName={companyProfile.name}
          acceptedBy={quotation.status === "approved" ? quotation.approved_by_signature : null}
          acceptedAt={quotation.status === "approved" ? quotation.approved_at : null}
          canAccept={!isExpired && quotation.status !== "rejected"}
        />
      </main>
    </div>
  );
}
