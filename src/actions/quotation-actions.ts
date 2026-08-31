"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getQuotationsWithBooking,
  getQuotationById,
  getBookingOptions,
  type QuotationWithBooking,
  type BookingOption,
} from "@/lib/data/quotations";
import {
  computeQuotationTotals,
  saveQuotationSchema,
  type SaveQuotationInput,
} from "@/lib/validations/quotation";
import type { QuotationStatus } from "@/types/database.types";

const QUOTATION_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
];

/**
 * All quotation writes are staff-only at the DB level (RLS policy
 * `staff_full_access_quotations`). This mirrors that check in the action so a
 * non-staff caller gets a clear message instead of a raw RLS error.
 */
async function requireStaff(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    return { ok: false, error: "Your account doesn't have staff access." };
  }
  return { ok: true, userId: user.id };
}

export async function getQuotationsAction(): Promise<QuotationWithBooking[]> {
  return getQuotationsWithBooking();
}

export async function getQuotationByIdAction(id: string): Promise<QuotationWithBooking | null> {
  return getQuotationById(id);
}

export async function getBookingOptionsAction(): Promise<BookingOption[]> {
  return getBookingOptions();
}

export async function saveQuotationAction(input: SaveQuotationInput) {
  const parsed = saveQuotationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the quotation details.",
    };
  }
  const data = parsed.data;

  const guard = await requireStaff();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = await createClient();

  const { lineItems, subtotal, total } = computeQuotationTotals(
    data.items,
    data.discount_type,
    data.discount_value,
    data.tax_percent
  );

  const payload = {
    booking_id: data.booking_id,
    items: lineItems,
    subtotal,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    tax_percent: data.tax_percent,
    total,
    images: data.images ?? [],
    notes: data.notes ?? null,
    valid_until: data.valid_until ?? null,
    created_by: guard.userId,
  };

  if (data.id) {
    // Editing a draft: bump version so the change history is visible.
    const { data: existing } = await supabase
      .from("quotations")
      .select("version, status")
      .eq("id", data.id)
      .single();

    const { error } = await supabase
      .from("quotations")
      .update({
        ...payload,
        version: (existing?.version ?? 1) + 1,
      })
      .eq("id", data.id);

    if (error) return { success: false, error: error.message };
  } else {
    // Look up the booking's customer so the quotation is linked correctly.
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("id", data.booking_id)
      .single();

    const { error } = await supabase.from("quotations").insert({
      ...payload,
      customer_id: booking?.customer_id ?? null,
      status: "draft" as QuotationStatus,
    });

    if (error) return { success: false, error: error.message };

    await supabase
      .from("bookings")
      .update({ quotation_status: "draft" as QuotationStatus })
      .eq("id", data.booking_id);
  }

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function updateQuotationStatusAction(
  quotationId: string,
  bookingId: string,
  status: QuotationStatus
) {
  const idCheck = z
    .object({
      quotationId: z.string().uuid(),
      bookingId: z.string().uuid(),
      status: z.enum(QUOTATION_STATUSES as [QuotationStatus, ...QuotationStatus[]]),
    })
    .safeParse({ quotationId, bookingId, status });
  if (!idCheck.success) return { success: false, error: "Invalid request." };

  const guard = await requireStaff();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = await createClient();

  const updates: { status: QuotationStatus; approved_at?: string } = { status };
  if (status === "approved") {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("quotations").update(updates).eq("id", quotationId);
  if (error) return { success: false, error: error.message };

  // Keep the booking's summary status in sync so the Bookings table reflects it.
  await supabase.from("bookings").update({ quotation_status: status }).eq("id", bookingId);

  if (status === "sent" && bookingId) {
    await supabase.from("bookings").update({ status: "quotation_sent" }).eq("id", bookingId);
  }

  if (status === "approved") {
    await supabase.from("notifications").insert({
      user_id: null,
      type: "quotation_approved",
      title: "Quotation approved",
      message: "A quotation was approved by the client.",
      link: `/admin/quotations`,
      metadata: { quotation_id: quotationId, booking_id: bookingId, actor: guard.userId },
    });
  }

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteQuotationAction(id: string) {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid request." };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quotations");
  return { success: true };
}
