"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getInvoicesWithBooking,
  getInvoiceById,
  getConvertibleQuotations,
  type InvoiceWithBooking,
  type ApprovedQuotationOption,
} from "@/lib/data/invoices";
import { getBookingOptions, type BookingOption } from "@/lib/data/quotations";
import { computeInvoiceTotals, type InvoiceItemInput } from "@/lib/validations/invoice";
import type { InvoiceStatus } from "@/types/database.types";

export async function getInvoicesAction(): Promise<InvoiceWithBooking[]> {
  return getInvoicesWithBooking();
}

export async function getInvoiceByIdAction(id: string): Promise<InvoiceWithBooking | null> {
  return getInvoiceById(id);
}

export async function getBookingOptionsAction(): Promise<BookingOption[]> {
  return getBookingOptions();
}

export async function getConvertibleQuotationsAction(): Promise<ApprovedQuotationOption[]> {
  return getConvertibleQuotations();
}

interface SaveInvoiceInput {
  id?: string;
  booking_id: string;
  items: InvoiceItemInput[];
  discount_value: number | null;
  tax_percent: number | null;
  due_date?: string | null;
  notes?: string;
}

async function syncBookingInvoiceStatus(supabase: Awaited<ReturnType<typeof createClient>>, bookingId: string, status: InvoiceStatus) {
  await supabase.from("bookings").update({ invoice_status: status }).eq("id", bookingId);
}

export async function saveInvoiceAction(input: SaveInvoiceInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { lineItems, subtotal, discountAmount, total } = computeInvoiceTotals(
    input.items,
    input.discount_value,
    input.tax_percent
  );

  const payload = {
    booking_id: input.booking_id,
    items: lineItems,
    subtotal,
    discount_value: discountAmount,
    tax_percent: input.tax_percent,
    total,
    due_date: input.due_date || null,
    notes: input.notes ?? null,
    created_by: user?.id ?? null,
  };

  if (input.id) {
    const { error } = await supabase.from("invoices").update(payload).eq("id", input.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("id", input.booking_id)
      .single();

    const { error } = await supabase.from("invoices").insert({
      ...payload,
      customer_id: booking?.customer_id ?? null,
      status: "draft" as InvoiceStatus,
    });
    if (error) return { success: false, error: error.message };

    await syncBookingInvoiceStatus(supabase, input.booking_id, "draft");
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function createInvoiceFromQuotationAction(quotationId: string, dueDate?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quotation, error: qError } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", quotationId)
    .single();

  if (qError || !quotation) {
    return { success: false, error: qError?.message ?? "Quotation not found" };
  }

  // Quotations can carry a percentage discount; invoices only store a flat amount,
  // so we resolve it to a concrete flat value at conversion time.
  const discountAmount =
    quotation.discount_type === "percent"
      ? Math.round(((quotation.subtotal * (quotation.discount_value ?? 0)) / 100) * 100) / 100
      : (quotation.discount_value ?? 0);

  const { error } = await supabase.from("invoices").insert({
    booking_id: quotation.booking_id,
    customer_id: quotation.customer_id,
    quotation_id: quotation.id,
    status: "draft" as InvoiceStatus,
    items: quotation.items,
    subtotal: quotation.subtotal,
    discount_value: discountAmount,
    tax_percent: quotation.tax_percent,
    total: quotation.total,
    due_date: dueDate || null,
    notes: quotation.notes,
    created_by: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };

  await syncBookingInvoiceStatus(supabase, quotation.booking_id, "draft");

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  bookingId: string,
  status: InvoiceStatus
) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId);
  if (error) return { success: false, error: error.message };

  await syncBookingInvoiceStatus(supabase, bookingId, status);

  if (status === "sent") {
    await supabase.from("bookings").update({ status: "negotiation" }).eq("id", bookingId).eq("status", "quotation_sent");
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/invoices");
  return { success: true };
}
