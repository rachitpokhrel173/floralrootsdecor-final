"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Users2,
  Wallet,
  Palette,
  CalendarDays,
  Clock,
  Droplets,
  Globe,
  ListChecks,
  History,
  RefreshCw,
  FilePlus2,
  Hourglass,
  StickyNote,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DrawerShell,
  DrawerHero,
  DrawerBody,
  DrawerFooter,
  DrawerSection,
  DrawerEmpty,
  InfoCard,
  InfoItem,
  QuickContact,
  StatTiles,
  drawerTabsListClass,
} from "@/components/admin/shared/detail-drawer";
import { useBookingDetail } from "@/hooks/use-booking-detail";
import { updateBookingAction } from "@/actions/booking-management-actions";
import { formatDate, formatCurrency, daysUntil, cn } from "@/lib/utils";
import { BookingStatusBadge, BookingPriorityBadge, PaymentStatusBadge } from "./booking-badges";
import { StatusChangeDialog } from "./status-change-dialog";
import type { Booking, BookingStatus, BookingPriority, PaymentStatus } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_OPTIONS: BookingPriority[] = ["low", "medium", "high", "urgent"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function countdown(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `${days} days`;
  return "Past";
}

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
  const servicesTotal = services.reduce((sum, s) => sum + (s.estimated_price ?? 0), 0);
  const mapHref =
    booking.venue_lat && booking.venue_lng
      ? `https://www.google.com/maps?q=${booking.venue_lat},${booking.venue_lng}`
      : booking.venue
        ? `https://www.google.com/maps/search/${encodeURIComponent(booking.venue)}`
        : undefined;

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
      <DrawerShell>
        <DrawerHero
          name={booking.full_name}
          eyebrow={booking.booking_code}
          subtitle={
            <>
              {booking.event_type} · {formatDate(booking.event_date)}
              {booking.event_time && ` at ${formatTime(booking.event_time)}`}
            </>
          }
          badges={
            <>
              <button
                type="button"
                onClick={() => setStatusDialogOpen(true)}
                className="cursor-pointer transition-opacity hover:opacity-80"
                title="Change status"
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
            </>
          }
        >
          <QuickContact phone={booking.phone} email={booking.email} />
          <StatTiles
            items={[
              {
                label: days >= 0 ? "Event in" : "Event",
                value: countdown(days),
                icon: Hourglass,
                tone: days >= 0 && days <= 3 ? "red" : "gold",
              },
              { label: "Guests", value: booking.guest_count ?? "—", icon: Users2 },
              { label: "Budget", value: formatCurrency(booking.budget), icon: Wallet, tone: "emerald" },
            ]}
          />
        </DrawerHero>

        <DrawerBody>
          <Tabs defaultValue="overview">
            <TabsList className={cn(drawerTabsListClass, "grid-cols-3")}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">
                Services{services.length > 0 && ` (${services.length})`}
              </TabsTrigger>
              <TabsTrigger value="activity">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5 space-y-6">
              <DrawerSection title="Event">
                <InfoCard>
                  <InfoItem
                    icon={CalendarDays}
                    label="Date"
                    value={`${formatDate(booking.event_date, { weekday: "long" })}${
                      booking.event_time ? ` · ${formatTime(booking.event_time)}` : ""
                    }`}
                  />
                  <InfoItem icon={MapPin} label="Venue" value={booking.venue} href={mapHref} />
                  <InfoItem icon={Palette} label="Theme" value={booking.theme} />
                  <InfoItem icon={Droplets} label="Colour preferences" value={booking.color_preferences} />
                </InfoCard>
              </DrawerSection>

              <DrawerSection title="Contact">
                <InfoCard>
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={booking.phone}
                    href={`tel:${booking.phone}`}
                    copyable={booking.phone}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={booking.email}
                    href={booking.email ? `mailto:${booking.email}` : undefined}
                    copyable={booking.email}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Booked via"
                    value={
                      <span className="capitalize">
                        {booking.source.replace(/_/g, " ")} · {formatDate(booking.created_at)}
                      </span>
                    }
                  />
                </InfoCard>
              </DrawerSection>

              {booking.custom_notes && (
                <DrawerSection title="Client notes">
                  <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                    <p className="whitespace-pre-wrap text-sm">{booking.custom_notes}</p>
                  </div>
                </DrawerSection>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-5">
              {servicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <DrawerEmpty icon={ListChecks} text="No services selected for this booking." />
              ) : (
                <InfoCard>
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-3.5 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
                        <ListChecks className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium capitalize">
                        {s.service_name.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {s.estimated_price ? formatCurrency(s.estimated_price) : "—"}
                      </span>
                    </div>
                  ))}
                  {servicesTotal > 0 && (
                    <div className="flex items-center justify-between bg-muted/40 px-3.5 py-3 text-sm">
                      <span className="font-medium">Estimated total</span>
                      <span className="font-display text-base">{formatCurrency(servicesTotal)}</span>
                    </div>
                  )}
                </InfoCard>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <DrawerEmpty icon={History} text="No activity recorded yet." />
              ) : (
                <ol className="relative ml-2 space-y-4 border-l border-border pl-5">
                  {activity.map((a, i) => (
                    <li key={a.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-background",
                          i === 0 ? "bg-gold" : "bg-muted-foreground/30"
                        )}
                      />
                      <p className="text-sm font-medium">{a.description ?? a.action}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(a.created_at)} ·{" "}
                        {new Date(a.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>
          </Tabs>
        </DrawerBody>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/admin/quotations?new=1">
                <FilePlus2 className="h-4 w-4" /> New Quotation
              </Link>
            </Button>
            <Button variant="luxury" className="flex-1" onClick={() => setStatusDialogOpen(true)}>
              <RefreshCw className="h-4 w-4" /> Change Status
            </Button>
          </div>
        </DrawerFooter>
      </DrawerShell>

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
      <SelectTrigger
        title="Change priority"
        className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer hover:opacity-80 transition-opacity"
      >
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
      <SelectTrigger
        title="Change payment status"
        className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer hover:opacity-80 transition-opacity"
      >
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
