"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").max(150).optional().or(z.literal("")),
  eventType: z.string().trim().max(60).optional(),
  eventDate: z.string().trim().max(20).optional(),
  message: z.string().trim().max(2000).optional(),
  // Honeypot — hidden from people, bots tend to fill it in
  website: z.string().max(0).optional(),
});

export type ContactFormResult = { success: true } | { success: false; error: string };

/**
 * Public contact form. Visitors aren't signed in, so this uses the
 * service-role client to save the message to the Inquiries inbox and
 * alert the admin notifications feed (bell, notifications page, badge).
 */
export async function submitContactMessageAction(input: unknown): Promise<ContactFormResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    // A filled honeypot means a bot — pretend it worked so it doesn't retry
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { success: true };
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const { name, phone, email, eventType, eventDate, message } = parsed.data;

  const details = [
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    eventType ? `Event: ${eventType}${eventDate ? ` on ${eventDate}` : ""}` : eventDate ? `Date: ${eventDate}` : null,
    message ? `\n"${message}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const supabase = createAdminClient();

  // Save to the Inquiries inbox. If that fails (e.g. the migration hasn't
  // been run yet) we still fall through to the notification below, which
  // carries every detail — so a message is never lost.
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .insert({
      full_name: name,
      phone,
      email: email || null,
      event_type: eventType || null,
      event_date: /^\d{4}-\d{2}-\d{2}$/.test(eventDate ?? "") ? eventDate : null,
      message: message || null,
    })
    .select("id")
    .single();
  if (inquiryError) {
    console.error("submitContactMessageAction: inquiry insert failed", inquiryError.message);
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: null,
    type: "system",
    title: `New inquiry from ${name}`,
    message: details,
    link: inquiry ? `/admin/inquiries?id=${inquiry.id}` : "/admin/inquiries",
    metadata: {
      inquiry_id: inquiry?.id ?? null,
      source: "contact_form",
      name,
      phone,
      email: email || null,
      event_type: eventType || null,
      event_date: eventDate || null,
      message: message || null,
    },
  });

  if (error && !inquiry) {
    console.error("submitContactMessageAction: notification insert failed", error.message);
    return {
      success: false,
      error: "Sorry, we couldn't send your message. Please call or WhatsApp us instead.",
    };
  }

  return { success: true };
}
