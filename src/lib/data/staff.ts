import { createClient } from "@/lib/supabase/server";
import type { StaffUser } from "@/types/database.types";

export interface StaffWithStats extends StaffUser {
  activeTasksCount: number;
  completedTasksCount: number;
  upcomingBookingsCount: number;
}

export async function getStaffWithStats(): Promise<StaffWithStats[]> {
  const supabase = await createClient();

  const [{ data: staff, error: staffError }, { data: tasks }, { data: bookings }] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase.from("tasks").select("assigned_to, status"),
    supabase
      .from("bookings")
      .select("assigned_staff_id, event_date")
      .gte("event_date", new Date().toISOString().slice(0, 10)),
  ]);

  if (staffError) {
    console.error("getStaffWithStats: query failed", staffError.message);
    return [];
  }

  const activeTasks = new Map<string, number>();
  const completedTasks = new Map<string, number>();
  for (const t of tasks ?? []) {
    if (!t.assigned_to) continue;
    if (t.status === "completed") {
      completedTasks.set(t.assigned_to, (completedTasks.get(t.assigned_to) ?? 0) + 1);
    } else {
      activeTasks.set(t.assigned_to, (activeTasks.get(t.assigned_to) ?? 0) + 1);
    }
  }

  const upcomingBookings = new Map<string, number>();
  for (const b of bookings ?? []) {
    if (!b.assigned_staff_id) continue;
    upcomingBookings.set(b.assigned_staff_id, (upcomingBookings.get(b.assigned_staff_id) ?? 0) + 1);
  }

  return (staff ?? []).map((s) => ({
    ...s,
    activeTasksCount: activeTasks.get(s.id) ?? 0,
    completedTasksCount: completedTasks.get(s.id) ?? 0,
    upcomingBookingsCount: upcomingBookings.get(s.id) ?? 0,
  }));
}
