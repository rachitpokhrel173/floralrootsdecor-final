"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendOfferCodeEmail } from "@/lib/email/send-offer-code";

export interface ClaimOfferResult {
  success: boolean;
  error?: string;
  emailSent: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Handles the homepage "15% off" popup submission: sends the discount code
 * to the visitor (when email is configured) and logs the lead as a
 * notification so staff actually see it in /admin/notifications — otherwise
 * every captured email would vanish into the void.
 */
export async function claimOfferAction(email: string): Promise<ClaimOfferResult> {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return { success: false, error: "Enter a valid email address", emailSent: false };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // Service role key not configured — still attempt the email send below,
    // just skip the internal notification.
    admin = null;
  }

  if (admin) {
    await admin.from("notifications").insert({
      user_id: null,
      type: "system",
      title: "New offer lead",
      message: `${trimmed} claimed the 15% off homepage offer.`,
    });
  }

  const emailResult = await sendOfferCodeEmail({ to: trimmed });

  return { success: true, emailSent: emailResult.sent };
}
