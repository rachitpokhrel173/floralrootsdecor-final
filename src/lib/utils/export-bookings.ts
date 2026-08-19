import type { Booking } from "@/types/database.types";

/** Builds and downloads a CSV file from the given bookings — runs entirely client-side. */
export function exportBookingsToCsv(bookings: Booking[], filename = "bookings-export.csv") {
  const headers = [
    "Booking ID",
    "Client Name",
    "Phone",
    "Email",
    "Event Type",
    "Event Date",
    "Venue",
    "Guests",
    "Budget",
    "Status",
    "Priority",
    "Payment Status",
    "Created At",
  ];

  const rows = bookings.map((b) => [
    b.booking_code,
    b.full_name,
    b.phone,
    b.email ?? "",
    b.event_type,
    b.event_date,
    b.venue ?? "",
    b.guest_count?.toString() ?? "",
    b.budget?.toString() ?? "",
    b.status,
    b.priority,
    b.payment_status,
    b.created_at,
  ]);

  const escapeCell = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
