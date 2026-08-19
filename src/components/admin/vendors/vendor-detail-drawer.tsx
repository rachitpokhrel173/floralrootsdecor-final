"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Phone, Mail, MapPin, Star, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getVendorPaymentsAction, recordVendorPaymentAction } from "@/actions/vendor-actions";
import { VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { VendorWithStats } from "@/lib/data/vendors";

export function VendorDetailDrawer({
  vendor,
  open,
  onOpenChange,
  onEdit,
}: {
  vendor: VendorWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (v: VendorWithStats) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ["vendor-payments", vendor?.id],
    enabled: !!vendor,
    queryFn: () => getVendorPaymentsAction(vendor!.id),
  });

  if (!vendor) return null;

  function recordPayment() {
    if (amount <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const res = await recordVendorPaymentAction(vendor!.id, { amount, notes: note });
      if (res.success) {
        setAmount(0);
        setNote("");
        queryClient.invalidateQueries({ queryKey: ["vendor-payments", vendor!.id] });
        toast.success("Payment recorded");
      } else {
        toast.error(res.error ?? "Failed to record payment");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>{vendor.name}</SheetTitle>
              <SheetDescription>{VENDOR_CATEGORY_LABELS[vendor.category as keyof typeof VENDOR_CATEGORY_LABELS] ?? vendor.category}</SheetDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => onEdit(vendor)}>
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">Total Paid</p>
              <p className="font-display text-lg">{formatCurrency(vendor.totalPaid)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">Rating</p>
              <p className="font-display text-lg flex items-center gap-1">
                {vendor.rating ? (
                  <>
                    <Star className="h-4 w-4 fill-gold text-gold" /> {vendor.rating.toFixed(1)}
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {vendor.contact_person && <InfoRow icon={Phone} label="Contact Person" value={vendor.contact_person} />}
              {vendor.phone && <InfoRow icon={Phone} label="Phone" value={vendor.phone} />}
              {vendor.email && <InfoRow icon={Mail} label="Email" value={vendor.email} />}
              {vendor.address && <InfoRow icon={MapPin} label="Address" value={vendor.address} />}
              {vendor.notes && (
                <div className="rounded-xl bg-muted/40 p-4 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  {vendor.notes}
                </div>
              )}
              <Badge variant={vendor.is_active ? "success" : "outline"}>
                {vendor.is_active ? "Active" : "Inactive"}
              </Badge>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-32"
                />
                <Input
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={recordPayment} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              <Separator />

              {paymentsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (paymentsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {paymentsQuery.data!.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                        {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(p.paid_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
