import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types/database.types";

const STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "success" | "warning" | "info" | "destructive" | "luxury" | "outline"
> = {
  draft: "outline",
  sent: "info",
  partial: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "destructive",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize whitespace-nowrap">
      {status}
    </Badge>
  );
}
