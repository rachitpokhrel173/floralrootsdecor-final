import { createClient } from "@/lib/supabase/server";
import type { Vendor, VendorPayment } from "@/types/database.types";

export interface VendorWithStats extends Vendor {
  totalPaid: number;
  paymentCount: number;
}

export async function getVendorsWithStats(): Promise<VendorWithStats[]> {
  const supabase = await createClient();

  const [{ data: vendors, error }, { data: payments }] = await Promise.all([
    supabase.from("vendors").select("*").order("created_at", { ascending: false }),
    supabase.from("vendor_payments").select("vendor_id, amount"),
  ]);

  if (error) {
    console.error("getVendorsWithStats: query failed", error.message);
    return [];
  }

  const paidMap = new Map<string, { total: number; count: number }>();
  for (const p of payments ?? []) {
    const entry = paidMap.get(p.vendor_id) ?? { total: 0, count: 0 };
    entry.total += Number(p.amount);
    entry.count += 1;
    paidMap.set(p.vendor_id, entry);
  }

  return (vendors ?? []).map((v) => ({
    ...v,
    totalPaid: paidMap.get(v.id)?.total ?? 0,
    paymentCount: paidMap.get(v.id)?.count ?? 0,
  }));
}

export async function getVendorPayments(vendorId: string): Promise<VendorPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendor_payments")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("getVendorPayments: query failed", error.message);
    return [];
  }
  return data ?? [];
}
