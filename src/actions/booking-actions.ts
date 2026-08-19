"use server";

import { createClient } from "@/lib/supabase/server";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validations/booking";

export interface SubmitBookingResult {
  success: boolean;
  bookingCode?: string;
  bookingId?: string;
  error?: string;
}

/**
 * Public server action: submits a new booking + its selected services.
 * Runs with the anon key — RLS policy `public_can_insert_booking` (and
 * `public_can_insert_booking_services`) is what actually authorizes this.
 */
export async function submitBooking(
  values: BookingFormValues
): Promise<SubmitBookingResult> {
  const parsed = bookingFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    full_name,
    phone,
    email,
    preferred_contact,
    event_type,
    event_date,
    event_time,
    venue,
    guest_count,
    budget,
    theme,
    color_preferences,
    services,
    custom_notes,
  } = parsed.data;

  const supabase = await createClient();

  // Uses the `create_booking_public` RPC (security definer) instead of a
  // plain `.insert().select()` — the anon role has no SELECT policy on
  // `bookings` (intentionally, to avoid exposing customer data), and
  // Postgres RLS filters INSERT ... RETURNING through SELECT policies,
  // so a direct insert+select always came back empty here.
  const { data: bookingRows, error: bookingError } = await supabase.rpc(
    "create_booking_public",
    {
      p_full_name: full_name,
      p_phone: phone,
      p_email: email || null,
      p_preferred_contact: preferred_contact,
      p_event_type: event_type,
      p_event_date: event_date,
      p_event_time: event_time || null,
      p_venue: venue || null,
      p_guest_count: guest_count ?? null,
      p_budget: budget ?? null,
      p_theme: theme || null,
      p_color_preferences: color_preferences || null,
      p_custom_notes: custom_notes || null,
      p_services: services,
    }
  );

  const booking = bookingRows?.[0];

  if (bookingError || !booking) {
    console.error("submitBooking: failed to insert booking", bookingError);
    return {
      success: false,
      error:
        "We couldn't submit your booking right now. Please try again in a moment.",
    };
  }

  // Fire-and-forget confirmation email (only runs if RESEND_API_KEY is set)
  try {
    const { sendBookingConfirmationEmail } = await import("@/lib/email/send-booking-confirmation");
    await sendBookingConfirmationEmail({
      to: email || undefined,
      fullName: full_name,
      bookingCode: booking.booking_code,
      eventType: event_type,
      eventDate: event_date,
    });
  } catch (err) {
    console.error("submitBooking: confirmation email failed", err);
  }

  return {
    success: true,
    bookingCode: booking.booking_code,
    bookingId: booking.id,
  };
}
