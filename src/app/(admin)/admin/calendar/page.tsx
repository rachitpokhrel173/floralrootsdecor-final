"use client";

import { BookingCalendar } from "@/components/admin/calendar/booking-calendar";
import { NepaliCalendar } from "@/components/nepali-calendar/nepali-calendar";
import { useBookings } from "@/hooks/use-bookings";

export default function CalendarPage() {
  const { data: bookings } = useBookings();
  const eventDates = (bookings ?? []).map((b) => b.event_date);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drag to reschedule events. Dates with bookings are marked on the Nepali calendar too.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
        <BookingCalendar />
        <NepaliCalendar eventDates={eventDates} />
      </div>
    </div>
  );
}
