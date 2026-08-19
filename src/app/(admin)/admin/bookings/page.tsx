"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBookings } from "@/hooks/use-bookings";
import { BookingsDataTable } from "@/components/admin/bookings/bookings-data-table";
import { bookingsColumns } from "@/components/admin/bookings/bookings-columns";
import { BookingDetailDrawer } from "@/components/admin/bookings/booking-detail-drawer";
import type { Booking } from "@/types/database.types";

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageContent() {
  const { data: bookings, isLoading } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchParams = useSearchParams();

  // Auto-open drawer if navigated here with ?id=...
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && bookings) {
      const found = bookings.find((b) => b.id === id);
      if (found) {
        setSelectedBooking(found);
        setDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, bookings?.length]);

  function handleRowClick(booking: Booking) {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every booking submitted through your website appears here instantly.
        </p>
      </div>

      <BookingsDataTable
        columns={bookingsColumns}
        data={bookings ?? []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      <BookingDetailDrawer
        booking={selectedBooking}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
