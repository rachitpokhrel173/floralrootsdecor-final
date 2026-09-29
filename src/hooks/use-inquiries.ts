"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getInquiriesAction } from "@/actions/inquiry-actions";

export const INQUIRIES_KEY = ["inquiries"] as const;

export function useInquiries() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: INQUIRIES_KEY,
    queryFn: getInquiriesAction,
    retry: 1,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`inquiries-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, () => {
        queryClient.invalidateQueries({ queryKey: INQUIRIES_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inquiries = query.data?.inquiries;
  const newCount = inquiries?.filter((i) => i.status === "new").length ?? 0;

  return { ...query, inquiries, setupRequired: query.data?.setupRequired ?? false, newCount };
}
