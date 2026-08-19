"use client";

import { motion } from "framer-motion";
import { Wallet, CalendarClock, CalendarRange, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import type { PaymentStats } from "@/lib/data/payments";

const CARDS: {
  key: keyof Pick<PaymentStats, "todayReceived" | "monthReceived" | "yearReceived" | "totalOutstanding">;
  label: string;
  icon: typeof Wallet;
  accent: string;
}[] = [
  { key: "todayReceived", label: "Received Today", icon: Wallet, accent: "bg-gold/15 text-gold-dark" },
  { key: "monthReceived", label: "This Month", icon: CalendarClock, accent: "bg-emerald-500/15 text-emerald-600" },
  { key: "yearReceived", label: "This Year", icon: CalendarRange, accent: "bg-blue-500/15 text-blue-600" },
  { key: "totalOutstanding", label: "Total Outstanding", icon: AlertCircle, accent: "bg-red-500/15 text-red-600" },
];

export function PaymentStatsCards({ stats, isLoading }: { stats?: PaymentStats; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">{card.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <p className="font-display text-2xl leading-none">
                      {formatCurrency(stats?.[card.key] ?? 0)}
                    </p>
                  )}
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", card.accent)}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
