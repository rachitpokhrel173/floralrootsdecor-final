"use client";

import { useMemo, useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/admin/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationType } from "@/types/database.types";

const TYPE_OPTIONS: { value: NotificationType | "all" | "unread"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "new_booking", label: "New Booking" },
  { value: "payment_received", label: "Payment Received" },
  { value: "upcoming_event", label: "Upcoming Event" },
  { value: "staff_assignment", label: "Staff Assignment" },
  { value: "reminder", label: "Reminder" },
  { value: "quotation_approved", label: "Quotation Approved" },
  { value: "invoice_paid", label: "Invoice Paid" },
  { value: "system", label: "System" },
];

export default function NotificationsPage() {
  const { data: notifications, isLoading, unreadCount, markRead, markAllRead } = useNotifications(100);
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-w-2xl">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[70px] w-full rounded-xl" />)}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-dashed border-border rounded-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "No notifications yet." : "No notifications match this filter."}
            </p>
          </div>
        )}

        {!isLoading &&
          filtered.map((n, i) => (
            <NotificationItem key={n.id} notification={n} onToggleRead={markRead} index={i} />
          ))}
      </div>
    </div>
  );
}
