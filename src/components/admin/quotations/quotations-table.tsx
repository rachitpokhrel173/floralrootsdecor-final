"use client";

import { useMemo, useState } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Send,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuotationStatusBadge } from "./quotation-status-badge";
import { QuotationBuilderDialog } from "./quotation-builder-dialog";
import { QuotationPreviewDialog } from "./quotation-preview-dialog";
import { RecordPaymentDialog } from "@/components/admin/payments/record-payment-dialog";
import { useQuotations } from "@/hooks/use-quotations";
import { updateQuotationStatusAction, deleteQuotationAction } from "@/actions/quotation-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";
import type { BookingOption } from "@/lib/data/quotations";
import type { ServiceCatalogItem, CompanyProfileValues } from "@/lib/validations/settings";
import type { QuotationStatus } from "@/types/database.types";

interface QuotationsTableProps {
  bookingOptions: BookingOption[];
  serviceCatalog: ServiceCatalogItem[];
  companyProfile: CompanyProfileValues;
}

const STATUS_FILTERS: { value: QuotationStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export function QuotationsTable({
  bookingOptions,
  serviceCatalog,
  companyProfile,
}: QuotationsTableProps) {
  const { data: quotations, isLoading, refetch } = useQuotations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationWithBooking | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<QuotationWithBooking | null>(null);
  const [paymentQuotation, setPaymentQuotation] = useState<QuotationWithBooking | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const list = quotations ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((q) => {
      const matchesStatus = statusFilter === "all" || q.status === statusFilter;
      const matchesSearch =
        !term ||
        q.quotation_number.toLowerCase().includes(term) ||
        q.booking?.full_name.toLowerCase().includes(term) ||
        q.booking?.booking_code.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [quotations, search, statusFilter]);

  function handleStatusChange(q: QuotationWithBooking, status: QuotationStatus) {
    startTransition(async () => {
      const res = await updateQuotationStatusAction(q.id, q.booking_id, status);
      if (!res.success) {
        toast.error("Couldn't update status", { description: res.error });
        return;
      }
      toast.success(`Quotation marked as ${status}`);
    });
  }

  function handleDelete(q: QuotationWithBooking) {
    if (!confirm(`Delete quotation ${q.quotation_number}? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteQuotationAction(q.id);
      if (!res.success) {
        toast.error("Couldn't delete quotation", { description: res.error });
        return;
      }
      toast.success("Quotation deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, client, or booking code…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as QuotationStatus | "all")}>
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingQuotation(null);
            setBuilderOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> New Quotation
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium w-10" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3" colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No quotations found. Create one from a booking to get started.
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((q) => (
                <tr
                  key={q.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setPreviewQuotation(q)}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{q.quotation_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.booking?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{q.booking?.booking_code}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p>{q.booking?.event_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.booking?.event_date && formatDate(q.booking.event_date)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(q.total)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {q.totalReceived > 0 ? (
                      <span
                        className={
                          q.totalReceived >= q.total ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"
                        }
                      >
                        {formatCurrency(Math.max(q.total - q.totalReceived, 0))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{formatCurrency(q.total)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <QuotationStatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(q.created_at)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewQuotation(q)}>
                          <Eye className="h-4 w-4 mr-2" /> View / Print
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingQuotation(q);
                            setBuilderOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentQuotation(q)}>
                          <Wallet className="h-4 w-4 mr-2" /> Record Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {q.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(q, "sent")}>
                            <Send className="h-4 w-4 mr-2" /> Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {q.status === "sent" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(q, "approved")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Approved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(q, "rejected")}>
                              <XCircle className="h-4 w-4 mr-2" /> Mark Rejected
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(q)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <QuotationBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        bookingOptions={bookingOptions}
        serviceCatalog={serviceCatalog}
        defaultTaxPercent={companyProfile.tax_percent}
        currency={companyProfile.currency}
        editingQuotation={editingQuotation}
        onSaved={refetch}
      />

      <QuotationPreviewDialog
        open={!!previewQuotation}
        onOpenChange={(o) => !o && setPreviewQuotation(null)}
        quotation={previewQuotation}
        companyProfile={companyProfile}
        onPaymentRecorded={refetch}
      />

      {paymentQuotation && (
        <RecordPaymentDialog
          open={!!paymentQuotation}
          onOpenChange={(o) => !o && setPaymentQuotation(null)}
          bookingId={paymentQuotation.booking_id}
          totalAmount={paymentQuotation.total}
          alreadyReceived={paymentQuotation.totalReceived}
          onRecorded={refetch}
        />
      )}
    </div>
  );
}
