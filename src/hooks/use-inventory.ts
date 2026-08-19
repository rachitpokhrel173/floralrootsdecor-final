"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getInventoryAction } from "@/actions/inventory-actions";

export const INVENTORY_KEY = ["inventory"] as const;

export function useInventory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: getInventoryAction,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`inventory-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => {
        queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}
