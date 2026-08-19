"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types/database.types";

export const BOOKINGS_KEY = ["bookings"] as const;

export function useBookings() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: BOOKINGS_KEY,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    // A unique topic per mount avoids a race in React Strict Mode (and Fast
    // Refresh) where a fast unmount/remount reuses a channel that's still
    // mid-teardown from removeChannel() (which is async), causing
    // "cannot add postgres_changes callbacks ... after subscribe()".
    const channel = supabase
      .channel(`bookings-changes-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const booking = payload.new as Booking;
          queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
            old ? [booking, ...old] : [booking]
          );
          toast.success(`New booking from ${booking.full_name}`, {
            description: `${booking.event_type} · ${booking.booking_code}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          const booking = payload.new as Booking;
          queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
            old ? old.map((b) => (b.id === booking.id ? booking : b)) : old
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bookings" },
        (payload) => {
          const oldBooking = payload.old as Booking;
          queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
            old ? old.filter((b) => b.id !== oldBooking.id) : old
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}