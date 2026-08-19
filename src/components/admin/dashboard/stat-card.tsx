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
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">{label}</p>
              <p className="font-display text-2xl leading-none">{value}</p>
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
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", ACCENT_CLASSES[accent])}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
