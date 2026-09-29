"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Inquiry } from "@/types/database.types";

export interface InquiryActionResult {
  success: boolean;
  error?: string;
}

/**
 * `setupRequired` is true when the inquiries table doesn't exist yet
 * (migration 0014 not run) so the page can show setup instructions —
 * thrown error messages are redacted in production, so we flag it instead.
 */
export async function getInquiriesAction(): Promise<{ inquiries: Inquiry[]; setupRequired: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    // 42P01 = undefined table (Postgres); PGRST205 = table not in PostgREST schema cache
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { inquiries: [], setupRequired: true };
    }
    console.error("getInquiriesAction:", error.message);
    throw new Error(error.message);
  }
  return { inquiries: data ?? [], setupRequired: false };
}

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "closed"]).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function updateInquiryAction(
  id: string,
  updates: z.infer<typeof updateSchema>
): Promise<InquiryActionResult> {
  const parsed = updateSchema.safeParse(updates);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update(parsed.data).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function deleteInquiryAction(id: string): Promise<InquiryActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inquiries");
  return { success: true };
}
