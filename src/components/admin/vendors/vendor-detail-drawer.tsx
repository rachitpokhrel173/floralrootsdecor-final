"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  Star,
  Plus,
  Pencil,
  UserRound,
  Handshake,
  Wallet,
  FileText,
  StickyNote,
  Receipt,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DrawerShell,
  DrawerHero,
  DrawerBody,
  DrawerSection,
  DrawerEmpty,
  HeroIconButton,
  InfoCard,
  InfoItem,
  QuickContact,
  StatTiles,
  drawerTabsListClass,
} from "@/components/admin/shared/detail-drawer";
import { getVendorPaymentsAction, recordVendorPaymentAction } from "@/actions/vendor-actions";
import { VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
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

  const payments = paymentsQuery.data ?? [];
  const categoryLabel =
    VENDOR_CATEGORY_LABELS[vendor.category as keyof typeof VENDOR_CATEGORY_LABELS] ?? vendor.category;

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
      <DrawerShell>
        <DrawerHero
          name={vendor.name}
          avatarIcon={<Handshake className="h-6 w-6" />}
          eyebrow="Vendor"
          subtitle={categoryLabel}
          actions={
            <HeroIconButton label="Edit vendor" onClick={() => onEdit(vendor)}>
              <Pencil className="h-4 w-4" />
            </HeroIconButton>
          }
          badges={
            <>
              <Badge variant={vendor.is_active ? "success" : "outline"}>
                {vendor.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="luxury">{categoryLabel}</Badge>
            </>
          }
        >
          <QuickContact phone={vendor.phone} email={vendor.email} />
          <StatTiles
            items={[
              { label: "Total paid", value: formatCurrency(vendor.totalPaid), icon: Wallet, tone: "emerald" },
              {
                label: "Rating",
                value: vendor.rating ? `${vendor.rating.toFixed(1)} / 5` : "—",
                icon: Star,
                tone: "gold",
              },
              {
                label: "Payments",
                value: paymentsQuery.isLoading ? "…" : payments.length,
                icon: Receipt,
              },
            ]}
          />
        </DrawerHero>

        <DrawerBody>
          <Tabs defaultValue="info">
            <TabsList className={cn(drawerTabsListClass, "grid-cols-2")}>
              <TabsTrigger value="info">Details</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-5 space-y-6">
              <DrawerSection title="Contact">
                <InfoCard>
                  <InfoItem icon={UserRound} label="Contact person" value={vendor.contact_person} />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={vendor.phone}
                    href={vendor.phone ? `tel:${vendor.phone}` : undefined}
                    copyable={vendor.phone}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={vendor.email}
                    href={vendor.email ? `mailto:${vendor.email}` : undefined}
                    copyable={vendor.email}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Address"
                    value={vendor.address}
                    href={
                      vendor.address
                        ? `https://www.google.com/maps/search/${encodeURIComponent(vendor.address)}`
                        : undefined
                    }
                  />
                  {vendor.contract_url && (
                    <InfoItem icon={FileText} label="Contract" value="Open contract" href={vendor.contract_url} />
                  )}
                </InfoCard>
              </DrawerSection>

              {vendor.notes && (
                <DrawerSection title="Notes">
                  <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                    <p className="whitespace-pre-wrap text-sm">{vendor.notes}</p>
                  </div>
                </DrawerSection>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Added {formatDate(vendor.created_at)}
              </p>
            </TabsContent>

            <TabsContent value="payments" className="mt-5 space-y-5">
              <div className="space-y-2.5 rounded-2xl border border-border bg-card p-3.5">
                <p className="text-sm font-medium">Record a payment</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative sm:w-36">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      Rs.
                    </span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Amount"
                      value={amount || ""}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                  <Input
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && recordPayment()}
                    className="flex-1"
                  />
                </div>
                <Button variant="luxury" className="w-full" onClick={recordPayment} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Record Payment
                </Button>
              </div>

              {paymentsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <DrawerEmpty icon={Wallet} text="No payments recorded yet." />
              ) : (
                <DrawerSection title="History">
                  <InfoCard>
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 px-3.5 py-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                          <Wallet className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{formatCurrency(p.amount)}</p>
                          {p.notes && <p className="truncate text-xs text-muted-foreground">{p.notes}</p>}
                        </div>
                        <p className="shrink-0 text-xs text-muted-foreground">{formatDate(p.paid_at)}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-muted/40 px-3.5 py-3 text-sm">
                      <span className="font-medium">Total paid</span>
                      <span className="font-display text-base">
                        {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                      </span>
                    </div>
                  </InfoCard>
                </DrawerSection>
              )}
            </TabsContent>
          </Tabs>
        </DrawerBody>
      </DrawerShell>
    </Sheet>
  );
}
