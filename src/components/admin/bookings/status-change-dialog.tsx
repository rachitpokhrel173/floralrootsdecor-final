"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Clock, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusBadge } from "./booking-badges";
import { changeBookingStatusAction } from "@/actions/booking-management-actions";
import { formatDate } from "@/lib/utils";
import type { Booking, BookingStatus, ActivityLog } from "@/types/database.types";

const STATUS_OPTIONS: BookingStatus[] = [
  "new", "contacted", "meeting", "quotation_sent", "negotiation",
  "confirmed", "decoration_started", "completed", "cancelled",
];

export function StatusChangeDialog({
  booking,
  activity,
  open,
  onOpenChange,
  onChanged,
}: {
  booking: Booking;
  activity: ActivityLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: (newStatus: BookingStatus) => void;
}) {
  const [newStatus, setNewStatus] = useState<BookingStatus>(booking.status);
  const [note, setNote] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasEmail = !!booking.email;
  const statusHistory = activity
    .filter((a) => a.action === "status_changed" || a.action === "status_note")
    .slice(0, 5);

  function handleSubmit() {
    startTransition(async () => {
      const res = await changeBookingStatusAction({
        bookingId: booking.id,
        newStatus,
        note: note.trim() || undefined,
        notifyCustomer: notifyCustomer && hasEmail,
      });

      if (!res.success) {
        toast.error(res.error ?? "Failed to update status");
        return;
      }

      if (notifyCustomer && hasEmail) {
        if (res.emailSent) {
          toast.success("Status updated — customer notified by email");
        } else if (res.emailSkippedReason === "not_configured") {
          toast.warning("Status updated, but email isn't configured (add RESEND_API_KEY)");
        } else {
          toast.warning("Status updated, but the notification email failed to send");
        }
      } else {
        toast.success("Status updated");
      }

      onChanged?.(newStatus);
      onOpenChange(false);
      setNote("");
      setNotifyCustomer(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Update {booking.full_name}&apos;s booking status, with an optional note and customer notification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            <span className="text-muted-foreground text-sm">→</span>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BookingStatus)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-note">Reason / Note (optional)</Label>
            <Textarea
              id="status-note"
              placeholder="e.g. Client confirmed via phone call, deposit received..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[70px]"
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border p-3">
            <Checkbox
              id="notify-customer"
              checked={notifyCustomer}
              onCheckedChange={(v) => setNotifyCustomer(!!v)}
              disabled={!hasEmail}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="notify-customer"
                className={`flex items-center gap-1.5 cursor-pointer ${!hasEmail ? "text-muted-foreground" : ""}`}
              >
                <Mail className="h-3.5 w-3.5" /> Notify customer by email
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasEmail
                  ? `Sends an update to ${booking.email}`
                  : "No email on file for this customer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> This will be recorded now — {formatDate(new Date().toISOString())}
          </div>

          {statusHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <History className="h-3.5 w-3.5" /> Recent History
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {statusHistory.map((a) => (
                    <div key={a.id} className="text-xs">
                      <p className="text-foreground">{a.description ?? a.action}</p>
                      <p className="text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="luxury" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
