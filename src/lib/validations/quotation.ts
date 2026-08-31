import { z } from "zod";

export const quotationItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(120),
  description: z.string().max(300).optional(),
  qty: z.coerce.number().min(1, "Qty must be at least 1"),
  unit_price: z.coerce.number().min(0, "Price can't be negative"),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;

export const quotationFormSchema = z.object({
  booking_id: z.string().uuid("Select a booking"),
  items: z.array(quotationItemSchema).min(1, "Add at least one line item"),
  discount_type: z.enum(["flat", "percent"]).nullable(),
  discount_value: z.coerce.number().min(0).nullable(),
  tax_percent: z.coerce.number().min(0).max(100).nullable(),
  images: z.array(z.string().url()).max(12, "Up to 12 images").optional(),
  notes: z.string().max(1000).optional(),
  valid_until: z.string().optional().nullable(),
});

export type QuotationFormValues = z.infer<typeof quotationFormSchema>;

/** Server-side schema for saveQuotationAction — the form payload plus an
 *  optional `id` when editing an existing quotation. */
export const saveQuotationSchema = quotationFormSchema.extend({
  id: z.string().uuid().optional(),
});

export type SaveQuotationInput = z.infer<typeof saveQuotationSchema>;

export interface QuotationItemWithTotal {
  name: string;
  description?: string;
  qty: number;
  unit_price: number;
  total: number;
}

export function computeQuotationTotals(
  items: QuotationItemInput[],
  discountType: "flat" | "percent" | null,
  discountValue: number | null,
  taxPercent: number | null
) {
  const lineItems: QuotationItemWithTotal[] = items.map((i) => ({
    ...i,
    total: Math.round(i.qty * i.unit_price * 100) / 100,
  }));

  const subtotal = Math.round(lineItems.reduce((sum, i) => sum + i.total, 0) * 100) / 100;

  let discountAmount = 0;
  if (discountType === "flat") {
    discountAmount = discountValue ?? 0;
  } else if (discountType === "percent") {
    discountAmount = (subtotal * (discountValue ?? 0)) / 100;
  }
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * ((taxPercent ?? 0) / 100) * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  return { lineItems, subtotal, discountAmount, taxAmount, total };
}

export const DEFAULT_QUOTATION_ITEM: QuotationItemInput = {
  name: "",
  description: "",
  qty: 1,
  unit_price: 0,
};
