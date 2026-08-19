"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(id: string, isRead = true) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // RLS scopes this to rows the user can see: their own + broadcast (user_id is null)
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .eq("is_read", false);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/notifications");
  return { success: true };
}
