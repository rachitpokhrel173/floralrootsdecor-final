"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendStatusUpdateEmail } from "@/lib/email/send-status-update";
import type { Booking, BookingStatus } from "@/types/database.types";

type BookingUpdatable = Partial<
  Pick<
    Booking,
    | "status"
    | "priority"
    | "payment_status"
    | "quotation_status"
    | "invoice_status"
    | "assigned_staff_id"
    | "is_favorite"
    | "labels"
    | "color_tag"
  >
>;

export async function updateBookingAction(bookingId: string, updates: BookingUpdatable) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update(updates).eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export interface ChangeBookingStatusInput {
  bookingId: string;
  newStatus: BookingStatus;
  note?: string;
  notifyCustomer?: boolean;
}

export interface ChangeBookingStatusResult {
  success: boolean;
  error?: string;
  emailSent?: boolean;
  emailSkippedReason?: "no_email_on_file" | "not_configured" | "send_failed" | "not_requested";
}

/**
 * Richer status-change flow: updates the booking, optionally logs a
 * human-written reason to the activity timeline (in addition to the
 * automatic "status changed from X to Y" entry the DB trigger already
 * writes), and optionally emails the customer.
 */
export async function changeBookingStatusAction(
  input: ChangeBookingStatusInput
): Promise<ChangeBookingStatusResult> {
  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, customer_id, full_name, email, event_type, event_date, booking_code, status")
    .eq("id", input.bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: fetchError?.message ?? "Booking not found" };
  }

  const oldStatus = booking.status;

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: input.newStatus })
    .eq("id", input.bookingId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // The DB trigger already logs "Status changed from X to Y" automatically.
  // If the admin added a reason, log it as a separate, clearly-labeled entry.
  if (input.note?.trim()) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("activity_logs").insert({
      booking_id: input.bookingId,
      customer_id: booking.customer_id,
      user_id: user?.id ?? null,
      action: "status_note",
      description: `Note: ${input.note.trim()}`,
    });
  }

  let emailSent = false;
  let emailSkippedReason: ChangeBookingStatusResult["emailSkippedReason"] = "not_requested";

  if (input.notifyCustomer) {
    const result = await sendStatusUpdateEmail({
      to: booking.email ?? undefined,
      fullName: booking.full_name,
      bookingCode: booking.booking_code,
      eventType: booking.event_type,
      eventDate: booking.event_date,
      oldStatus,
      newStatus: input.newStatus,
      note: input.note?.trim(),
    });
    emailSent = result.sent;
    emailSkippedReason = result.sent ? undefined : result.reason;
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  return { success: true, emailSent, emailSkippedReason };
}

export async function addCustomerNoteAction(customerId: string, bookingId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("customer_notes").insert({
    customer_id: customerId,
    booking_id: bookingId,
    note,
    user_id: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/bookings");
  return { success: true };
}