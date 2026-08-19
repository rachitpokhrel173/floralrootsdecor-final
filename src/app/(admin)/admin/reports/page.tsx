import { getRevenueReport, getBookingReport, getCustomerReport, getInventoryReport } from "@/lib/data/reports";
import { ReportsTabs } from "@/components/admin/reports/reports-tabs";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [revenue, bookings, customers, inventory] = await Promise.all([
    getRevenueReport(),
    getBookingReport(),
    getCustomerReport(),
    getInventoryReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue, booking, customer, and inventory insights — all pulled live from your data.
        </p>
      </div>

      <ReportsTabs revenue={revenue} bookings={bookings} customers={customers} inventory={inventory} />
    </div>
  );
}
