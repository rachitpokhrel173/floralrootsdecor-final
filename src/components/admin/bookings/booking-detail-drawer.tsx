"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Users2, Wallet, Palette, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useBookingDetail } from "@/hooks/use-booking-detail";
import { updateBookingAction } from "@/actions/booking-management-actions";
import { getInitials, formatDate, formatCurrency, daysUntil } from "@/lib/utils";
import { BookingStatusBadge, BookingPriorityBadge, PaymentStatusBadge } from "./booking-badges";
import { StatusChangeDialog } from "./status-change-dialog";
import type { Booking, BookingStatus, BookingPriority, PaymentStatus } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_OPTIONS: BookingPriority[] = ["low", "medium", "high", "urgent"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

export function BookingDetailDrawer({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { services, servicesLoading, activity, activityLoading } = useBookingDetail(
    booking?.id ?? null
  );
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<BookingStatus | undefined>(booking?.status);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  if (!booking) return null;

  const days = daysUntil(booking.event_date);

  function handleUpdate(updates: Parameters<typeof updateBookingAction>[1]) {
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingAction(booking.id, updates);
      if (res.success) {
        toast.success("Booking updated");
      } else {
        toast.error(res.error ?? "Failed to update booking");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gold/15 text-gold-dark">
                  {getInitials(booking.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{booking.full_name}</SheetTitle>
                <SheetDescription>{booking.booking_code}</SheetDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => setStatusDialogOpen(true)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <BookingStatusBadge status={localStatus ?? booking.status} />
            </button>
            <PriorityPicker
              value={booking.priority}
              disabled={isPending}
              onChange={(v) => handleUpdate({ priority: v })}
            />
            <PaymentPicker
              value={booking.payment_status}
              disabled={isPending}
              onChange={(v) => handleUpdate({ payment_status: v })}
            />
          </div>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="activity">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={Phone} label="Phone" value={booking.phone} />
                <InfoRow icon={Mail} label="Email" value={booking.email ?? "—"} />
                <InfoRow icon={MapPin} label="Venue" value={booking.venue ?? "—"} />
                <InfoRow icon={Users2} label="Guests" value={booking.guest_count?.toString() ?? "—"} />
                <InfoRow icon={Wallet} label="Budget" value={formatCurrency(booking.budget)} />
                <InfoRow icon={Palette} label="Theme" value={booking.theme ?? "—"} />
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Event on <strong>{formatDate(booking.event_date)}</strong>
                  {days >= 0 ? ` — ${days} day${days === 1 ? "" : "s"} remaining` : " — past event"}
                </span>
              </div>

              {booking.custom_notes && (
                <div className="rounded-xl bg-muted/40 p-4 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Custom Notes</p>
                  {booking.custom_notes}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services">
              {servicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No services selected for this booking.
                </p>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                    >
                      <span className="text-sm font-medium capitalize">
                        {s.service_name.replace(/_/g, " ")}
                      </span>
                      {s.estimated_price && (
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(s.estimated_price)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="relative space-y-5 pl-4 border-l border-border">
                  {activity.map((a) => (
                    <div key={a.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold" />
                      <p className="text-sm font-medium">{a.description ?? a.action}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      <StatusChangeDialog
        booking={booking}
        activity={activity}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onChanged={(newStatus) => setLocalStatus(newStatus)}
      />
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function PriorityPicker({
  value,
  disabled,
  onChange,
}: {
  value: BookingPriority;
  disabled?: boolean;
  onChange: (v: BookingPriority) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as BookingPriority)} disabled={disabled}>
      <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer hover:opacity-80 transition-opacity">
        <BookingPriorityBadge priority={value} />
      </SelectTrigger>
      <SelectContent align="start">
        {PRIORITY_OPTIONS.map((p) => (
          <SelectItem key={p} value={p} className="capitalize">
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PaymentPicker({
  value,
  disabled,
  onChange,
}: {
  value: PaymentStatus;
  disabled?: boolean;
  onChange: (v: PaymentStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PaymentStatus)} disabled={disabled}>
      <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer hover:opacity-80 transition-opacity">
        <PaymentStatusBadge status={value} />
      </SelectTrigger>
      <SelectContent align="start">
        {PAYMENT_OPTIONS.map((p) => (
          <SelectItem key={p} value={p} className="capitalize">
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
