"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getVendorsAction } from "@/actions/vendor-actions";

export const VENDORS_KEY = ["vendors"] as const;

export function useVendors() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: VENDORS_KEY,
    queryFn: getVendorsAction,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`vendors-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, () => {
        queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vendor_payments" }, () => {
        queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}
