"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Booking, Payment, CustomerNote } from "@/types/database.types";

export function useCustomerDetail(customerId: string | null) {
  const supabase = createClient();

  const bookingsQuery = useQuery({
    queryKey: ["customer-bookings", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", customerId!)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["customer-payments", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", customerId!)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const notesQuery = useQuery({
    queryKey: ["customer-notes", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<CustomerNote[]> => {
      const { data, error } = await supabase
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    bookings: bookingsQuery.data ?? [],
    bookingsLoading: bookingsQuery.isLoading,
    payments: paymentsQuery.data ?? [],
    paymentsLoading: paymentsQuery.isLoading,
    notes: notesQuery.data ?? [],
    notesLoading: notesQuery.isLoading,
    refetchNotes: notesQuery.refetch,
  };
}
