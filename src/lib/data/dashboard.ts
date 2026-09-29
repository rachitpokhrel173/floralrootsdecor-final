import { createClient } from "@/lib/supabase/server";
import type { Booking, Payment } from "@/types/database.types";
import { LOW_STOCK_THRESHOLD } from "@/lib/validations/inventory";

export type AttentionKind =
  | "uncontacted"
  | "unconfirmed_soon"
  | "stale_quotation"
  | "overdue_invoice"
  | "unpaid_soon"
  | "low_stock";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  detail: string;
  href: string;
  severity: "high" | "medium";
}

export interface DashboardStats {
  todaysBookings: number;
  upcomingEvents: number;
  pendingQuotations: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalCustomers: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  outstandingAmount: number;
  conversionRate: number;
  bookings: Booking[];
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByEventType: { name: string; value: number }[];
  /** Events in the next 14 days (excluding cancelled/completed), soonest first */
  upcoming: Booking[];
  /** Things the team should act on, most urgent first */
  attention: AttentionItem[];
}

const EMPTY_STATS: DashboardStats = {
  todaysBookings: 0,
  upcomingEvents: 0,
  pendingQuotations: 0,
  monthlyRevenue: 0,
  yearlyRevenue: 0,
  totalCustomers: 0,
  activeEvents: 0,
  completedEvents: 0,
  cancelledEvents: 0,
  outstandingAmount: 0,
  conversionRate: 0,
  bookings: [],
  revenueByMonth: [],
  bookingsByEventType: [],
  upcoming: [],
  attention: [],
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date as YYYY-MM-DD in Nepal time, regardless of the server's timezone. */
function todayInNepal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }).format(new Date());
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
function dayDiff(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
}

function inDays(n: number) {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  return `in ${n} days`;
}

