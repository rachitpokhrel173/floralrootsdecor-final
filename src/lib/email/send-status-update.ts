interface SendStatusUpdateEmailParams {
  to?: string;
  fullName: string;
  bookingCode: string;
  eventType: string;
  eventDate: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  meeting: "Meeting Scheduled",
  quotation_sent: "Quotation Sent",
  negotiation: "In Negotiation",
  confirmed: "Confirmed",
  decoration_started: "Decoration In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * Notifies a customer that their booking status changed. Follows the same
 * silent-no-op pattern as sendBookingConfirmationEmail — never blocks the
 * status change itself if email isn't configured or fails.
 */
export async function sendStatusUpdateEmail(params: SendStatusUpdateEmailParams) {
  const { to, fullName, bookingCode, eventType, eventDate, newStatus, note } = params;

  if (!to) return { sent: false, reason: "no_email_on_file" as const };
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email] RESEND_API_KEY not set — skipping status update email for ${bookingCode}`);
    return { sent: false, reason: "not_configured" as const };
  }

  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const statusLabel = STATUS_LABELS[newStatus] ?? newStatus;

  const html = `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background:#0b0b0c; color:#f4f4f5; border-radius:16px;">
      <p style="letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; color:#c9a961; margin: 0 0 24px;">Booking Update</p>
      <h1 style="font-size: 22px; margin: 0 0 8px; color:#fff;">Hi ${fullName},</h1>
      <p style="color:#a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Your booking for <strong style="color:#f4f4f5;">${eventType}</strong> on
        <strong style="color:#f4f4f5;">${formattedDate}</strong> has a status update.
      </p>
      <div style="background:#18181b; border:1px solid #27272a; border-radius:12px; padding:16px 20px; margin-bottom: 24px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color:#71717a; margin:0 0 4px;">New Status</p>
        <p style="font-size: 18px; font-weight: 600; color:#c9a961; margin:0;">${statusLabel}</p>
      </div>
      ${
        note
          ? `<p style="color:#a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${note}</p>`
          : ""
      }
      <p style="color:#71717a; font-size: 12px; margin: 0;">Booking reference: ${bookingCode}</p>
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
        subject: `Booking Update — ${statusLabel} (${bookingCode})`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend API error", await res.text());
      return { sent: false, reason: "send_failed" as const };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[email] failed to send status update", err);
    return { sent: false, reason: "send_failed" as const };
  }
}
