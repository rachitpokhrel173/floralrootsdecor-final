import { VendorsGrid } from "@/components/admin/vendors/vendors-grid";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Vendors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage catering, photography, and other vendor partners.
        </p>
      </div>
      <VendorsGrid />
    </div>
  );
}
