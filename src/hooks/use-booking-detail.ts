"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { BookingService, ActivityLog } from "@/types/database.types";

export function useBookingDetail(bookingId: string | null) {
  const supabase = createClient();

  const servicesQuery = useQuery({
    queryKey: ["booking-services", bookingId],
    enabled: !!bookingId,
    queryFn: async (): Promise<BookingService[]> => {
      const { data, error } = await supabase
        .from("booking_services")
        .select("*")
        .eq("booking_id", bookingId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const activityQuery = useQuery({
    queryKey: ["booking-activity", bookingId],
    enabled: !!bookingId,
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("booking_id", bookingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    services: servicesQuery.data ?? [],
    servicesLoading: servicesQuery.isLoading,
    activity: activityQuery.data ?? [],
    activityLoading: activityQuery.isLoading,
  };
}
