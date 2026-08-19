import { Badge } from "@/components/ui/badge";
import type { BookingStatus, BookingPriority, PaymentStatus } from "@/types/database.types";

const STATUS_VARIANT: Record<BookingStatus, "default" | "success" | "warning" | "info" | "destructive" | "luxury"> = {
  new: "info",
  contacted: "default",
  meeting: "default",
  quotation_sent: "warning",
  negotiation: "warning",
  confirmed: "luxury",
  decoration_started: "luxury",
  completed: "success",
  cancelled: "destructive",
};

const PRIORITY_VARIANT: Record<BookingPriority, "default" | "warning" | "destructive" | "outline"> = {
  low: "outline",
  medium: "default",
  high: "warning",
  urgent: "destructive",
};

const PAYMENT_VARIANT: Record<PaymentStatus, "destructive" | "warning" | "success" | "outline"> = {
  unpaid: "destructive",
  partial: "warning",
  paid: "success",
  refunded: "outline",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize whitespace-nowrap">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function BookingPriorityBadge({ priority }: { priority: BookingPriority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]} className="capitalize">
      {priority}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
