"use client";

import type { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate, getInitials, daysUntil, cn } from "@/lib/utils";
import { BookingStatusBadge, BookingPriorityBadge, PaymentStatusBadge } from "./booking-badges";
import type { Booking } from "@/types/database.types";

function SortableHeader({ label, column }: { label: string; column: Column<Booking, unknown> }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 text-xs font-semibold"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3 w-3" />
    </Button>
  );
}

export const bookingsColumns: ColumnDef<Booking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "booking_code",
    header: ({ column }) => <SortableHeader label="Booking ID" column={column} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-mono text-xs font-medium">
        {row.original.is_favorite && <Star className="h-3 w-3 fill-gold text-gold" />}
        {row.original.booking_code}
      </div>
    ),
  },
  {
    id: "client",
    header: "Client",
    accessorFn: (row) => row.full_name,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-[160px]">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gold/15 text-gold-dark text-[10px]">
            {getInitials(row.original.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.phone}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email ?? "—"}</span>
    ),
  },
  {
    accessorKey: "event_type",
    header: ({ column }) => <SortableHeader label="Event Type" column={column} />,
  },
  {
    accessorKey: "event_date",
    header: ({ column }) => <SortableHeader label="Event Date" column={column} />,
    cell: ({ row }) => formatDate(row.original.event_date),
  },
  {
    id: "days_remaining",
    header: "Days Left",
    accessorFn: (row) => daysUntil(row.event_date),
    cell: ({ row }) => {
      const days = daysUntil(row.original.event_date);
      return (
        <span
          className={cn(
            "text-sm font-medium",
            days < 0 && "text-muted-foreground",
            days >= 0 && days <= 7 && "text-red-500",
            days > 7 && "text-foreground"
          )}
        >
          {days < 0 ? "Past" : `${days}d`}
        </span>
      );
    },
  },
  {
    accessorKey: "budget",
    header: ({ column }) => <SortableHeader label="Budget" column={column} />,
    cell: ({ row }) => formatCurrency(row.original.budget),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <BookingPriorityBadge priority={row.original.priority} />,
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => <PaymentStatusBadge status={row.original.payment_status} />,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader label="Created" column={column} />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span>
    ),
  },
];
