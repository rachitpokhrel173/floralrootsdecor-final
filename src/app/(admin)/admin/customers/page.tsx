"use client";

import { useState } from "react";
import { useCustomers } from "@/hooks/use-customers";
import { CustomersDataTable } from "@/components/admin/customers/customers-data-table";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import type { CustomerWithStats } from "@/lib/data/customers";

export default function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const [selected, setSelected] = useState<CustomerWithStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleRowClick(customer: CustomerWithStats) {
    setSelected(customer);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customer profiles are created automatically the first time someone books — no manual entry needed.
        </p>
      </div>

      <CustomersDataTable data={customers ?? []} isLoading={isLoading} onRowClick={handleRowClick} />

      <CustomerDetailDrawer customer={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
