"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Star, Pin, Trash2, Send } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDetail } from "@/hooks/use-customer-detail";
import {
  updateCustomerAction,
  addCustomerNoteAction,
  deleteCustomerNoteAction,
  togglePinCustomerNoteAction,
} from "@/actions/customer-actions";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gold/15 text-gold-dark">
                  {getInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{customer.full_name}</SheetTitle>
                <SheetDescription>
                  Customer since {formatDate(customer.created_at)}
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              disabled={isPending}
              aria-label="Toggle favorite"
            >
              <Star className={isFavorite ? "h-5 w-5 fill-gold text-gold" : "h-5 w-5 text-muted-foreground"} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">Total Bookings</p>
              <p className="font-display text-lg">{customer.bookingsCount}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">Total Spent</p>
              <p className="font-display text-lg">{formatCurrency(customer.totalSpent)}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="grid grid-cols-1 gap-3">
                <InfoRow icon={Phone} label="Phone" value={customer.phone} />
                <InfoRow icon={Mail} label="Email" value={customer.email ?? "—"} />
                <InfoRow icon={MapPin} label="Address" value={customer.address ?? "—"} />
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Budget Range
                </p>
                <p className="text-sm">
                  {customer.budget_range_min || customer.budget_range_max
                    ? `${formatCurrency(customer.budget_range_min)} — ${formatCurrency(customer.budget_range_max)}`
                    : "Not set"}
                </p>
              </div>

              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.favorite_decorations && customer.favorite_decorations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Favorite Decorations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.favorite_decorations.map((d) => (
                      <Badge key={d} variant="luxury">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings">
              {bookingsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No bookings from this customer yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-border p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{b.event_type}</p>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(b.event_date)} · {b.booking_code} · {formatCurrency(b.budget)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No payments recorded for this customer yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {p.method} · {formatDate(p.paid_at)}
                        </p>
                      </div>
                      {p.is_advance && <Badge variant="warning">Advance</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add an internal note about this customer..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="luxury" onClick={submitNote} disabled={isPending || !noteDraft.trim()}>
                    <Send className="h-3.5 w-3.5" /> Add Note
                  </Button>
                </div>
              </div>

              <Separator />

              {notesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-xl border border-border p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{n.note}</p>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => togglePin(n.id, n.is_pinned)}
                            className={n.is_pinned ? "text-gold" : "text-muted-foreground hover:text-foreground"}
                            aria-label="Pin note"
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeNote(n.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">{formatDate(n.created_at)}</p>
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

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
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
