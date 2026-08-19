import { createClient } from "@/lib/supabase/server";

export interface RevenueReportData {
  byMonth: { month: string; revenue: number }[];
  byMethod: { method: string; amount: number }[];
  totalRevenue: number;
  totalOutstanding: number;
}

export interface BookingReportData {
  byStatus: { status: string; count: number }[];
  byEventType: { eventType: string; count: number }[];
  byMonth: { month: string; count: number }[];
  totalBookings: number;
  conversionRate: number;
}

export interface CustomerReportRow {
  id: string;
  full_name: string;
  phone: string;
  bookingsCount: number;
  totalSpent: number;
}

export interface CustomerReportData {
  topCustomers: CustomerReportRow[];
  newCustomersByMonth: { month: string; count: number }[];
  totalCustomers: number;
}

export interface InventoryReportRow {
  category: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
}

export interface InventoryReportData {
  byCategory: InventoryReportRow[];
  totalValue: number;
  totalLowStock: number;
}

function lastNMonths(n: number) {
  const months: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ label: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), start, end });
  }
  return months;
}

export async function getRevenueReport(): Promise<RevenueReportData> {
  const supabase = await createClient();

  const [{ data: payments }, { data: bookings }] = await Promise.all([
    supabase.from("payments").select("amount, method, paid_at"),
    supabase.from("bookings").select("budget").neq("status", "cancelled"),
  ]);

  const all = payments ?? [];
  const totalRevenue = all.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBudget = (bookings ?? []).reduce((sum, b) => sum + (b.budget ?? 0), 0);
  const totalOutstanding = Math.max(totalBudget - totalRevenue, 0);

  const months = lastNMonths(12);
  const byMonth = months.map(({ label, start, end }) => ({
    month: label,
    revenue: all
      .filter((p) => {
        const d = new Date(p.paid_at);
        return d >= start && d < end;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0),
  }));

  const methodMap = new Map<string, number>();
  for (const p of all) {
    methodMap.set(p.method, (methodMap.get(p.method) ?? 0) + Number(p.amount));
  }
  const byMethod = Array.from(methodMap.entries()).map(([method, amount]) => ({ method, amount }));

  return { byMonth, byMethod, totalRevenue, totalOutstanding };
}

export async function getBookingReport(): Promise<BookingReportData> {
  const supabase = await createClient();
  const { data: bookings } = await supabase.from("bookings").select("status, event_type, event_date, created_at");

  const all = bookings ?? [];
  const totalBookings = all.length;

  const statusMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  for (const b of all) {
    statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
    typeMap.set(b.event_type, (typeMap.get(b.event_type) ?? 0) + 1);
  }

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
  const byEventType = Array.from(typeMap.entries()).map(([eventType, count]) => ({ eventType, count }));

  const months = lastNMonths(12);
  const byMonth = months.map(({ label, start, end }) => ({
    month: label,
    count: all.filter((b) => {
      const d = new Date(b.created_at);
      return d >= start && d < end;
    }).length,
  }));

  const confirmedOrBetter = all.filter((b) =>
    ["confirmed", "decoration_started", "completed"].includes(b.status)
  ).length;
  const conversionRate = totalBookings > 0 ? Math.round((confirmedOrBetter / totalBookings) * 100) : 0;

  return { byStatus, byEventType, byMonth, totalBookings, conversionRate };
}

export async function getCustomerReport(): Promise<CustomerReportData> {
  const supabase = await createClient();

  const [{ data: customers }, { data: bookings }, { data: payments }] = await Promise.all([
    supabase.from("customers").select("id, full_name, phone, created_at"),
    supabase.from("bookings").select("customer_id"),
    supabase.from("payments").select("customer_id, amount"),
  ]);

  const bookingCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    if (!b.customer_id) continue;
    bookingCounts.set(b.customer_id, (bookingCounts.get(b.customer_id) ?? 0) + 1);
  }

  const spentMap = new Map<string, number>();
  for (const p of payments ?? []) {
    if (!p.customer_id) continue;
    spentMap.set(p.customer_id, (spentMap.get(p.customer_id) ?? 0) + Number(p.amount));
  }

  const rows: CustomerReportRow[] = (customers ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    phone: c.phone,
    bookingsCount: bookingCounts.get(c.id) ?? 0,
    totalSpent: spentMap.get(c.id) ?? 0,
  }));

  const topCustomers = [...rows].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

  const months = lastNMonths(12);
  const newCustomersByMonth = months.map(({ label, start, end }) => ({
    month: label,
    count: (customers ?? []).filter((c) => {
      const d = new Date(c.created_at);
      return d >= start && d < end;
    }).length,
  }));

  return { topCustomers, newCustomersByMonth, totalCustomers: (customers ?? []).length };
}

export async function getInventoryReport(): Promise<InventoryReportData> {
  const supabase = await createClient();
  const { data: items } = await supabase.from("inventory").select("category, quantity, purchase_price");

  const LOW_STOCK_THRESHOLD = 5;
  const categoryMap = new Map<string, InventoryReportRow>();

  for (const item of items ?? []) {
    const entry = categoryMap.get(item.category) ?? {
      category: item.category,
      itemCount: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStockCount: 0,
    };
    entry.itemCount += 1;
    entry.totalQuantity += item.quantity;
    entry.totalValue += (item.purchase_price ?? 0) * item.quantity;
    if (item.quantity <= LOW_STOCK_THRESHOLD) entry.lowStockCount += 1;
    categoryMap.set(item.category, entry);
  }

  const byCategory = Array.from(categoryMap.values());
  const totalValue = byCategory.reduce((sum, c) => sum + c.totalValue, 0);
  const totalLowStock = byCategory.reduce((sum, c) => sum + c.lowStockCount, 0);

  return { byCategory, totalValue, totalLowStock };
}
