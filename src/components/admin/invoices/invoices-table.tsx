"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Send,
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  Wallet,
  FileInput,
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
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceBuilderDialog } from "./invoice-builder-dialog";
import { InvoicePreviewDialog } from "./invoice-preview-dialog";
import { ConvertQuotationDialog } from "./convert-quotation-dialog";
import { RecordPaymentDialog } from "@/components/admin/payments/record-payment-dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { updateInvoiceStatusAction, deleteInvoiceAction } from "@/actions/invoice-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceWithBooking, ApprovedQuotationOption } from "@/lib/data/invoices";
import type { BookingOption } from "@/lib/data/quotations";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import type { InvoiceStatus } from "@/types/database.types";

interface InvoicesTableProps {
  bookingOptions: BookingOption[];
  convertibleQuotations: ApprovedQuotationOption[];
  companyProfile: CompanyProfileValues;
}

const STATUS_FILTERS: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export function InvoicesTable({ bookingOptions, convertibleQuotations, companyProfile }: InvoicesTableProps) {
  const { data: invoices, isLoading, refetch } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithBooking | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithBooking | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceWithBooking | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const list = invoices ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((inv) => {
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchesSearch =
        !term ||
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.booking?.full_name.toLowerCase().includes(term) ||
        inv.booking?.booking_code.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  function handleStatusChange(inv: InvoiceWithBooking, status: InvoiceStatus) {
    startTransition(async () => {
      const res = await updateInvoiceStatusAction(inv.id, inv.booking_id, status);
      if (!res.success) {
        toast.error("Couldn't update status", { description: res.error });
        return;
      }
      toast.success(`Invoice marked as ${status}`);
      refetch();
    });
  }

  function handleDelete(inv: InvoiceWithBooking) {
    if (!confirm(`Delete invoice ${inv.invoice_number}? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteInvoiceAction(inv.id);
      if (!res.success) {
        toast.error("Couldn't delete invoice", { description: res.error });
        return;
      }
      toast.success("Invoice deleted");
      refetch();
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
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConvertOpen(true)}>
            <FileInput className="h-4 w-4 mr-2" /> From Quotation
          </Button>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setBuilderOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> New Invoice
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
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
                  No invoices found. Create one directly or convert an approved quotation.
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((inv) => {
                const amountDue = Math.max(inv.total - inv.amount_paid, 0);
                return (
                  <tr
                    key={inv.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setPreviewInvoice(inv)}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{inv.booking?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{inv.booking?.booking_code}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p>{inv.booking?.event_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.booking?.event_date && formatDate(inv.booking.event_date)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={amountDue === 0 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                        {formatCurrency(amountDue)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewInvoice(inv)}>
                            <Eye className="h-4 w-4 mr-2" /> View / Print
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingInvoice(inv);
                              setBuilderOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPaymentInvoice(inv)}>
                            <Wallet className="h-4 w-4 mr-2" /> Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {inv.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(inv, "sent")}>
                              <Send className="h-4 w-4 mr-2" /> Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {(inv.status === "sent" || inv.status === "partial") && (
                            <DropdownMenuItem onClick={() => handleStatusChange(inv, "paid")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(inv)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <InvoiceBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        bookingOptions={bookingOptions}
        defaultTaxPercent={companyProfile.tax_percent}
        currency={companyProfile.currency}
        editingInvoice={editingInvoice}
        onSaved={refetch}
      />

      <ConvertQuotationDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        quotations={convertibleQuotations}
        onSaved={refetch}
      />

      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(o) => !o && setPreviewInvoice(null)}
        invoice={previewInvoice}
        companyProfile={companyProfile}
      />

      {paymentInvoice && (
        <RecordPaymentDialog
          open={!!paymentInvoice}
          onOpenChange={(o) => !o && setPaymentInvoice(null)}
          bookingId={paymentInvoice.booking_id}
          invoiceId={paymentInvoice.id}
          totalAmount={paymentInvoice.total}
          alreadyReceived={paymentInvoice.amount_paid}
          onRecorded={refetch}
        />
      )}
    </div>
  );
}
