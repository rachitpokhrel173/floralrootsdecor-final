"use client";

import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBookings } from "@/hooks/use-bookings";
import { getInitials, formatDate, daysUntil } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "destructive" | "luxury"> = {
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

export function RecentActivity() {
  const { data: bookings, isLoading } = useBookings();
  const recent = (bookings ?? []).slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-base font-normal">Recent Bookings</CardTitle>
        <Link href="/admin/bookings" className="text-xs text-gold hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}

        {!isLoading && recent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CalendarPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No bookings yet — new submissions will appear here instantly.
            </p>
          </div>
        )}

        {recent.map((b, i) => {
          const days = daysUntil(b.event_date);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/admin/bookings?id=${b.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-accent transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gold/15 text-gold-dark text-xs">
                    {getInitials(b.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {b.event_type} · {formatDate(b.event_date)}
                    {days >= 0 ? ` · ${days}d left` : ""}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[b.status] ?? "default"} className="capitalize shrink-0">
                  {b.status.replace(/_/g, " ")}
                </Badge>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
