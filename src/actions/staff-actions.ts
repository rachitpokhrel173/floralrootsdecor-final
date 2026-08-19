"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getStaffWithStats, type StaffWithStats } from "@/lib/data/staff";
import {
  createStaffSchema,
  updateStaffSchema,
  type CreateStaffValues,
  type UpdateStaffValues,
} from "@/lib/validations/staff";
import type { TaskStatus, UserRole } from "@/types/database.types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function getStaffAction(): Promise<StaffWithStats[]> {
  return getStaffWithStats();
}

/**
 * The service-role client bypasses RLS entirely, so anything that uses
 * createAdminClient() must re-check permissions itself. This mirrors the
 * is_admin_or_manager() check the database applies to writes on `users`.
 */
async function requireAdminOrManager(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not signed in" };

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active || !["admin", "manager"].includes(profile.role)) {
    return { ok: false, error: "Only admins and managers can manage staff accounts" };
  }
  return { ok: true };
}

export async function createStaffAction(input: CreateStaffValues): Promise<ActionResult> {
  const parsed = createStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const permission = await requireAdminOrManager();
  if (!permission.ok) return { success: false, error: permission.error };

  const admin = createAdminClient();
  const { full_name, email, phone, role, designation, hourly_rate, monthly_salary, temp_password } =
    parsed.data;

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password: temp_password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (authError || !created?.user) {
    return { success: false, error: authError?.message ?? "Failed to create login" };
  }

  const { error: profileError } = await admin.from("users").insert({
    id: created.user.id,
    full_name,
    email,
    phone: phone || null,
    role,
    designation: designation || null,
    hourly_rate: hourly_rate ?? null,
    monthly_salary: monthly_salary ?? null,
    is_active: true,
  });

  if (profileError) {
    // Don't leave an orphaned auth account with no profile row behind.
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: profileError.message };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function updateStaffAction(userId: string, updates: UpdateStaffValues): Promise<ActionResult> {
  const parsed = updateStaffSchema.safeParse(updates);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const payload: Partial<{
    full_name: string;
    phone: string | null;
    role: UserRole;
    designation: string | null;
    hourly_rate: number | null;
    monthly_salary: number | null;
  }> = { ...parsed.data };
  if (payload.phone === "") payload.phone = null;
  if (payload.designation === "") payload.designation = null;

  const { error } = await supabase.from("users").update(payload).eq("id", userId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function setStaffActiveAction(userId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function resetStaffPasswordAction(userId: string, newPassword: string): Promise<ActionResult> {
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  const permission = await requireAdminOrManager();
  if (!permission.ok) return { success: false, error: permission.error };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function setStaffAvailabilityAction(
  userId: string,
  date: string,
  isAvailable: boolean,
  note?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_availability")
    .upsert(
      { user_id: userId, date, is_available: isAvailable, note: note || null },
      { onConflict: "user_id,date" }
    );

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function deleteStaffAvailabilityAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("staff_availability").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}

export interface AssignTaskInput {
  title: string;
  description?: string;
  assignedTo: string;
  bookingId?: string;
  dueDate?: string;
}

export async function assignTaskAction(input: AssignTaskInput): Promise<ActionResult> {
  if (!input.title.trim()) return { success: false, error: "Title is required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("tasks").insert({
    title: input.title.trim(),
    description: input.description || null,
    assigned_to: input.assignedTo,
    booking_id: input.bookingId || null,
    due_date: input.dueDate || null,
    created_by: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}