/**
 * Pulls everything the dashboard needs directly from Supabase.
 * No mock data — if tables are empty, stats simply show as 0.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { data: bookings, error: bookingsError },
    { data: payments, error: paymentsError },
    { count: customerCount },
    { data: sentQuotations },
    { data: openInvoices },
    { data: lowStockItems },
  ] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("quotations")
      .select("id, quotation_number, updated_at, booking:bookings(full_name)")
      .eq("status", "sent"),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount_due, due_date, booking:bookings(full_name)")
      .not("status", "in", "(paid,cancelled,draft)")
      .not("due_date", "is", null),
    supabase
      .from("inventory")
      .select("id, name, quantity")
      .lte("quantity", LOW_STOCK_THRESHOLD)
      .order("quantity", { ascending: true }),
  ]);

  if (bookingsError) {
    console.error("getDashboardStats: bookings query failed", bookingsError.message);
    return EMPTY_STATS;
  }
  if (paymentsError) {
    console.error("getDashboardStats: payments query failed", paymentsError.message);
  }

  const allBookings = bookings ?? [];
  const allPayments: Payment[] = payments ?? [];

  const todayStr = todayInNepal();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const todaysBookings = allBookings.filter((b) => b.event_date === todayStr).length;
  const upcomingEvents = allBookings.filter(
    (b) => b.event_date >= todayStr && !["completed", "cancelled"].includes(b.status)
  ).length;
  const pendingQuotations = allBookings.filter((b) => b.quotation_status === "sent").length;
  const activeEvents = allBookings.filter(
    (b) => !["completed", "cancelled", "new"].includes(b.status)
  ).length;
  const completedEvents = allBookings.filter((b) => b.status === "completed").length;
  const cancelledEvents = allBookings.filter((b) => b.status === "cancelled").length;

  const monthlyRevenue = allPayments
    .filter((p) => new Date(p.paid_at) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const yearlyRevenue = allPayments
    .filter((p) => new Date(p.paid_at) >= startOfYear)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalBudget = allBookings.reduce((sum, b) => sum + (b.budget ?? 0), 0);
  const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstandingAmount = Math.max(totalBudget - totalPaid, 0);

  const confirmedOrBetter = allBookings.filter((b) =>
    ["confirmed", "decoration_started", "completed"].includes(b.status)
  ).length;
  const conversionRate = allBookings.length > 0
    ? Math.round((confirmedOrBetter / allBookings.length) * 100)
    : 0;

  // Revenue for the last 6 months
  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const revenue = allPayments
      .filter((p) => {
        const paidAt = new Date(p.paid_at);
        return paidAt >= monthStart && paidAt < monthEnd;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
    revenueByMonth.push({ month: d.toLocaleDateString("en-US", { month: "short" }), revenue });
  }

  // Booking distribution by event type
  const typeMap = new Map<string, number>();
  for (const b of allBookings) {
    typeMap.set(b.event_type, (typeMap.get(b.event_type) ?? 0) + 1);
  }
  const bookingsByEventType = Array.from(typeMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const upcoming = allBookings
    .filter((b) => {
      const d = dayDiff(todayStr, b.event_date);
      return d >= 0 && d <= 14 && !["completed", "cancelled"].includes(b.status);
    })
    .sort((a, b) =>
      a.event_date === b.event_date
        ? (a.event_time ?? "").localeCompare(b.event_time ?? "")
        : a.event_date.localeCompare(b.event_date)
    );

  const attention = buildAttentionItems({
    bookings: allBookings,
    todayStr,
    sentQuotations: (sentQuotations ?? []) as unknown as StaleQuotationRow[],
    openInvoices: (openInvoices ?? []) as unknown as OpenInvoiceRow[],
    lowStockItems: lowStockItems ?? [],
  });

  return {
    todaysBookings,
    upcomingEvents,
    pendingQuotations,
    monthlyRevenue,
    yearlyRevenue,
    totalCustomers: customerCount ?? 0,
    activeEvents,
    completedEvents,
    cancelledEvents,
    outstandingAmount,
    conversionRate,
    bookings: allBookings,
    revenueByMonth,
    bookingsByEventType,
    upcoming,
    attention,
  };
}

interface StaleQuotationRow {
  id: string;
  quotation_number: string;
  updated_at: string;
  booking: { full_name: string } | null;
}

interface OpenInvoiceRow {
  id: string;
  invoice_number: string;
  amount_due: number;
  due_date: string;
  booking: { full_name: string } | null;
}

function buildAttentionItems({
  bookings,
  todayStr,
  sentQuotations,
  openInvoices,
  lowStockItems,
}: {
  bookings: Booking[];
  todayStr: string;
  sentQuotations: StaleQuotationRow[];
  openInvoices: OpenInvoiceRow[];
  lowStockItems: { id: string; name: string; quantity: number }[];
}): AttentionItem[] {
  const items: AttentionItem[] = [];
  const now = Date.now();

  for (const b of bookings) {
    // New enquiries nobody has contacted within a day
    if (b.status === "new") {
      const days = Math.floor((now - Date.parse(b.created_at)) / DAY_MS);
      if (days >= 1) {
        items.push({
          id: `uncontacted-${b.id}`,
          kind: "uncontacted",
          title: `Contact ${b.full_name}`,
          detail: `New ${b.event_type} enquiry waiting ${days} day${days === 1 ? "" : "s"} · ${b.phone}`,
          href: `/admin/bookings?id=${b.id}`,
          severity: days >= 3 ? "high" : "medium",
        });
      }
    }

    // Events within a week that still aren't confirmed, or aren't fully paid
    if (["completed", "cancelled"].includes(b.status)) continue;
    const d = dayDiff(todayStr, b.event_date);
    if (d < 0 || d > 7) continue;
    if (!["confirmed", "decoration_started"].includes(b.status)) {
      items.push({
        id: `unconfirmed-${b.id}`,
        kind: "unconfirmed_soon",
        title: `${b.full_name}'s ${b.event_type} is ${inDays(d)}`,
        detail: `Still marked "${b.status.replace(/_/g, " ")}" — confirm or update the booking`,
        href: `/admin/bookings?id=${b.id}`,
        severity: d <= 2 ? "high" : "medium",
      });
    } else if (b.payment_status !== "paid") {
      items.push({
        id: `unpaid-${b.id}`,
        kind: "unpaid_soon",
        title: `Collect payment from ${b.full_name}`,
        detail: `${b.event_type} ${inDays(d)} · payment ${b.payment_status}`,
        href: `/admin/bookings?id=${b.id}`,
        severity: d <= 2 ? "high" : "medium",
      });
    }
  }

  // Quotations sent 5+ days ago with no response
  for (const q of sentQuotations) {
    const days = Math.floor((now - Date.parse(q.updated_at)) / DAY_MS);
    if (days < 5) continue;
    items.push({
      id: `quote-${q.id}`,
      kind: "stale_quotation",
      title: `Follow up on ${q.quotation_number}`,
      detail: `Sent to ${q.booking?.full_name ?? "client"} ${days} days ago — no reply yet`,
      href: "/admin/quotations",
      severity: days >= 10 ? "high" : "medium",
    });
  }

  // Invoices past their due date
  for (const inv of openInvoices) {
    const late = dayDiff(inv.due_date, todayStr);
    if (late <= 0 || Number(inv.amount_due) <= 0) continue;
    items.push({
      id: `invoice-${inv.id}`,
      kind: "overdue_invoice",
      title: `${inv.invoice_number} is overdue`,
      detail: `${inv.booking?.full_name ?? "Client"} owes Rs. ${Number(inv.amount_due).toLocaleString("en-IN")} · ${late} day${late === 1 ? "" : "s"} late`,
      href: "/admin/invoices",
      severity: "high",
    });
  }

  if (lowStockItems.length > 0) {
    const names = lowStockItems.slice(0, 3).map((i) => `${i.name} (${i.quantity})`).join(", ");
    const extra = lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : "";
    items.push({
      id: "low-stock",
      kind: "low_stock",
      title: `${lowStockItems.length} inventory item${lowStockItems.length === 1 ? "" : "s"} running low`,
      detail: names + extra,
      href: "/admin/inventory?lowStock=1",
      severity: "medium",
    });
  }

  // Stable sort: high-severity first, original grouping preserved within each level
  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));
}
