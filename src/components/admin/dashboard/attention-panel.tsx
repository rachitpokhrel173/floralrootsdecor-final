import Link from "next/link";
import {
  PhoneCall,
  CalendarClock,
  FileClock,
  ReceiptText,
  Wallet,
  PackageMinus,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionKind } from "@/lib/data/dashboard";

const KIND_ICON: Record<AttentionKind, typeof PhoneCall> = {
  uncontacted: PhoneCall,
  unconfirmed_soon: CalendarClock,
  stale_quotation: FileClock,
  overdue_invoice: ReceiptText,
  unpaid_soon: Wallet,
  low_stock: PackageMinus,
};

const MAX_VISIBLE = 6;

export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  const highCount = items.filter((i) => i.severity === "high").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="font-display text-base font-normal">Needs attention</CardTitle>
        {items.length > 0 && (
          <Badge variant={highCount > 0 ? "destructive" : "warning"}>
            {items.length} item{items.length === 1 ? "" : "s"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">You&apos;re on top of everything.</p>
          </div>
        ) : (
          <>
            {items.slice(0, MAX_VISIBLE).map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      item.severity === "high"
                        ? "bg-red-500/15 text-red-600"
                        : "bg-amber-500/15 text-amber-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
            {items.length > MAX_VISIBLE && (
              <p className="px-2 pt-1 text-xs text-muted-foreground">
                +{items.length - MAX_VISIBLE} more — check Bookings and Invoices
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
