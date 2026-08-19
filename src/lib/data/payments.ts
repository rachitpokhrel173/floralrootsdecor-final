import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/database.types";

export interface PaymentWithDetails extends Payment {
  booking: {
    id: string;
    booking_code: string;
    full_name: string;
    event_type: string;
    event_date: string;
  } | null;
  invoice: { id: string; invoice_number: string } | null;
  received_by_name: string | null;
}

export interface PaymentStats {
  totalReceived: number;
  todayReceived: number;
  monthReceived: number;
  yearReceived: number;
  totalOutstanding: number;
  byMethod: { method: string; amount: number }[];
}

export async function getPaymentsWithDetails(): Promise<PaymentWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `*,
      booking:bookings(id, booking_code, full_name, event_type, event_date),
      invoice:invoices(id, invoice_number)`
    )
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("getPaymentsWithDetails: query failed", error.message);
    return [];
  }

  // received_by references public.users(id); resolve names in a second pass
  // rather than relying on a PostgREST embed (users has its own RLS shape).
  const userIds = Array.from(
    new Set((data ?? []).map((p) => p.received_by).filter((id): id is string => !!id))
  );

  let nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, full_name").in("id", userIds);
    nameMap = new Map((users ?? []).map((u) => [u.id, u.full_name]));
  }

  return ((data ?? []) as unknown as Omit<PaymentWithDetails, "received_by_name">[]).map((p) => ({
    ...p,
    received_by_name: p.received_by ? nameMap.get(p.received_by) ?? null : null,
  }));
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const supabase = await createClient();

  const [{ data: payments }, { data: bookings }] = await Promise.all([
    supabase.from("payments").select("amount, method, paid_at"),
    supabase.from("bookings").select("budget").not("status", "in", "(cancelled)"),
  ]);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const all = payments ?? [];
  const totalReceived = all.reduce((sum, p) => sum + Number(p.amount), 0);
  const todayReceived = all
    .filter((p) => new Date(p.paid_at) >= startOfDay)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const monthReceived = all
    .filter((p) => new Date(p.paid_at) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const yearReceived = all
    .filter((p) => new Date(p.paid_at) >= startOfYear)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalBudget = (bookings ?? []).reduce((sum, b) => sum + (b.budget ?? 0), 0);
  const totalOutstanding = Math.max(totalBudget - totalReceived, 0);

  const methodMap = new Map<string, number>();
  for (const p of all) {
    methodMap.set(p.method, (methodMap.get(p.method) ?? 0) + Number(p.amount));
  }
  const byMethod = Array.from(methodMap.entries()).map(([method, amount]) => ({ method, amount }));

  return { totalReceived, todayReceived, monthReceived, yearReceived, totalOutstanding, byMethod };
}
