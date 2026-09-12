interface NotifyBookingParams {
  fullName: string;
  email?: string;
  venue?: string;
  eventDate: string;
  eventType: string;
}

/**
 * Logs a new booking's name + email to a Google Sheet and triggers the
 * Sheet's Apps Script to email both the admin ("new booking arrival") and
 * the client (confirmation). Silently no-ops if GOOGLE_SHEETS_WEBHOOK_URL
 * isn't configured yet, so booking submission never fails because of this.
 *
 * Setup: supabase/Appscript code/README.md
 */
export async function notifyGoogleSheetBooking(params: NotifyBookingParams) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.info(
      `[google-sheets] GOOGLE_SHEETS_WEBHOOK_URL not set — skipping sheet/email notification for ${params.fullName}`
    );
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || "",
        ...params,
      }),
      // Apps Script web apps issue a redirect before the real response;
      // fetch follows it automatically, this just documents the behavior.
      redirect: "follow",
    });

    if (!res.ok) {
      console.error("[google-sheets] webhook error", await res.text());
    }
  } catch (err) {
    console.error("[google-sheets] failed to notify", err);
  }
}
