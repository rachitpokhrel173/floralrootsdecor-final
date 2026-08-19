"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentMethodBadge } from "./payment-method-badge";
import type { PaymentWithDetails } from "@/lib/data/payments";
import type { CompanyProfileValues } from "@/lib/validations/settings";

export function PaymentReceiptDialog({
  payment,
  companyProfile,
  open,
  onOpenChange,
}: {
  payment: PaymentWithDetails | null;
  companyProfile: CompanyProfileValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 print:max-h-none print:overflow-visible">
        <div className="flex justify-between items-center gap-2 p-4 print:hidden border-b border-border">
          <p className="text-sm font-medium">Payment Receipt</p>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
          </Button>
        </div>

        <div id="receipt-print-area" className="p-8 space-y-6 bg-white text-black print:p-0">
          <div className="text-center space-y-1">
            {companyProfile.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyProfile.logo_url}
                alt={companyProfile.name}
                className="h-12 w-12 object-contain mx-auto mb-2"
              />
            )}
            <h1 className="text-xl font-serif font-semibold">{companyProfile.name}</h1>
            <p className="text-xs text-neutral-500">{companyProfile.tagline}</p>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-1">Amount Received</p>
            <p className="text-3xl font-display font-semibold">{formatCurrency(payment.amount)}</p>
            <div className="flex justify-center mt-2">
              <PaymentMethodBadge method={payment.method} />
            </div>
          </div>

          <Separator />

          <dl className="space-y-2.5 text-sm">
            <Row label="Received From" value={payment.booking?.full_name ?? "—"} />
            <Row label="Booking" value={`${payment.booking?.booking_code ?? "—"} · ${payment.booking?.event_type ?? ""}`} />
            {payment.invoice && <Row label="Invoice" value={payment.invoice.invoice_number} />}
            <Row label="Date" value={formatDate(payment.paid_at)} />
            {payment.reference_number && <Row label="Reference #" value={payment.reference_number} />}
            <Row label="Type" value={payment.is_advance ? "Advance Payment" : "Payment"} />
            {payment.received_by_name && <Row label="Received By" value={payment.received_by_name} />}
          </dl>

          {payment.notes && (
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}

          <p className="text-center text-[11px] text-neutral-400 pt-2">
            This is a computer-generated receipt.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}