import { Badge } from "@/components/ui/badge";
import type { InquiryStatus } from "@/types/database.types";

export const INQUIRY_STATUSES: { value: InquiryStatus; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Not replied yet" },
  { value: "contacted", label: "Contacted", hint: "You've reached out" },
  { value: "converted", label: "Converted", hint: "Became a booking" },
  { value: "closed", label: "Closed", hint: "No longer active" },
];

const VARIANT: Record<InquiryStatus, "info" | "warning" | "success" | "secondary"> = {
  new: "info",
  contacted: "warning",
  converted: "success",
  closed: "secondary",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const label = INQUIRY_STATUSES.find((s) => s.value === status)?.label ?? status;
  return <Badge variant={VARIANT[status]}>{label}</Badge>;
}
