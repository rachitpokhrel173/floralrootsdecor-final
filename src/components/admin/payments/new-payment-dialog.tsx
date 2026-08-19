"use client";

import { useEffect, useState, useTransition } from "react";
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
import { getBookingOptionsAction } from "@/actions/quotation-actions";
import type { BookingOption } from "@/lib/data/quotations";
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

export function NewPaymentDialog({
  open,
  onOpenChange,
  onRecorded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded?: () => void;
}) {
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [isAdvance, setIsAdvance] = useState(false);
  const [reference, setReference] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    getBookingOptionsAction().then(setBookings);
    setBookingId("");
    setAmount(0);
    setMethod("cash");
    setIsAdvance(false);
    setReference("");
  }, [open]);

  function handleSubmit() {
    if (!bookingId) {
      toast.error("Please select a booking");
      return;
    }
    if (amount <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const res = await recordPaymentAction({
        bookingId,
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
            <Wallet className="h-4 w-4 text-gold" /> New Payment
          </DialogTitle>
          <DialogDescription>Record a payment against any booking.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Booking</Label>
            <Select value={bookingId} onValueChange={setBookingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.booking_code} — {b.full_name} ({b.event_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-payment-amount">Amount</Label>
            <Input
              id="new-payment-amount"
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
            <Label htmlFor="new-payment-reference">Reference Number (optional)</Label>
            <Input
              id="new-payment-reference"
              placeholder="Transaction / cheque number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="new-is-advance" checked={isAdvance} onCheckedChange={(v) => setIsAdvance(!!v)} />
            <Label htmlFor="new-is-advance" className="font-normal cursor-pointer">
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
