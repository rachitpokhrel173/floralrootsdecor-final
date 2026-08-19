"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import { RecordPaymentDialog } from "@/components/admin/payments/record-payment-dialog";

interface QuotationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: QuotationWithBooking | null;
  companyProfile: CompanyProfileValues;
  onPaymentRecorded?: () => void;
}

export function QuotationPreviewDialog({
  open,
  onOpenChange,
  quotation,
  companyProfile,
  onPaymentRecorded,
}: QuotationPreviewDialogProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  if (!quotation) return null;

  const received = quotation.totalReceived ?? 0;
  const balanceRemaining = Math.max(quotation.total - received, 0);

  const discountLabel =
    quotation.discount_type === "percent"
      ? `Discount (${quotation.discount_value}%)`
      : quotation.discount_type === "flat"
        ? "Discount"
        : null;

  const discountAmount =
    quotation.discount_type === "percent"
      ? (quotation.subtotal * (quotation.discount_value ?? 0)) / 100
      : quotation.discount_type === "flat"
        ? (quotation.discount_value ?? 0)
        : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 print:max-h-none print:overflow-visible">
        <div className="flex justify-between items-center gap-2 p-4 print:hidden border-b border-border">
          <Button size="sm" variant="outline" onClick={() => setPaymentDialogOpen(true)}>
            <Wallet className="h-4 w-4 mr-2" /> Record Payment
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
          </Button>
        </div>

        <div id="quotation-print-area" className="p-8 space-y-8 bg-white text-black print:p-0">
          <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
            <div className="flex items-start gap-3">
              {companyProfile.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={companyProfile.logo_url}
                  alt={companyProfile.name}
                  className="h-12 w-12 object-contain rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-serif font-semibold">{companyProfile.name}</h1>
                <p className="text-sm text-neutral-500">{companyProfile.tagline}</p>
                <p className="text-xs text-neutral-500 mt-2 whitespace-pre-line">{companyProfile.address}</p>
                <p className="text-xs text-neutral-500">
                  {companyProfile.phone} {companyProfile.email && `· ${companyProfile.email}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold tracking-wide">QUOTATION</h2>
              <p className="text-sm text-neutral-500">{quotation.quotation_number}</p>
              <p className="text-xs text-neutral-500">v{quotation.version}</p>
              <p className="text-xs text-neutral-500 mt-1">{formatDate(quotation.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Bill To</p>
              <p className="font-medium">{quotation.booking?.full_name}</p>
              <p className="text-sm text-neutral-500">{quotation.booking?.phone}</p>
              {quotation.booking?.email && (
                <p className="text-sm text-neutral-500">{quotation.booking.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Event</p>
              <p className="font-medium">{quotation.booking?.event_type}</p>
              <p className="text-sm text-neutral-500">
                {quotation.booking?.event_date && formatDate(quotation.booking.event_date)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Ref: {quotation.booking?.booking_code}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium text-right">Qty</th>
                <th className="py-2 font-medium text-right">Unit Price</th>
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, idx) => (
                <tr key={idx} className="border-b border-neutral-100">
                  <td className="py-2.5">
                    <p>{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-neutral-400">{item.description}</p>
                    )}
                  </td>
                  <td className="py-2.5 text-right">{item.qty}</td>
                  <td className="py-2.5 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {discountLabel && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">{discountLabel}</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {!!quotation.tax_percent && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax ({quotation.tax_percent}%)</span>
                  <span>
                    {formatCurrency(quotation.total - (quotation.subtotal - discountAmount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-neutral-200">
                <span>Total</span>
                <span>{formatCurrency(quotation.total)}</span>
              </div>
              {received > 0 && (
                <>
                  <div className="flex justify-between text-emerald-700">
                    <span>Advance Received</span>
                    <span>-{formatCurrency(received)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-neutral-200">
                    <span>Balance Due</span>
                    <span>{formatCurrency(balanceRemaining)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {received > 0 && (
            <div className="flex justify-center print:hidden">
              <Badge variant={balanceRemaining === 0 ? "success" : "warning"}>
                {balanceRemaining === 0
                  ? "Fully Paid"
                  : `${formatCurrency(received)} received · ${formatCurrency(balanceRemaining)} remaining`}
              </Badge>
            </div>
          )}

          {quotation.notes && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Notes</p>
              <p className="text-sm whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}

          {quotation.valid_until && (
            <p className="text-xs text-neutral-400">
              Valid until {formatDate(quotation.valid_until)}
            </p>
          )}
        </div>
      </DialogContent>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        bookingId={quotation.booking_id}
        totalAmount={quotation.total}
        alreadyReceived={received}
        onRecorded={onPaymentRecorded}
      />
    </Dialog>
  );
}