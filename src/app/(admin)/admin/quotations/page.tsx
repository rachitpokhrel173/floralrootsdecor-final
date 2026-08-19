import { getBookingOptions } from "@/lib/data/quotations";
import { getAllSettings } from "@/lib/data/settings";
import { QuotationsTable } from "@/components/admin/quotations/quotations-table";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const [bookingOptions, settings] = await Promise.all([getBookingOptions(), getAllSettings()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Quotations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build, send, and track professional quotations linked to bookings.
        </p>
      </div>

      <QuotationsTable
        bookingOptions={bookingOptions}
        serviceCatalog={settings.serviceCatalog}
        companyProfile={settings.companyProfile}
      />
    </div>
  );
}
