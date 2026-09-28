"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { quotationSharePath } from "@/lib/quotation-share";
import type { QuotationStatus } from "@/types/database.types";

const acceptSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{32}$/),
  name: z
    .string()
    .trim()
    .min(2, "Please type your full name to accept.")
    .max(80, "That name is too long."),
});

/**
 * Client-side acceptance from the public share page. No login — the share
 * token is the capability, so this runs with the service-role client and
 * only ever touches the single quotation that token identifies.
 *
 * Accepting auto-approves the quotation (records the typed name as the
 * acceptance signature), syncs the booking's quotation status, and notifies
 * all admins.
 */
export async function acceptQuotationAction(token: string, name: string) {
  const parsed = acceptSchema.safeParse({ token, name });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const supabase = createAdminClient();

  const { data: quotation } = await supabase
    .from("quotations")
    .select("id, booking_id, quotation_number, status, valid_until, booking:bookings(full_name)")
    .eq("share_token", parsed.data.token)
    .maybeSingle();

  if (!quotation) return { success: false as const, error: "This quotation link is no longer valid." };

  if (quotation.status === "approved") return { success: true as const };
  if (quotation.status === "rejected") {
    return { success: false as const, error: "This quotation is no longer active. Please contact us." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (quotation.status === "expired" || (quotation.valid_until && quotation.valid_until < today)) {
    return {
      success: false as const,
      error: "This quotation has expired. Please contact us for an updated one.",
    };
  }

  const approvedAt = new Date().toISOString();

  // Conditional on the status we just read, so a concurrent staff change
  // (e.g. marking it rejected) isn't silently overwritten.
  const { data: updated, error } = await supabase
    .from("quotations")
    .update({
      status: "approved" as QuotationStatus,
      approved_at: approvedAt,
      approved_by_signature: parsed.data.name,
    })
    .eq("id", quotation.id)
    .eq("status", quotation.status)
    .select("id");

  if (error) {
    console.error("acceptQuotationAction: update failed", error.message);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
  if (!updated?.length) {
    return { success: false as const, error: "This quotation was just updated. Please refresh the page." };
  }

  await supabase
    .from("bookings")
    .update({ quotation_status: "approved" as QuotationStatus })
    .eq("id", quotation.booking_id);

  const clientName =
    (quotation.booking as unknown as { full_name: string } | null)?.full_name ?? parsed.data.name;

  await supabase.from("notifications").insert({
    user_id: null,
    type: "quotation_approved",
    title: "Quotation accepted by client",
    message: `${clientName} accepted ${quotation.quotation_number} online (signed as "${parsed.data.name}").`,
    link: "/admin/quotations",
    metadata: {
      quotation_id: quotation.id,
      booking_id: quotation.booking_id,
      accepted_via: "share_link",
    },
  });

  revalidatePath(quotationSharePath(parsed.data.token));
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/bookings");
  return { success: true as const };
}
