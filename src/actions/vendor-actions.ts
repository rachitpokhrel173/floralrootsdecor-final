"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getVendorsWithStats, getVendorPayments } from "@/lib/data/vendors";
import { vendorSchema, vendorPaymentSchema, type VendorFormValues, type VendorPaymentFormValues } from "@/lib/validations/vendor";

export interface VendorActionResult {
  success: boolean;
  error?: string;
}

export async function getVendorsAction() {
  return getVendorsWithStats();
}

export async function getVendorPaymentsAction(vendorId: string) {
  return getVendorPayments(vendorId);
}

export async function createVendorAction(values: VendorFormValues): Promise<VendorActionResult> {
  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").insert({
    name: parsed.data.name,
    category: parsed.data.category,
    contact_person: parsed.data.contact_person || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    rating: parsed.data.rating ?? null,
    notes: parsed.data.notes || null,
    is_active: parsed.data.is_active,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/vendors");
  return { success: true };
}

export async function updateVendorAction(
  vendorId: string,
  values: VendorFormValues
): Promise<VendorActionResult> {
  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vendors")
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      contact_person: parsed.data.contact_person || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      rating: parsed.data.rating ?? null,
      notes: parsed.data.notes || null,
      is_active: parsed.data.is_active,
    })
    .eq("id", vendorId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/vendors");
  return { success: true };
}

export async function deleteVendorAction(vendorId: string): Promise<VendorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/vendors");
  return { success: true };
}

export async function recordVendorPaymentAction(
  vendorId: string,
  values: VendorPaymentFormValues
): Promise<VendorActionResult> {
  const parsed = vendorPaymentSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendor_payments").insert({
    vendor_id: vendorId,
    booking_id: parsed.data.booking_id || null,
    amount: parsed.data.amount,
    notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/vendors");
  return { success: true };
}
