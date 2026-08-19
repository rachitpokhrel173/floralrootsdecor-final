import { createClient } from "@/lib/supabase/server";
import type { Invoice, Booking, Payment } from "@/types/database.types";

export interface InvoiceWithBooking extends Invoice {
  booking: Pick<
    Booking,
    "id" | "booking_code" | "full_name" | "phone" | "email" | "event_type" | "event_date"
  > | null;
}

export async function getInvoicesWithBooking(): Promise<InvoiceWithBooking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "*, booking:bookings(id, booking_code, full_name, phone, email, event_type, event_date)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getInvoicesWithBooking: query failed", error.message);
    return [];
  }

  return (data ?? []) as unknown as InvoiceWithBooking[];
}

export async function getInvoiceById(id: string): Promise<InvoiceWithBooking | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "*, booking:bookings(id, booking_code, full_name, phone, email, event_type, event_date)"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("getInvoiceById: query failed", error.message);
    return null;
  }

  return data as unknown as InvoiceWithBooking;
}

export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("getPaymentsForInvoice: query failed", error.message);
    return [];
  }
  return data ?? [];
}

export interface ApprovedQuotationOption {
  id: string;
  quotation_number: string;
  booking_id: string;
  customer_id: string | null;
  total: number;
  items: Array<{ name: string; description?: string; qty: number; unit_price: number; total: number }>;
  subtotal: number;
  tax_percent: number | null;
  discount_type: string | null;
  discount_value: number | null;
  booking: { booking_code: string; full_name: string; event_type: string; event_date: string } | null;
}

/** Approved quotations that don't have an invoice yet — the "convert to invoice" source list. */
export async function getConvertibleQuotations(): Promise<ApprovedQuotationOption[]> {
  const supabase = await createClient();

  const [{ data: quotations, error }, { data: existingInvoices }] = await Promise.all([
    supabase
      .from("quotations")
      .select(
        "id, quotation_number, booking_id, customer_id, total, items, subtotal, tax_percent, discount_type, discount_value, booking:bookings(booking_code, full_name, event_type, event_date)"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase.from("invoices").select("quotation_id").not("quotation_id", "is", null),
  ]);

  if (error) {
    console.error("getConvertibleQuotations: query failed", error.message);
    return [];
  }

  const invoicedQuotationIds = new Set((existingInvoices ?? []).map((i) => i.quotation_id));

  return ((quotations ?? []) as unknown as ApprovedQuotationOption[]).filter(
    (q) => !invoicedQuotationIds.has(q.id)
  );
}
