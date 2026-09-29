import Link from "next/link";
import { CalendarDays, MapPin, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/database.types";

const PAYMENT_VARIANT: Record<string, "success" | "warning" | "destructive" | "default"> = {
  paid: "success",
  partial: "warning",
  unpaid: "destructive",
  refunded: "default",
};

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function countdownLabel(eventDate: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }).format(new Date());
  const days = Math.round((Date.parse(eventDate) - Date.parse(today)) / 86_400_000);
  if (days === 0) return { label: "Today", urgent: true };
  if (days === 1) return { label: "Tomorrow", urgent: true };
  return { label: `In ${days} days`, urgent: days <= 3 };
}

export function UpcomingEvents({ events }: { events: Booking[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="font-display text-base font-normal">Next 14 days</CardTitle>
        <Link href="/admin/calendar" className="text-xs text-gold hover:underline">
          Open calendar
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No events in the next two weeks.</p>
          </div>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-4">
            {events.slice(0, 8).map((b) => {
              const { label, urgent } = countdownLabel(b.event_date);
              const date = new Date(`${b.event_date}T00:00:00`);
              return (
                <li key={b.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full ring-4 ring-card",
                      urgent ? "bg-gold" : "bg-muted-foreground/40"
                    )}
                  />
                  <Link
                    href={`/admin/bookings?id=${b.id}`}
                    className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gold/10 py-1 text-gold-dark">
                      <span className="text-[10px] font-medium uppercase">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="font-display text-lg leading-none">{date.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">{b.full_name}</p>
                        <span
                          className={cn(
                            "shrink-0 text-[11px] font-medium",
                            urgent ? "text-gold-dark" : "text-muted-foreground"
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.event_type}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {b.event_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTime(b.event_time)}
                          </span>
                        )}
                        {b.venue && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{b.venue}</span>
                          </span>
                        )}
                        {b.guest_count ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" /> {b.guest_count}
                          </span>
                        ) : null}
                        <Badge
                          variant={PAYMENT_VARIANT[b.payment_status] ?? "default"}
                          className="h-4 px-1.5 text-[10px] capitalize"
                        >
                          {b.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
