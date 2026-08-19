"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inventorySchema,
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABELS,
  type InventoryFormValues,
} from "@/lib/validations/inventory";
import { createInventoryItemAction, updateInventoryItemAction, getActiveVendorOptionsAction } from "@/actions/inventory-actions";
import type { InventoryWithSupplier, VendorOption } from "@/lib/data/inventory";

export function InventoryFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: InventoryWithSupplier | null;
  onSaved?: () => void;
}) {
  const isEditing = !!editingItem;
  const [isPending, startTransition] = useTransition();
  const [vendors, setVendors] = useState<VendorOption[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { category: "decorations", quantity: 0, is_available: true },
  });

  const category = watch("category");
  const supplierId = watch("supplier_id");
  const isAvailable = watch("is_available");

  useEffect(() => {
    if (!open) return;
    getActiveVendorOptionsAction().then(setVendors);

    if (editingItem) {
      reset({
        name: editingItem.name,
        category: editingItem.category as InventoryFormValues["category"],
        sku: editingItem.sku ?? "",
        barcode: editingItem.barcode ?? "",
        qr_code: editingItem.qr_code ?? "",
        quantity: editingItem.quantity,
        unit: editingItem.unit ?? "pcs",
        supplier_id: editingItem.supplier_id ?? "",
        purchase_price: editingItem.purchase_price ?? undefined,
        is_available: editingItem.is_available,
        location: editingItem.location ?? "",
      });
    } else {
      reset({ category: "decorations", quantity: 0, is_available: true, unit: "pcs" });
    }
  }, [open, editingItem, reset]);

  function onSubmit(values: InventoryFormValues) {
    startTransition(async () => {
      const res = isEditing
        ? await updateInventoryItemAction(editingItem!.id, values)
        : await createInventoryItemAction(values);

      if (res.success) {
        toast.success(isEditing ? "Item updated" : "Item added");
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error(res.error ?? "Failed to save item");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Item" : "Add Inventory Item"}</DialogTitle>
          <DialogDescription>Track flowers, furniture, lighting, stage gear, and more.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setValue("category", v as InventoryFormValues["category"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {INVENTORY_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId || "none"} onValueChange={(v) => setValue("supplier_id", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={0} {...register("quantity")} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input placeholder="pcs" {...register("unit")} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Price</Label>
              <Input type="number" min={0} {...register("purchase_price")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Warehouse A" {...register("location")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input {...register("barcode")} />
            </div>
            <div className="space-y-2">
              <Label>QR Code</Label>
              <Input {...register("qr_code")} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-2">
            Barcode/QR are stored as text references — this doesn&apos;t generate scannable images yet.
          </p>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Available</p>
              <p className="text-xs text-muted-foreground">Unavailable items are hidden from booking assignment</p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={(v) => setValue("is_available", v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="luxury" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
