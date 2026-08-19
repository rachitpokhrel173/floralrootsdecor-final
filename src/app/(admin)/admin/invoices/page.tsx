import { getBookingOptions } from "@/lib/data/quotations";
import { getConvertibleQuotations } from "@/lib/data/invoices";
import { getAllSettings } from "@/lib/data/settings";
import { InvoicesTable } from "@/components/admin/invoices/invoices-table";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const [bookingOptions, convertibleQuotations, settings] = await Promise.all([
    getBookingOptions(),
    getConvertibleQuotations(),
    getAllSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate invoices, track payments, and convert approved quotations.
        </p>
      </div>

      <InvoicesTable
        bookingOptions={bookingOptions}
        convertibleQuotations={convertibleQuotations}
        companyProfile={settings.companyProfile}
      />
    </div>
  );
}
