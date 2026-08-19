import { z } from "zod";

export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(120),
  description: z.string().max(300).optional(),
  qty: z.coerce.number().min(1, "Qty must be at least 1"),
  unit_price: z.coerce.number().min(0, "Price can't be negative"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceFormSchema = z.object({
  booking_id: z.string().uuid("Select a booking"),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
  discount_value: z.coerce.number().min(0).nullable(),
  tax_percent: z.coerce.number().min(0).max(100).nullable(),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export interface InvoiceItemWithTotal {
  name: string;
  description?: string;
  qty: number;
  unit_price: number;
  total: number;
}

/** Invoices only support a flat discount amount (no percent type), matching the schema. */
export function computeInvoiceTotals(
  items: InvoiceItemInput[],
  discountValue: number | null,
  taxPercent: number | null
) {
  const lineItems: InvoiceItemWithTotal[] = items.map((i) => ({
    ...i,
    total: Math.round(i.qty * i.unit_price * 100) / 100,
  }));

  const subtotal = Math.round(lineItems.reduce((sum, i) => sum + i.total, 0) * 100) / 100;
  const discountAmount = Math.min(Math.max(discountValue ?? 0, 0), subtotal);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * ((taxPercent ?? 0) / 100) * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  return { lineItems, subtotal, discountAmount, taxAmount, total };
}

export const DEFAULT_INVOICE_ITEM: InvoiceItemInput = {
  name: "",
  description: "",
  qty: 1,
  unit_price: 0,
};
