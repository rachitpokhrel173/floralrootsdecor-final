"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getCustomersWithStatsAction } from "@/actions/customer-actions";

export const CUSTOMERS_KEY = ["customers-with-stats"] as const;

export function useCustomers() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: getCustomersWithStatsAction,
  });

  useEffect(() => {
    // Stats are derived from customers + bookings + payments together, so we
    // just invalidate-and-refetch on any change rather than patching client
    // state manually across three tables.
    const channel = supabase
      .channel(`customers-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => {
        queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}
