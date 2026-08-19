"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task, StaffAvailability, Booking } from "@/types/database.types";

export function useStaffDetail(userId: string | null) {
  const supabase = createClient();

  const tasksQuery = useQuery({
    queryKey: ["staff-tasks", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", userId!)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const availabilityQuery = useQuery({
    queryKey: ["staff-availability", userId],
    enabled: !!userId,
    queryFn: async (): Promise<StaffAvailability[]> => {
      const { data, error } = await supabase
        .from("staff_availability")
        .select("*")
        .eq("user_id", userId!)
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const bookingsQuery = useQuery({
    queryKey: ["staff-bookings", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("assigned_staff_id", userId!)
        .order("event_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    tasksLoading: tasksQuery.isLoading,
    refetchTasks: tasksQuery.refetch,
    availability: availabilityQuery.data ?? [],
    availabilityLoading: availabilityQuery.isLoading,
    refetchAvailability: availabilityQuery.refetch,
    bookings: bookingsQuery.data ?? [],
    bookingsLoading: bookingsQuery.isLoading,
  };
}
