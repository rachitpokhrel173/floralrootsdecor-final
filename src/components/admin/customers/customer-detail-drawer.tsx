"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Pin,
  Trash2,
  Send,
  CalendarHeart,
  CalendarDays,
  Wallet,
  Wallet2,
  StickyNote,
  ChevronRight,
  Tag,
  Sparkles,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { PaymentMethodBadge } from "@/components/admin/payments/payment-method-badge";
import { useCustomerDetail } from "@/hooks/use-customer-detail";
import {
  updateCustomerAction,
  addCustomerNoteAction,
  deleteCustomerNoteAction,
  togglePinCustomerNoteAction,
} from "@/actions/customer-actions";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/admin/bookings/booking-badges";
import type { CustomerWithStats } from "@/lib/data/customers";

export function CustomerDetailDrawer({
  customer,
  open,
  onOpenChange,
}: {
  customer: CustomerWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { bookings, bookingsLoading, payments, paymentsLoading, notes, notesLoading, refetchNotes } =
    useCustomerDetail(customer?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [noteDraft, setNoteDraft] = useState("");
  const [isFavorite, setIsFavorite] = useState(customer?.is_favorite ?? false);

  if (!customer) return null;

  function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      const res = await updateCustomerAction(customer!.id, { is_favorite: next });
      if (!res.success) {
        setIsFavorite(!next);
        toast.error(res.error ?? "Failed to update");
      }
    });
  }

  function submitNote() {
    const note = noteDraft.trim();
    if (!note) return;
    startTransition(async () => {
      const res = await addCustomerNoteAction(customer!.id, note);
      if (res.success) {
        setNoteDraft("");
        refetchNotes();
        toast.success("Note added");
      } else {
        toast.error(res.error ?? "Failed to add note");
      }
    });
  }

  function togglePin(noteId: string, current: boolean) {
    startTransition(async () => {
      const res = await togglePinCustomerNoteAction(noteId, !current);
      if (res.success) refetchNotes();
      else toast.error(res.error ?? "Failed to update note");
    });
  }

  function removeNote(noteId: string) {
    startTransition(async () => {
      const res = await deleteCustomerNoteAction(noteId);
      if (res.success) {
        refetchNotes();
        toast.success("Note deleted");
      } else {
        toast.error(res.error ?? "Failed to delete note");
      }
    });
  }

  const sortedNotes = [...notes].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DrawerShell>
        <DrawerHero
          name={customer.full_name}
          eyebrow="Customer"
          subtitle={`Customer since ${formatDate(customer.created_at)}`}
          actions={
            <HeroIconButton
              label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={toggleFavorite}
              disabled={isPending}
            >
              <Star className={cn("h-[18px] w-[18px]", isFavorite && "fill-gold text-gold")} />
            </HeroIconButton>
          }
          badges={
            isFavorite ? (
              <Badge variant="luxury" className="gap-1">
                <Star className="h-3 w-3 fill-current" /> Favorite
              </Badge>
            ) : undefined
          }
        >
          <QuickContact phone={customer.phone} email={customer.email} />
          <StatTiles
            items={[
              { label: "Bookings", value: customer.bookingsCount, icon: CalendarHeart, tone: "gold" },
              { label: "Total spent", value: formatCurrency(customer.totalSpent), icon: Wallet, tone: "emerald" },
              { label: "Notes", value: notesLoading ? "…" : notes.length, icon: StickyNote },
            ]}
          />
        </DrawerHero>

        <DrawerBody>
          <Tabs defaultValue="overview">
            <TabsList className={cn(drawerTabsListClass, "grid-cols-4")}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5 space-y-6">
              <DrawerSection title="Contact">
                <InfoCard>
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={customer.phone}
                    href={`tel:${customer.phone}`}
                    copyable={customer.phone}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={customer.email}
                    href={customer.email ? `mailto:${customer.email}` : undefined}
                    copyable={customer.email}
                  />
                  <InfoItem icon={MapPin} label="Address" value={customer.address} />
                </InfoCard>
              </DrawerSection>

              <DrawerSection title="Preferences">
                <InfoCard>
                  <InfoItem
                    icon={Wallet2}
                    label="Budget range"
                    value={
                      customer.budget_range_min || customer.budget_range_max
                        ? `${formatCurrency(customer.budget_range_min)} — ${formatCurrency(customer.budget_range_max)}`
                        : null
                    }
                  />
                  <InfoItem
                    icon={Tag}
                    label="Tags"
                    value={
                      customer.tags && customer.tags.length > 0 ? (
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {customer.tags.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </span>
                      ) : null
                    }
                  />
                  <InfoItem
                    icon={Sparkles}
                    label="Favorite decorations"
                    value={
                      customer.favorite_decorations && customer.favorite_decorations.length > 0 ? (
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {customer.favorite_decorations.map((d) => (
                            <Badge key={d} variant="luxury">
                              {d}
                            </Badge>
                          ))}
                        </span>
                      ) : null
                    }
                  />
                </InfoCard>
              </DrawerSection>
            </TabsContent>

            <TabsContent value="bookings" className="mt-5">
              {bookingsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <DrawerEmpty icon={CalendarDays} text="No bookings from this customer yet." />
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => {
                    const d = new Date(`${b.event_date}T00:00:00`);
                    return (
                      <Link
                        key={b.id}
                        href={`/admin/bookings?id=${b.id}`}
                        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-gold/40 hover:bg-accent/40"
                      >
                        <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-gold/10 py-1.5 text-gold-dark">
                          <span className="text-[10px] font-medium uppercase">
                            {d.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="font-display text-lg leading-none">{d.getDate()}</span>
                          <span className="text-[9px] opacity-70">{d.getFullYear()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{b.event_type}</p>
                            <BookingStatusBadge status={b.status} />
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            <span className="font-mono">{b.booking_code}</span> · Budget{" "}
                            {formatCurrency(b.budget)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-5">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <DrawerEmpty icon={Wallet} text="No payments recorded for this customer yet." />
              ) : (
                <InfoCard>
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-3.5 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                        <Wallet className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(p.paid_at)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <PaymentMethodBadge method={p.method} />
                        {p.is_advance && <Badge variant="warning">Advance</Badge>}
                      </div>
                    </div>
                  ))}
                </InfoCard>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-3 transition-colors focus-within:border-gold/50">
                <Textarea
                  placeholder="Add an internal note about this customer…"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote();
                  }}
                  className="min-h-[80px] resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">Ctrl + Enter to save</span>
                  <Button
                    size="sm"
                    variant="luxury"
                    onClick={submitNote}
                    disabled={isPending || !noteDraft.trim()}
                    className="ml-auto"
                  >
                    <Send className="h-3.5 w-3.5" /> Add Note
                  </Button>
                </div>
              </div>

              {notesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <DrawerEmpty icon={StickyNote} text="No notes yet — jot down preferences, calls or reminders." />
              ) : (
                <div className="space-y-2">
                  {sortedNotes.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "rounded-2xl border p-3.5",
                        n.is_pinned ? "border-gold/40 bg-gold/5" : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex-1 whitespace-pre-wrap text-sm">{n.note}</p>
                        <div className="-mr-1 -mt-1 flex shrink-0">
                          <button
                            onClick={() => togglePin(n.id, n.is_pinned)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent",
                              n.is_pinned ? "text-gold" : "text-muted-foreground"
                            )}
                            aria-label={n.is_pinned ? "Unpin note" : "Pin note"}
                          >
                            <Pin className={cn("h-3.5 w-3.5", n.is_pinned && "fill-current")} />
                          </button>
                          <button
                            onClick={() => removeNote(n.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {n.is_pinned && <span className="font-medium text-gold-dark">Pinned · </span>}
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DrawerBody>
      </DrawerShell>
    </Sheet>
  );
}
