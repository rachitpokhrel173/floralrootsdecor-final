import { Badge } from "@/components/ui/badge";
import type { QuotationStatus } from "@/types/database.types";

const STATUS_VARIANT: Record<
  QuotationStatus,
  "default" | "success" | "warning" | "info" | "destructive" | "luxury" | "outline"
> = {
  draft: "outline",
  sent: "info",
  approved: "success",
  rejected: "destructive",
  expired: "warning",
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize whitespace-nowrap">
      {status}
    </Badge>
  );
}
