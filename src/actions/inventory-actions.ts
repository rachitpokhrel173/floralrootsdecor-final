"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getInventoryWithSupplier, getActiveVendorOptions } from "@/lib/data/inventory";
import { inventorySchema, type InventoryFormValues } from "@/lib/validations/inventory";

export interface InventoryActionResult {
  success: boolean;
  error?: string;
}

export async function getInventoryAction() {
  return getInventoryWithSupplier();
}

export async function getActiveVendorOptionsAction() {
  return getActiveVendorOptions();
}

function toInsertPayload(values: InventoryFormValues) {
  return {
    name: values.name,
    category: values.category,
    sku: values.sku || null,
    barcode: values.barcode || null,
    qr_code: values.qr_code || null,
    quantity: values.quantity,
    unit: values.unit || "pcs",
    supplier_id: values.supplier_id || null,
    purchase_price: values.purchase_price ?? null,
    is_available: values.is_available,
    location: values.location || null,
  };
}

export async function createInventoryItemAction(values: InventoryFormValues): Promise<InventoryActionResult> {
  const parsed = inventorySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inventory").insert(toInsertPayload(parsed.data));

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function updateInventoryItemAction(
  itemId: string,
  values: InventoryFormValues
): Promise<InventoryActionResult> {
  const parsed = inventorySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory")
    .update(toInsertPayload(parsed.data))
    .eq("id", itemId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function deleteInventoryItemAction(itemId: string): Promise<InventoryActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory").delete().eq("id", itemId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function adjustStockAction(itemId: string, delta: number): Promise<InventoryActionResult> {
  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) return { success: false, error: fetchError?.message ?? "Item not found" };

  const newQuantity = Math.max(item.quantity + delta, 0);
  const { error } = await supabase.from("inventory").update({ quantity: newQuantity }).eq("id", itemId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}
