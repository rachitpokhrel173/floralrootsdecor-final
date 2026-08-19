import type { CustomerWithStats } from "@/lib/data/customers";

export function exportCustomersToCsv(customers: CustomerWithStats[], filename = "customers-export.csv") {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Bookings",
    "Total Spent",
    "Last Event",
    "Tags",
    "Favorite",
    "Joined",
  ];

  const rows = customers.map((c) => [
    c.full_name,
    c.phone,
    c.email ?? "",
    c.bookingsCount.toString(),
    c.totalSpent.toString(),
    c.lastEventType ?? "",
    (c.tags ?? []).join("; "),
    c.is_favorite ? "Yes" : "No",
    c.created_at,
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
