"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCustomersWithStats, type CustomerWithStats } from "@/lib/data/customers";
import type { Customer } from "@/types/database.types";

export async function getCustomersWithStatsAction(): Promise<CustomerWithStats[]> {
  return getCustomersWithStats();
}

type CustomerUpdatable = Partial<
  Pick<
    Customer,
    | "is_favorite"
    | "tags"
    | "budget_range_min"
    | "budget_range_max"
    | "favorite_decorations"
    | "notes"
    | "address"
  >
>;

export async function updateCustomerAction(customerId: string, updates: CustomerUpdatable) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update(updates).eq("id", customerId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function addCustomerNoteAction(customerId: string, note: string, bookingId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("customer_notes").insert({
    customer_id: customerId,
    booking_id: bookingId ?? null,
    note,
    user_id: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function deleteCustomerNoteAction(noteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customer_notes").delete().eq("id", noteId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function togglePinCustomerNoteAction(noteId: string, isPinned: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_notes")
    .update({ is_pinned: isPinned })
    .eq("id", noteId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}
