"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { useBookings } from "@/hooks/use-bookings";
import { BookingDetailDrawer } from "@/components/admin/bookings/booking-detail-drawer";
import type { Booking } from "@/types/database.types";
import "./fullcalendar-overrides.css";

const EVENT_TYPE_COLORS: Record<string, string> = {
  Wedding: "#c9a961",
  Engagement: "#8f6f3f",
  Birthday: "#3b82f6",
  "Corporate Event": "#6366f1",
  Anniversary: "#ec4899",
  "Baby Shower": "#10b981",
  Reception: "#f59e0b",
  "Religious Ceremony": "#8b5cf6",
  Other: "#71717a",
};

export function BookingCalendar() {
  const { data: bookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const events = useMemo(
    () =>
      (bookings ?? []).map((b) => ({
        id: b.id,
        title: `${b.full_name} — ${b.event_type}`,
        start: b.event_time ? `${b.event_date}T${b.event_time}` : b.event_date,
        allDay: !b.event_time,
        backgroundColor: EVENT_TYPE_COLORS[b.event_type] ?? "#71717a",
        borderColor: "transparent",
        extendedProps: { booking: b },
      })),
    [bookings]
  );

  function handleEventClick(arg: EventClickArg) {
    const booking = arg.event.extendedProps.booking as Booking;
    setSelectedBooking(booking);
    setDrawerOpen(true);
  }

  async function handleEventDrop(arg: EventDropArg) {
    const booking = arg.event.extendedProps.booking as Booking;
    const newDate = arg.event.startStr.slice(0, 10);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ event_date: newDate })
      .eq("id", booking.id);

    if (error) {
      toast.error("Failed to reschedule booking");
      arg.revert();
    } else {
      toast.success(`Rescheduled ${booking.full_name} to ${newDate}`);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          height="auto"
          editable
          eventStartEditable
          eventDurationEditable
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventDisplay="block"
        />
      </div>

      <BookingDetailDrawer
        booking={selectedBooking}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
