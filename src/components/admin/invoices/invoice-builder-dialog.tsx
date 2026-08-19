"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  invoiceFormSchema,
  computeInvoiceTotals,
  DEFAULT_INVOICE_ITEM,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { saveInvoiceAction } from "@/actions/invoice-actions";
import { formatCurrency } from "@/lib/utils";
import type { BookingOption } from "@/lib/data/quotations";
import type { InvoiceWithBooking } from "@/lib/data/invoices";

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingOptions: BookingOption[];
  defaultTaxPercent: number;
  currency: string;
  editingInvoice?: InvoiceWithBooking | null;
  onSaved?: () => void;
}

export function InvoiceBuilderDialog({
  open,
  onOpenChange,
  bookingOptions,
  defaultTaxPercent,
  currency,
  editingInvoice,
  onSaved,
}: InvoiceBuilderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingInvoice;

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      booking_id: "",
      items: [DEFAULT_INVOICE_ITEM],
      discount_value: 0,
      tax_percent: defaultTaxPercent,
      due_date: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!open) return;
    if (editingInvoice) {
      reset({
        booking_id: editingInvoice.booking_id,
        items: editingInvoice.items.map((i) => ({
          name: i.name,
          description: i.description ?? "",
          qty: i.qty,
          unit_price: i.unit_price,
        })),
        discount_value: editingInvoice.discount_value ?? 0,
        tax_percent: editingInvoice.tax_percent ?? defaultTaxPercent,
        due_date: editingInvoice.due_date ?? "",
        notes: editingInvoice.notes ?? "",
      });
    } else {
      reset({
        booking_id: "",
        items: [DEFAULT_INVOICE_ITEM],
        discount_value: 0,
        tax_percent: defaultTaxPercent,
        due_date: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingInvoice]);

  const watchedItems = watch("items");
  const watchedDiscountValue = watch("discount_value");
  const watchedTaxPercent = watch("tax_percent");

  const totals = useMemo(() => {
    const validItems = (watchedItems ?? []).filter((i) => i.name && i.qty > 0);
    return computeInvoiceTotals(validItems, watchedDiscountValue, watchedTaxPercent);
  }, [watchedItems, watchedDiscountValue, watchedTaxPercent]);

  function onSubmit(values: InvoiceFormValues) {
    startTransition(async () => {
      const res = await saveInvoiceAction({
        id: editingInvoice?.id,
        booking_id: values.booking_id,
        items: values.items,
        discount_value: values.discount_value,
        tax_percent: values.tax_percent,
        due_date: values.due_date || null,
        notes: values.notes,
      });

      if (!res.success) {
        toast.error("Couldn't save invoice", { description: res.error });
        return;
      }
      toast.success(isEditing ? "Invoice updated" : "Invoice created");
      onOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Booking</Label>
            <Controller
              control={control}
              name="booking_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingOptions.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.booking_code} — {b.full_name} ({b.event_type}, {b.event_date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.booking_id && (
              <p className="text-xs text-destructive">{errors.booking_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append(DEFAULT_INVOICE_ITEM)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start rounded-lg border border-border p-2.5">
                  <div className="col-span-12 sm:col-span-5">
                    <Input placeholder="Item name" {...register(`items.${index}.name` as const)} />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input placeholder="Description" {...register(`items.${index}.description` as const)} />
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <Input type="number" min={1} placeholder="Qty" {...register(`items.${index}.qty` as const)} />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Unit price"
                      {...register(`items.${index}.unit_price` as const)}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-xs text-destructive">{errors.items.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Discount (flat)</Label>
              <Input type="number" min={0} {...register("discount_value")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tax %</Label>
              <Input type="number" min={0} max={100} {...register("tax_percent")} />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} placeholder="Payment instructions, terms…" {...register("notes")} />
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-border">
              <span>Total ({currency})</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
