"use client";

import { useEffect, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vendorSchema, VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, type VendorFormValues } from "@/lib/validations/vendor";
import { createVendorAction, updateVendorAction } from "@/actions/vendor-actions";
import type { VendorWithStats } from "@/lib/data/vendors";

export function VendorFormDialog({
  open,
  onOpenChange,
  editingVendor,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVendor?: VendorWithStats | null;
  onSaved?: () => void;
}) {
  const isEditing = !!editingVendor;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { category: "other", is_active: true },
  });

  const category = watch("category");
  const isActive = watch("is_active");

  useEffect(() => {
    if (!open) return;
    if (editingVendor) {
      reset({
        name: editingVendor.name,
        category: editingVendor.category as VendorFormValues["category"],
        contact_person: editingVendor.contact_person ?? "",
        phone: editingVendor.phone ?? "",
        email: editingVendor.email ?? "",
        address: editingVendor.address ?? "",
        rating: editingVendor.rating ?? undefined,
        notes: editingVendor.notes ?? "",
        is_active: editingVendor.is_active,
      });
    } else {
      reset({ category: "other", is_active: true });
    }
  }, [open, editingVendor, reset]);

  function onSubmit(values: VendorFormValues) {
    startTransition(async () => {
      const res = isEditing
        ? await updateVendorAction(editingVendor!.id, values)
        : await createVendorAction(values);

      if (res.success) {
        toast.success(isEditing ? "Vendor updated" : "Vendor added");
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error(res.error ?? "Failed to save vendor");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
          <DialogDescription>
            Track catering, photography, and other vendor partners.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setValue("category", v as VendorFormValues["category"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {VENDOR_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input {...register("contact_person")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rating (0–5)</Label>
              <Input type="number" min={0} max={5} step="0.1" {...register("rating")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive vendors are hidden from pickers</p>
            </div>
            <Switch checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="luxury" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
