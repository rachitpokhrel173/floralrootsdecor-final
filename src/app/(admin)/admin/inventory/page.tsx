import { InventoryTable } from "@/components/admin/inventory/inventory-table";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track flowers, furniture, lighting, stage equipment, and vehicles.
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}
