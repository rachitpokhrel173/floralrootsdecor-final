"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPaymentsWithDetails, getPaymentStats } from "@/lib/data/payments";
import type { PaymentMethod } from "@/types/database.types";

export interface RecordPaymentInput {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  isAdvance?: boolean;
  invoiceId?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentActionResult {
  success: boolean;
  error?: string;
}

export async function getPaymentsAction() {
  return getPaymentsWithDetails();
}

export async function getPaymentStatsAction() {
  return getPaymentStats();
}

/**
 * Recomputes and writes booking.payment_status (and, if the booking has an
 * invoice, invoice.amount_paid / invoice.status) from the actual rows in
 * `payments`. Called after both recording and deleting a payment so the two
 * flows can never drift out of sync with each other.
 *
 * Payments are tracked per-booking (a payment doesn't have to be linked to a
 * specific invoice — e.g. advances taken before an invoice exists), so the
 * invoice total is derived from ALL of the booking's payments, not just the
 * ones whose invoice_id happens to match. This assumes one invoice per
 * booking, which holds for the current booking → quotation → invoice flow.
 */
async function syncPaymentStatus(supabase: Awaited<ReturnType<typeof createClient>>, bookingId: string) {
  const { data: allPayments } = await supabase.from("payments").select("amount").eq("booking_id", bookingId);
  const { data: booking } = await supabase.from("bookings").select("budget").eq("id", bookingId).single();

  const totalReceived = (allPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const budget = booking?.budget ?? 0;
  const paymentStatus =
    totalReceived <= 0 ? "unpaid" : budget > 0 && totalReceived >= budget ? "paid" : "partial";

  await supabase.from("bookings").update({ payment_status: paymentStatus }).eq("id", bookingId);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, total, status")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invoice) {
    const invoiceTotal = invoice.total ?? 0;
    const invoiceStatus =
      totalReceived <= 0
        ? invoice.status === "cancelled"
          ? "cancelled"
          : "sent"
        : totalReceived >= invoiceTotal
          ? "paid"
          : "partial";

    await supabase
      .from("invoices")
      .update({ amount_paid: totalReceived, status: invoiceStatus })
      .eq("id", invoice.id);
  }
}

function revalidateMoneyPaths() {
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/dashboard");
}

export async function recordPaymentAction(input: RecordPaymentInput): Promise<PaymentActionResult> {
  if (input.amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("id", input.bookingId)
    .single();

  if (bookingError) {
    return { success: false, error: bookingError.message };
  }

  const { error } = await supabase.from("payments").insert({
    booking_id: input.bookingId,
    customer_id: booking?.customer_id ?? null,
    invoice_id: input.invoiceId ?? null,
    amount: input.amount,
    method: input.method,
    is_advance: input.isAdvance ?? false,
    reference_number: input.referenceNumber || null,
    notes: input.notes || null,
    received_by: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };

  await syncPaymentStatus(supabase, input.bookingId);
  revalidateMoneyPaths();
  return { success: true };
}

export async function deletePaymentAction(paymentId: string): Promise<PaymentActionResult> {
  const supabase = await createClient();

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("booking_id")
    .eq("id", paymentId)
    .single();

  if (fetchError || !payment) {
    return { success: false, error: fetchError?.message ?? "Payment not found" };
  }

  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) return { success: false, error: error.message };

  await syncPaymentStatus(supabase, payment.booking_id);
  revalidateMoneyPaths();
  return { success: true };
}