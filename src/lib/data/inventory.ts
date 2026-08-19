import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/types/database.types";

export interface InventoryWithSupplier extends InventoryItem {
  supplierName: string | null;
}

export async function getInventoryWithSupplier(): Promise<InventoryWithSupplier[]> {
  const supabase = await createClient();

  const [{ data: items, error }, { data: vendors }] = await Promise.all([
    supabase.from("inventory").select("*").order("created_at", { ascending: false }),
    supabase.from("vendors").select("id, name"),
  ]);

  if (error) {
    console.error("getInventoryWithSupplier: query failed", error.message);
    return [];
  }

  const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v.name]));

  return (items ?? []).map((item) => ({
    ...item,
    supplierName: item.supplier_id ? vendorMap.get(item.supplier_id) ?? null : null,
  }));
}

export interface VendorOption {
  id: string;
  name: string;
}

export async function getActiveVendorOptions(): Promise<VendorOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getActiveVendorOptions: query failed", error.message);
    return [];
  }
  return data ?? [];
}
