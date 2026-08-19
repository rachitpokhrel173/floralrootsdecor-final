"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notification-actions";
import type { Notification } from "@/types/database.types";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications(limit = 30) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, limit],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    // Unique channel name per mount avoids a React Strict Mode race where a
    // fast unmount/remount reuses a channel still mid-teardown.
    const channel = supabase
      .channel(`notifications-changes-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  async function markRead(id: string, isRead = true) {
    queryClient.setQueryData<Notification[]>([...NOTIFICATIONS_KEY, limit], (old) =>
      old ? old.map((n) => (n.id === id ? { ...n, is_read: isRead } : n)) : old
    );
    const res = await markNotificationReadAction(id, isRead);
    if (!res.success) {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    }
  }

  async function markAllRead() {
    queryClient.setQueryData<Notification[]>([...NOTIFICATIONS_KEY, limit], (old) =>
      old ? old.map((n) => ({ ...n, is_read: true })) : old
    );
    const res = await markAllNotificationsReadAction();
    if (!res.success) {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    }
  }

  return { ...query, unreadCount, markRead, markAllRead };
}
