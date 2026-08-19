import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database.types";

export interface CustomerWithStats extends Customer {
  bookingsCount: number;
  totalSpent: number;
  lastBookingDate: string | null;
  lastEventType: string | null;
}

export async function getCustomersWithStats(): Promise<CustomerWithStats[]> {
  const supabase = await createClient();

  const [{ data: customers, error: customersError }, { data: bookings }, { data: payments }] =
    await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("customer_id, event_date, event_type, created_at")
        .order("event_date", { ascending: false }),
      supabase.from("payments").select("customer_id, amount"),
    ]);

  if (customersError) {
    console.error("getCustomersWithStats: query failed", customersError.message);
    return [];
  }

  const bookingsByCustomer = new Map<string, { count: number; lastDate: string; lastType: string }>();
  for (const b of bookings ?? []) {
    if (!b.customer_id) continue;
    const existing = bookingsByCustomer.get(b.customer_id);
    if (!existing) {
      bookingsByCustomer.set(b.customer_id, {
        count: 1,
        lastDate: b.event_date,
        lastType: b.event_type,
      });
    } else {
      existing.count += 1;
      if (b.event_date > existing.lastDate) {
        existing.lastDate = b.event_date;
        existing.lastType = b.event_type;
      }
    }
  }

  const spentByCustomer = new Map<string, number>();
  for (const p of payments ?? []) {
    if (!p.customer_id) continue;
    spentByCustomer.set(p.customer_id, (spentByCustomer.get(p.customer_id) ?? 0) + Number(p.amount));
  }

  return (customers ?? []).map((c) => {
    const bookingStats = bookingsByCustomer.get(c.id);
    return {
      ...c,
      bookingsCount: bookingStats?.count ?? 0,
      totalSpent: spentByCustomer.get(c.id) ?? 0,
      lastBookingDate: bookingStats?.lastDate ?? null,
      lastEventType: bookingStats?.lastType ?? null,
    };
  });
}
