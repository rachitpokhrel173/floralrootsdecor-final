"use client";

import Link from "next/link";
import {
  CalendarPlus,
  Wallet,
  CalendarClock,
  UserCog,
  BellRing,
  FileCheck,
  ReceiptText,
  Info,
  Circle,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate, cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/database.types";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof CalendarPlus; className: string }
> = {
  new_booking: { icon: CalendarPlus, className: "bg-blue-500/15 text-blue-600" },
  payment_received: { icon: Wallet, className: "bg-emerald-500/15 text-emerald-600" },
  upcoming_event: { icon: CalendarClock, className: "bg-amber-500/15 text-amber-600" },
  staff_assignment: { icon: UserCog, className: "bg-indigo-500/15 text-indigo-600" },
  reminder: { icon: BellRing, className: "bg-purple-500/15 text-purple-600" },
  quotation_approved: { icon: FileCheck, className: "bg-gold/15 text-gold-dark" },
  invoice_paid: { icon: ReceiptText, className: "bg-emerald-500/15 text-emerald-600" },
  system: { icon: Info, className: "bg-muted text-muted-foreground" },
};

export function NotificationItem({
  notification,
  onToggleRead,
  index = 0,
}: {
  notification: Notification;
  onToggleRead: (id: string, isRead: boolean) => void;
  index?: number;
}) {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const Icon = config.icon;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-accent/50",
        !notification.is_read && "bg-gold/[0.04] border-gold/20"
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", config.className)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          {!notification.is_read && <Circle className="h-2 w-2 fill-gold text-gold mt-1.5 shrink-0" />}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground/70 mt-1">{formatDate(notification.created_at)}</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleRead(notification.id, !notification.is_read);
        }}
        className="shrink-0 text-[11px] font-medium text-gold hover:underline whitespace-nowrap mt-0.5"
      >
        {notification.is_read ? "Mark unread" : "Mark read"}
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      {notification.link ? <Link href={notification.link}>{content}</Link> : content}
    </motion.div>
  );
}
