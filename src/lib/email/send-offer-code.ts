const OFFER_CODE = "WELCOME15";

interface SendOfferCodeEmailParams {
  to: string;
}

export type SendOfferCodeResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "send_failed" };

/**
 * Sends the 15%-off welcome code captured via the homepage popup.
 * Follows the same silent-no-op-if-unconfigured pattern as the other
 * transactional emails in this app — never throws, always returns a
 * reason so the UI can be honest about whether it actually went out.
 */
export async function sendOfferCodeEmail({ to }: SendOfferCodeEmailParams): Promise<SendOfferCodeResult> {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email] RESEND_API_KEY not set — skipping offer code email to ${to}`);
    return { sent: false, reason: "not_configured" };
  }

  const html = `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 28px; background:#0e2411; color:#f4f4f5; border-radius:16px;">
      <p style="letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; color:#4ecf68; margin: 0 0 20px;">Floral Roots &amp; Decors</p>
      <h1 style="font-size: 20px; margin: 0 0 12px; color:#fff;">Here's your 15% off code</h1>
      <p style="color:#c8d9c9; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Thank you for your interest! Share this code with our team when you submit your booking
        and we'll apply your discount to the final quotation.
      </p>
      <div style="background:#183d1c; border:1px solid #2db84b40; border-radius:12px; padding:16px 20px; text-align:center; margin-bottom: 24px;">
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color:#4ecf68; margin:0;">${OFFER_CODE}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/book" style="display:inline-block; background:#2db84b; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:13px; font-weight:700;">
        Book Your Date
      </a>
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
        from: process.env.EMAIL_FROM || "Floral Roots & Decors <onboarding@resend.dev>",
        to,
        subject: "Your 15% Off Code — Floral Roots & Decors",
        html,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend API error", await res.text());
      return { sent: false, reason: "send_failed" };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] failed to send offer code", err);
    return { sent: false, reason: "send_failed" };
  }
}
