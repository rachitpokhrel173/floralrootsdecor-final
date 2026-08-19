"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Trash2, Plus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentReceiptDialog } from "./payment-receipt-dialog";
import { NewPaymentDialog } from "./new-payment-dialog";
import { PaymentStatsCards } from "./payment-stats-cards";
import { usePayments } from "@/hooks/use-payments";
import { deletePaymentAction } from "@/actions/payment-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentWithDetails } from "@/lib/data/payments";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import type { PaymentMethod } from "@/types/database.types";

const METHOD_FILTERS: { value: PaymentMethod | "all"; label: string }[] = [
  { value: "all", label: "All methods" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

export function PaymentsTable({ companyProfile }: { companyProfile: CompanyProfileValues }) {
  const { data: payments, isLoading, stats, statsLoading, refetch } = usePayments();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentWithDetails | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const list = payments ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchesMethod = methodFilter === "all" || p.method === methodFilter;
      const matchesSearch =
        !term ||
        p.booking?.full_name.toLowerCase().includes(term) ||
        p.booking?.booking_code.toLowerCase().includes(term) ||
        (p.reference_number ?? "").toLowerCase().includes(term);
      return matchesMethod && matchesSearch;
    });
  }, [payments, search, methodFilter]);

  function handleVoid(p: PaymentWithDetails) {
    if (!confirm(`Void this ${formatCurrency(p.amount)} payment? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deletePaymentAction(p.id);
      if (!res.success) {
        toast.error("Couldn't void payment", { description: res.error });
        return;
      }
      toast.success("Payment voided");
      refetch();
    });
  }

  return (
    <div className="space-y-6">
      <PaymentStatsCards stats={stats} isLoading={statsLoading} />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, booking code, or reference…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v as PaymentMethod | "all")}>
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METHOD_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setNewPaymentOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Payment
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Booking</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium w-10" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No payments recorded yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setReceiptPayment(p)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(p.paid_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.booking?.full_name ?? "—"}</p>
                    {p.is_advance && (
                      <Badge variant="outline" className="mt-0.5 gap-1 text-[10px]">
                        <Star className="h-2.5 w-2.5" /> Advance
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-mono text-xs">{p.booking?.booking_code ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{p.booking?.event_type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentMethodBadge method={p.method} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-emerald-600">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.reference_number ?? "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setReceiptPayment(p)}>
                          <Eye className="h-4 w-4 mr-2" /> View Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleVoid(p)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Void Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <NewPaymentDialog open={newPaymentOpen} onOpenChange={setNewPaymentOpen} onRecorded={refetch} />

      <PaymentReceiptDialog
        payment={receiptPayment}
        companyProfile={companyProfile}
        open={!!receiptPayment}
        onOpenChange={(o) => !o && setReceiptPayment(null)}
      />
    </div>
  );
}
