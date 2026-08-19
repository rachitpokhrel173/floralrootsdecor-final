"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Sparkles } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  quotationFormSchema,
  computeQuotationTotals,
  DEFAULT_QUOTATION_ITEM,
  type QuotationFormValues,
} from "@/lib/validations/quotation";
import { saveQuotationAction } from "@/actions/quotation-actions";
import { formatCurrency } from "@/lib/utils";
import type { BookingOption } from "@/lib/data/quotations";
import type { ServiceCatalogItem } from "@/lib/validations/settings";
import type { QuotationWithBooking } from "@/lib/data/quotations";

interface QuotationBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingOptions: BookingOption[];
  serviceCatalog: ServiceCatalogItem[];
  defaultTaxPercent: number;
  currency: string;
  editingQuotation?: QuotationWithBooking | null;
  lockedBookingId?: string;
  onSaved?: () => void;
}

export function QuotationBuilderDialog({
  open,
  onOpenChange,
  bookingOptions,
  serviceCatalog,
  defaultTaxPercent,
  currency,
  editingQuotation,
  lockedBookingId,
  onSaved,
}: QuotationBuilderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingQuotation;

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      booking_id: lockedBookingId ?? "",
      items: [DEFAULT_QUOTATION_ITEM],
      discount_type: null,
      discount_value: 0,
      tax_percent: defaultTaxPercent,
      notes: "",
      valid_until: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!open) return;
    if (editingQuotation) {
      reset({
        booking_id: editingQuotation.booking_id,
        items: editingQuotation.items.map((i) => ({
          name: i.name,
          description: i.description ?? "",
          qty: i.qty,
          unit_price: i.unit_price,
        })),
        discount_type: (editingQuotation.discount_type as "flat" | "percent" | null) ?? null,
        discount_value: editingQuotation.discount_value ?? 0,
        tax_percent: editingQuotation.tax_percent ?? defaultTaxPercent,
        notes: editingQuotation.notes ?? "",
        valid_until: editingQuotation.valid_until ?? "",
      });
    } else {
      reset({
        booking_id: lockedBookingId ?? "",
        items: [DEFAULT_QUOTATION_ITEM],
        discount_type: null,
        discount_value: 0,
        tax_percent: defaultTaxPercent,
        notes: "",
        valid_until: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingQuotation]);

  const watchedItems = watch("items");
  const watchedDiscountType = watch("discount_type");
  const watchedDiscountValue = watch("discount_value");
  const watchedTaxPercent = watch("tax_percent");

  const totals = useMemo(() => {
    const validItems = (watchedItems ?? []).filter((i) => i.name && i.qty > 0);
    return computeQuotationTotals(validItems, watchedDiscountType, watchedDiscountValue, watchedTaxPercent);
  }, [watchedItems, watchedDiscountType, watchedDiscountValue, watchedTaxPercent]);

  function addFromCatalog(label: string) {
    append({ name: label, description: "", qty: 1, unit_price: 0 });
  }

  function onSubmit(values: QuotationFormValues) {
    startTransition(async () => {
      const res = await saveQuotationAction({
        id: editingQuotation?.id,
        booking_id: values.booking_id,
        items: values.items,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        tax_percent: values.tax_percent,
        notes: values.notes,
        valid_until: values.valid_until || null,
      });

      if (!res.success) {
        toast.error("Couldn't save quotation", { description: res.error });
        return;
      }
      toast.success(isEditing ? "Quotation updated" : "Quotation created");
      onOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Quotation" : "New Quotation"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Booking</Label>
            <Controller
              control={control}
              name="booking_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!!lockedBookingId}>
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
              <Button type="button" variant="outline" size="sm" onClick={() => append(DEFAULT_QUOTATION_ITEM)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>

            {serviceCatalog.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                  <Sparkles className="h-3 w-3" /> Quick add:
                </span>
                {serviceCatalog.map((s) => (
                  <Badge
                    key={s.key}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => addFromCatalog(s.label)}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            )}

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
              <Label>Discount Type</Label>
              <Controller
                control={control}
                name="discount_type"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No discount</SelectItem>
                      <SelectItem value="flat">Flat amount</SelectItem>
                      <SelectItem value="percent">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Value</Label>
              <Input type="number" min={0} disabled={!watchedDiscountType} {...register("discount_value")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tax %</Label>
              <Input type="number" min={0} max={100} {...register("tax_percent")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Valid Until</Label>
              <Input type="date" {...register("valid_until")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} placeholder="Payment terms, inclusions, exclusions…" {...register("notes")} />
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
              {isEditing ? "Save Changes" : "Create Quotation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
