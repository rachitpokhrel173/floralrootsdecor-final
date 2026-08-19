"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordPaymentAction } from "@/actions/payment-actions";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database.types";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  bookingId,
  invoiceId,
  totalAmount,
  alreadyReceived,
  onRecorded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  invoiceId?: string;
  totalAmount: number;
  alreadyReceived: number;
  onRecorded?: () => void;
}) {
  const remaining = Math.max(totalAmount - alreadyReceived, 0);
  const [amount, setAmount] = useState<number>(remaining || 0);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [isAdvance, setIsAdvance] = useState(true);
  const [reference, setReference] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (amount <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const res = await recordPaymentAction({
        bookingId,
        invoiceId,
        amount,
        method,
        isAdvance,
        referenceNumber: reference || undefined,
      });
      if (res.success) {
        toast.success(`${formatCurrency(amount)} recorded`);
        onOpenChange(false);
        onRecorded?.();
      } else {
        toast.error(res.error ?? "Failed to record payment");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gold" /> Record Payment
          </DialogTitle>
          <DialogDescription>
            Balance remaining: <span className="font-medium text-foreground">{formatCurrency(remaining)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount</Label>
            <Input
              id="payment-amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-reference">Reference Number (optional)</Label>
            <Input
              id="payment-reference"
              placeholder="Transaction / cheque number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is-advance"
              checked={isAdvance}
              onCheckedChange={(v) => setIsAdvance(!!v)}
            />
            <Label htmlFor="is-advance" className="font-normal cursor-pointer">
              This is an advance payment
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="luxury" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Record {formatCurrency(amount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
