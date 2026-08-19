import { createClient } from "@/lib/supabase/server";
import type { Booking, Payment } from "@/types/database.types";

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
};

/**
 * Pulls everything the dashboard needs directly from Supabase.
 * No mock data — if tables are empty, stats simply show as 0.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ data: bookings, error: bookingsError }, { data: payments, error: paymentsError }, { count: customerCount }] =
    await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const todaysBookings = allBookings.filter((b) => b.event_date === todayStr).length;
  const upcomingEvents = allBookings.filter(
    (b) => new Date(b.event_date) >= now && !["completed", "cancelled"].includes(b.status)
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
  };
}
