"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { QuotationWithBooking } from "@/lib/data/quotations";
import type { CompanyProfileValues } from "@/lib/validations/settings";
import { RecordPaymentDialog } from "@/components/admin/payments/record-payment-dialog";
import { QuotationDocument, quotationBreakdown } from "@/components/quotations/quotation-document";
import { QuotationShareMenu } from "./quotation-share-menu";

interface QuotationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: QuotationWithBooking | null;
  companyProfile: CompanyProfileValues;
  onPaymentRecorded?: () => void;
  onChanged?: () => void;
}

export function QuotationPreviewDialog({
  open,
  onOpenChange,
  quotation,
  companyProfile,
  onPaymentRecorded,
  onChanged,
}: QuotationPreviewDialogProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  if (!quotation) return null;

  const { received, balanceRemaining } = quotationBreakdown(quotation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] gap-0 overflow-y-auto p-0 print:max-h-none print:overflow-visible">
        <DialogTitle className="sr-only">
          Quotation {quotation.quotation_number} for {quotation.booking?.full_name ?? "client"}
        </DialogTitle>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 pr-12 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPaymentDialogOpen(true)}>
              <Wallet className="mr-2 h-4 w-4" /> Record Payment
            </Button>
            {received > 0 && (
              <Badge variant={balanceRemaining === 0 ? "success" : "warning"}>
                {balanceRemaining === 0
                  ? "Fully Paid"
                  : `${formatCurrency(received)} in · ${formatCurrency(balanceRemaining)} due`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <QuotationShareMenu
              quotation={quotation}
              companyName={companyProfile.name}
              onChanged={onChanged}
            />
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print / PDF
            </Button>
          </div>
        </div>

        <QuotationDocument quotation={quotation} companyProfile={companyProfile} />
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
