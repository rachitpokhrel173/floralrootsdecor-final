import { createClient } from "@/lib/supabase/server";
import type { Quotation, Booking } from "@/types/database.types";

export interface QuotationWithBooking extends Quotation {
  booking: Pick<
    Booking,
    "id" | "booking_code" | "full_name" | "phone" | "email" | "event_type" | "event_date"
  > | null;
  /** Sum of all payments recorded against this quotation's booking (advance or otherwise). */
  totalReceived: number;
}

export async function getQuotationsWithBooking(): Promise<QuotationWithBooking[]> {
  const supabase = await createClient();

  const [{ data, error }, { data: payments }] = await Promise.all([
    supabase
      .from("quotations")
      .select(
        "*, booking:bookings(id, booking_code, full_name, phone, email, event_type, event_date)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("payments").select("booking_id, amount"),
  ]);

  if (error) {
    console.error("getQuotationsWithBooking: query failed", error.message);
    return [];
  }

  const receivedByBooking = new Map<string, number>();
  for (const p of payments ?? []) {
    receivedByBooking.set(p.booking_id, (receivedByBooking.get(p.booking_id) ?? 0) + Number(p.amount));
  }

  return ((data ?? []) as unknown as QuotationWithBooking[]).map((q) => ({
    ...q,
    totalReceived: receivedByBooking.get(q.booking_id) ?? 0,
  }));
}

export async function getQuotationById(id: string): Promise<QuotationWithBooking | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotations")
    .select(
      "*, booking:bookings(id, booking_code, full_name, phone, email, event_type, event_date)"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getQuotationById: query failed", error?.message);
    return null;
  }

  const quotation = data as unknown as QuotationWithBooking;

  const { data: bookingPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("booking_id", quotation.booking_id);

  const totalReceived = (bookingPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return { ...quotation, totalReceived };
}

export interface BookingOption {
  id: string;
  booking_code: string;
  full_name: string;
  event_type: string;
  event_date: string;
  budget: number | null;
}

/** Bookings for the quotation builder's picker — newest first, so staff can find recent leads fast. */
export async function getBookingOptions(): Promise<BookingOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_code, full_name, event_type, event_date, budget")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("getBookingOptions: query failed", error.message);
    return [];
  }

  return data ?? [];
}
