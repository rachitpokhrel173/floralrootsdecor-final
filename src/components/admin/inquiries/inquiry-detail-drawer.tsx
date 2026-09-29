"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  CalendarDays,
  PartyPopper,
  MessageSquareQuote,
  Trash2,
  Save,
  Loader2,
  Clock,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DrawerShell,
  DrawerHero,
  DrawerBody,
  DrawerFooter,
  DrawerSection,
  InfoCard,
  InfoItem,
  QuickContact,
} from "@/components/admin/shared/detail-drawer";
import { InquiryStatusBadge, INQUIRY_STATUSES } from "./inquiry-status";
import { updateInquiryAction, deleteInquiryAction } from "@/actions/inquiry-actions";
import { formatDate, cn } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types/database.types";

function receivedAt(iso: string) {
  const d = new Date(iso);
  return `${formatDate(d)} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function InquiryDetailDrawer({
  inquiry,
  open,
  onOpenChange,
  onChanged,
}: {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  // Reset the notes editor whenever a different inquiry is opened
  useEffect(() => {
    setNotes(inquiry?.notes ?? "");
  }, [inquiry?.id, inquiry?.notes]);

  if (!inquiry) return null;

  const notesDirty = (inquiry.notes ?? "") !== notes;

  function setStatus(status: InquiryStatus) {
    if (!inquiry || status === inquiry.status) return;
    startTransition(async () => {
      const res = await updateInquiryAction(inquiry.id, { status });
      if (res.success) {
        toast.success(`Marked as ${INQUIRY_STATUSES.find((s) => s.value === status)?.label.toLowerCase()}`);
        onChanged();
      } else {
        toast.error(res.error ?? "Couldn't update inquiry");
      }
    });
  }

  function saveNotes() {
    if (!inquiry) return;
    startTransition(async () => {
      const res = await updateInquiryAction(inquiry.id, { notes: notes.trim() || null });
      if (res.success) {
        toast.success("Notes saved");
        onChanged();
      } else {
        toast.error(res.error ?? "Couldn't save notes");
      }
    });
  }

  function remove() {
    if (!inquiry) return;
    if (!confirm(`Delete the inquiry from ${inquiry.full_name}? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteInquiryAction(inquiry.id);
      if (res.success) {
        toast.success("Inquiry deleted");
        onOpenChange(false);
        onChanged();
      } else {
        toast.error(res.error ?? "Couldn't delete inquiry");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DrawerShell>
        <DrawerHero
          name={inquiry.full_name}
          eyebrow="Website inquiry"
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {receivedAt(inquiry.created_at)}
            </span>
          }
          badges={<InquiryStatusBadge status={inquiry.status} />}
        >
          <QuickContact phone={inquiry.phone} email={inquiry.email} />
        </DrawerHero>

        <DrawerBody className="space-y-6">
          <DrawerSection title="Status">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INQUIRY_STATUSES.map((s) => {
                const active = inquiry.status === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-60",
                      active
                        ? "border-gold bg-gold/10 text-gold-dark"
                        : "border-border bg-card hover:border-gold/40 hover:bg-accent/40"
                    )}
                  >
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.hint}</p>
                  </button>
                );
              })}
            </div>
          </DrawerSection>

          {inquiry.message && (
            <DrawerSection title="Their message">
              <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
              </div>
            </DrawerSection>
          )}

          <DrawerSection title="Details">
            <InfoCard>
              <InfoItem
                icon={Phone}
                label="Phone"
                value={inquiry.phone}
                href={`tel:${inquiry.phone}`}
                copyable={inquiry.phone}
              />
              <InfoItem
                icon={Mail}
                label="Email"
                value={inquiry.email}
                href={inquiry.email ? `mailto:${inquiry.email}` : undefined}
                copyable={inquiry.email}
              />
              <InfoItem icon={PartyPopper} label="Event type" value={inquiry.event_type} />
              <InfoItem
                icon={CalendarDays}
                label="Event date"
                value={inquiry.event_date ? formatDate(inquiry.event_date, { weekday: "long" }) : null}
              />
            </InfoCard>
          </DrawerSection>

          <DrawerSection title="Internal notes">
            <div className="rounded-2xl border border-border bg-card p-3 transition-colors focus-within:border-gold/50">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Call outcome, quoted price, follow-up date…"
                className="min-h-[90px] resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
              />
              <div className="flex justify-end pt-2">
                <Button size="sm" variant="luxury" onClick={saveNotes} disabled={isPending || !notesDirty}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save notes
                </Button>
              </div>
            </div>
          </DrawerSection>
        </DrawerBody>

        <DrawerFooter>
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-500/10 hover:text-red-600"
            onClick={remove}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" /> Delete inquiry
          </Button>
        </DrawerFooter>
      </DrawerShell>
    </Sheet>
  );
}
