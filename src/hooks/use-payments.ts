"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getPaymentsAction, getPaymentStatsAction } from "@/actions/payment-actions";

export const PAYMENTS_KEY = ["payments"] as const;
export const PAYMENT_STATS_KEY = ["payment-stats"] as const;

export function usePayments() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PAYMENTS_KEY,
    queryFn: getPaymentsAction,
  });

  const statsQuery = useQuery({
    queryKey: PAYMENT_STATS_KEY,
    queryFn: getPaymentStatsAction,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`payments-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
        queryClient.invalidateQueries({ queryKey: PAYMENT_STATS_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...query, stats: statsQuery.data, statsLoading: statsQuery.isLoading };
}
