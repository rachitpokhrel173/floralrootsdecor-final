"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accent?: "default" | "gold" | "emerald" | "red";
  delay?: number;
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold-dark",
  emerald: "bg-emerald-500/15 text-emerald-600",
  red: "bg-red-500/15 text-red-600",
};

export function StatCard({ label, value, icon, trend, accent = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mb-1.5 leading-tight">{label}</p>
              <p className="font-display text-lg sm:text-2xl leading-none whitespace-nowrap">{value}</p>
              {trend && (
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    trend.positive ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </p>
              )}
            </div>
            <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5", ACCENT_CLASSES[accent])}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
