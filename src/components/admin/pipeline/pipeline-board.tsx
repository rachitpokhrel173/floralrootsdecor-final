"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBookings } from "@/hooks/use-bookings";
import { updateBookingAction } from "@/actions/booking-management-actions";
import { getInitials, formatDate, formatCurrency, cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS: { status: BookingStatus; label: string; color: string }[] = [
  { status: "new", label: "New", color: "bg-blue-500" },
  { status: "contacted", label: "Contacted", color: "bg-slate-400" },
  { status: "meeting", label: "Meeting", color: "bg-indigo-500" },
  { status: "quotation_sent", label: "Quotation Sent", color: "bg-amber-500" },
  { status: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { status: "confirmed", label: "Confirmed", color: "bg-gold" },
  { status: "decoration_started", label: "Decoration Started", color: "bg-purple-500" },
  { status: "completed", label: "Completed", color: "bg-emerald-500" },
  { status: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

function PipelineCard({ booking, isOverlay }: { booking: Booking; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
    data: booking,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-xl border border-border bg-card p-3.5 shadow-sm cursor-grab active:cursor-grabbing select-none",
        (isDragging || isOverlay) && "opacity-90 shadow-lg ring-2 ring-gold rotate-2"
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-gold/15 text-gold-dark text-[10px]">
            {getInitials(booking.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{booking.full_name}</p>
          <p className="text-[11px] text-muted-foreground truncate font-mono">
            {booking.booking_code}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{booking.event_type}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{formatDate(booking.event_date)}</span>
        <Badge variant="outline" className="text-[10px]">
          {formatCurrency(booking.budget)}
        </Badge>
      </div>
    </div>
  );
}

function PipelineColumn({
  status,
  label,
  color,
  bookings,
}: {
  status: BookingStatus;
  label: string;
  color: string;
  bookings: Booking[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-muted/30 transition-colors",
        isOver && "bg-gold/10 border-gold/40"
      )}
    >
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border">
        <span className={cn("h-2 w-2 rounded-full", color)} />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{bookings.length}</span>
      </div>
      <div className="flex-1 space-y-2 p-2.5 min-h-[120px] max-h-[70vh] overflow-y-auto">
        {bookings.map((b) => (
          <PipelineCard key={b.id} booking={b} />
        ))}
        {bookings.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/60">
            No bookings
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard() {
  const { data: bookings, isLoading } = useBookings();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const col of COLUMNS) map[col.status] = [];
    for (const b of bookings ?? []) {
      if (map[b.status]) map[b.status].push(b);
    }
    return map;
  }, [bookings]);

  function handleDragStart(event: DragStartEvent) {
    const booking = event.active.data.current as Booking | undefined;
    if (booking) setActiveBooking(booking);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveBooking(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as BookingStatus;
    const booking = active.data.current as Booking;
    if (!booking || booking.status === newStatus) return;

    const result = await updateBookingAction(booking.id, { status: newStatus });
    if (result.success) {
      toast.success(`${booking.full_name} moved to ${newStatus.replace(/_/g, " ")}`);
    } else {
      toast.error(result.error ?? "Failed to update status");
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((c) => (
          <Skeleton key={c.status} className="h-96 w-72 shrink-0 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <PipelineColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            bookings={grouped[col.status] ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeBooking && <PipelineCard booking={activeBooking} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
