"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoiceFromQuotationAction } from "@/actions/invoice-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApprovedQuotationOption } from "@/lib/data/invoices";

interface ConvertQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotations: ApprovedQuotationOption[];
  onSaved?: () => void;
}

export function ConvertQuotationDialog({
  open,
  onOpenChange,
  quotations,
  onSaved,
}: ConvertQuotationDialogProps) {
  const [selectedId, setSelectedId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConvert() {
    if (!selectedId) {
      toast.error("Select a quotation to convert");
      return;
    }
    startTransition(async () => {
      const res = await createInvoiceFromQuotationAction(selectedId, dueDate || null);
      if (!res.success) {
        toast.error("Couldn't convert quotation", { description: res.error });
        return;
      }
      toast.success("Invoice created from quotation");
      setSelectedId("");
      setDueDate("");
      onOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert Quotation to Invoice</DialogTitle>
        </DialogHeader>

        {quotations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No approved quotations are waiting to be invoiced. A quotation must be marked{" "}
            <span className="font-medium">Approved</span> before it can be converted.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Approved Quotation</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a quotation" />
                </SelectTrigger>
                <SelectContent>
                  {quotations.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        {q.quotation_number} — {q.booking?.full_name} · {formatCurrency(q.total)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedId && (
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                {(() => {
                  const q = quotations.find((x) => x.id === selectedId);
                  if (!q) return null;
                  return (
                    <>
                      <p>
                        <span className="text-foreground font-medium">{q.booking?.full_name}</span> —{" "}
                        {q.booking?.event_type}
                        {q.booking?.event_date && <> · {formatDate(q.booking.event_date)}</>}
                      </p>
                      <p className="mt-1">Total: {formatCurrency(q.total)}</p>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Due Date (optional)</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {quotations.length > 0 && (
            <Button onClick={handleConvert} disabled={isPending || !selectedId}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Invoice
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
