"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getQuotationsAction } from "@/actions/quotation-actions";

export const QUOTATIONS_KEY = ["quotations-with-booking"] as const;

export function useQuotations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUOTATIONS_KEY,
    queryFn: getQuotationsAction,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`quotations-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotations" }, () => {
        queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      })
      // Payments affect the "advance received / balance due" figures shown
      // alongside each quotation, so keep those live too.
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}
