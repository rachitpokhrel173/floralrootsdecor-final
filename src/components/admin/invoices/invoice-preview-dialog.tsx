"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceWithBooking } from "@/lib/data/invoices";
import type { CompanyProfileValues } from "@/lib/validations/settings";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithBooking | null;
  companyProfile: CompanyProfileValues;
}

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  invoice,
  companyProfile,
}: InvoicePreviewDialogProps) {
  if (!invoice) return null;

  const amountDue = invoice.total - invoice.amount_paid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 print:max-h-none print:overflow-visible">
        <div className="flex justify-end gap-2 p-4 print:hidden border-b border-border">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
          </Button>
        </div>

        <div id="invoice-print-area" className="p-8 space-y-8 bg-white text-black print:p-0">
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
              <h2 className="text-lg font-semibold tracking-wide">INVOICE</h2>
              <p className="text-sm text-neutral-500">{invoice.invoice_number}</p>
              <p className="text-xs text-neutral-500 mt-1">{formatDate(invoice.created_at)}</p>
              {invoice.due_date && (
                <p className="text-xs text-neutral-500">Due {formatDate(invoice.due_date)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Bill To</p>
              <p className="font-medium">{invoice.booking?.full_name}</p>
              <p className="text-sm text-neutral-500">{invoice.booking?.phone}</p>
              {invoice.booking?.email && (
                <p className="text-sm text-neutral-500">{invoice.booking.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Event</p>
              <p className="font-medium">{invoice.booking?.event_type}</p>
              <p className="text-sm text-neutral-500">
                {invoice.booking?.event_date && formatDate(invoice.booking.event_date)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Ref: {invoice.booking?.booking_code}</p>
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
              {invoice.items.map((item, idx) => (
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
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {!!invoice.discount_value && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Discount</span>
                  <span>-{formatCurrency(invoice.discount_value)}</span>
                </div>
              )}
              {!!invoice.tax_percent && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax ({invoice.tax_percent}%)</span>
                  <span>
                    {formatCurrency(
                      invoice.total - (invoice.subtotal - (invoice.discount_value ?? 0))
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-neutral-200">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-emerald-600">
                    <span>Paid</span>
                    <span>{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Amount Due</span>
                    <span>{formatCurrency(amountDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {invoice.notes && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Notes</p>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}