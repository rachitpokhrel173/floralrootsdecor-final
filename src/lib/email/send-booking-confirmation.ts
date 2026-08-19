interface SendBookingConfirmationParams {
  to?: string;
  fullName: string;
  bookingCode: string;
  eventType: string;
  eventDate: string;
}

/**
 * Sends a booking confirmation email via Resend (https://resend.com).
 * Silently no-ops if RESEND_API_KEY isn't configured yet, so booking
 * submission never fails because of a missing email integration.
 *
 * To activate: add RESEND_API_KEY and EMAIL_FROM to .env.local, then
 * `npm install resend`.
 */
export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationParams
) {
  const { to, fullName, bookingCode, eventType, eventDate } = params;

  if (!to) return;
  if (!process.env.RESEND_API_KEY) {
    console.info(
      `[email] RESEND_API_KEY not set — skipping confirmation email for ${bookingCode}`
    );
    return;
  }

  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background:#0b0b0c; color:#f4f4f5; border-radius:16px;">
      <p style="letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; color:#c9a961; margin: 0 0 24px;">Booking Confirmed</p>
      <h1 style="font-size: 22px; margin: 0 0 8px; color:#fff;">Thank you, ${fullName}!</h1>
      <p style="color:#a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        We've received your request for a <strong style="color:#f4f4f5;">${eventType}</strong> on
        <strong style="color:#f4f4f5;">${formattedDate}</strong>. Our team will reach out shortly to
        discuss the details.
      </p>
      <div style="background:#18181b; border:1px solid #27272a; border-radius:12px; padding:16px 20px; margin-bottom: 24px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color:#71717a; margin:0 0 4px;">Booking Reference</p>
        <p style="font-size: 20px; font-weight: 600; color:#c9a961; margin:0; letter-spacing: 0.02em;">${bookingCode}</p>
      </div>
      <p style="color:#71717a; font-size: 12px; margin: 0;">Please keep this reference number for your records.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Floral Roots <onboarding@resend.dev>",
        to,
        subject: `Booking Confirmed — ${bookingCode}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend API error", await res.text());
    }
  } catch (err) {
    console.error("[email] failed to send confirmation", err);
  }
}
