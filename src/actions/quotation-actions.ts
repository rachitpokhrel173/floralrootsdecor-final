"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getQuotationsWithBooking,
  getQuotationById,
  getBookingOptions,
  type QuotationWithBooking,
  type BookingOption,
} from "@/lib/data/quotations";
import { computeQuotationTotals, type QuotationItemInput } from "@/lib/validations/quotation";
import type { QuotationStatus } from "@/types/database.types";

export async function getQuotationsAction(): Promise<QuotationWithBooking[]> {
  return getQuotationsWithBooking();
}

export async function getQuotationByIdAction(id: string): Promise<QuotationWithBooking | null> {
  return getQuotationById(id);
}

export async function getBookingOptionsAction(): Promise<BookingOption[]> {
  return getBookingOptions();
}

interface SaveQuotationInput {
  id?: string; // present when editing
  booking_id: string;
  items: QuotationItemInput[];
  discount_type: "flat" | "percent" | null;
  discount_value: number | null;
  tax_percent: number | null;
  notes?: string;
  valid_until?: string | null;
}

export async function saveQuotationAction(input: SaveQuotationInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { lineItems, subtotal, total } = computeQuotationTotals(
    input.items,
    input.discount_type,
    input.discount_value,
    input.tax_percent
  );

  const payload = {
    booking_id: input.booking_id,
    items: lineItems,
    subtotal,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    tax_percent: input.tax_percent,
    total,
    notes: input.notes ?? null,
    valid_until: input.valid_until ?? null,
    created_by: user?.id ?? null,
  };

  if (input.id) {
    // Editing a draft: bump version so the change history is visible.
    const { data: existing } = await supabase
      .from("quotations")
      .select("version, status")
      .eq("id", input.id)
      .single();

    const { error } = await supabase
      .from("quotations")
      .update({
        ...payload,
        version: (existing?.version ?? 1) + 1,
      })
      .eq("id", input.id);

    if (error) return { success: false, error: error.message };
  } else {
    // Look up the booking's customer so the quotation is linked correctly.
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("id", input.booking_id)
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
      .eq("id", input.booking_id);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("notifications").insert({
      user_id: null,
      type: "quotation_approved",
      title: "Quotation approved",
      message: "A quotation was approved by the client.",
      link: `/admin/quotations`,
      metadata: { quotation_id: quotationId, booking_id: bookingId, actor: user?.id ?? null },
    });
  }

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteQuotationAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quotations");
  return { success: true };
}
