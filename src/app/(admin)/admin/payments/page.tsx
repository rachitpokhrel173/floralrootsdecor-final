import { getAllSettings } from "@/lib/data/settings";
import { PaymentsTable } from "@/components/admin/payments/payments-table";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every payment recorded across bookings, quotations, and invoices — all in one ledger.
        </p>
      </div>

      <PaymentsTable companyProfile={settings.companyProfile} />
    </div>
  );
}
