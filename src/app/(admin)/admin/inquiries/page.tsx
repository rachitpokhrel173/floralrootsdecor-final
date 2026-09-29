"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Search, CalendarDays, PartyPopper, Phone, DatabaseZap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInquiries } from "@/hooks/use-inquiries";
import { InquiryStatusBadge, INQUIRY_STATUSES } from "@/components/admin/inquiries/inquiry-status";
import { InquiryDetailDrawer } from "@/components/admin/inquiries/inquiry-detail-drawer";
import { formatDate, getInitials, cn } from "@/lib/utils";
import type { InquiryStatus } from "@/types/database.types";

type Filter = InquiryStatus | "all";

export default function InquiriesPage() {
  const { inquiries, setupRequired, isLoading, refetch } = useInquiries();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  // Store the id so the open drawer reflects live updates
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => inquiries?.find((i) => i.id === selectedId) ?? null,
    [inquiries, selectedId]
  );

  // Open straight to an inquiry when arriving from a notification (?id=...)
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("id");
    if (id) setSelectedId(id);
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, new: 0, contacted: 0, converted: 0, closed: 0 };
    for (const i of inquiries ?? []) {
      c.all++;
      c[i.status]++;
    }
    return c;
  }, [inquiries]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (inquiries ?? []).filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (!term) return true;
      return (
        i.full_name.toLowerCase().includes(term) ||
        i.phone.includes(term) ||
        (i.email ?? "").toLowerCase().includes(term) ||
        (i.event_type ?? "").toLowerCase().includes(term) ||
        (i.message ?? "").toLowerCase().includes(term)
      );
    });
  }, [inquiries, filter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every message sent through the website contact form lands here.
          {counts.new > 0 && (
            <span className="font-medium text-gold-dark">
              {" "}
              {counts.new} waiting for a reply.
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          {([{ value: "all", label: "All" }, ...INQUIRY_STATUSES] as { value: Filter; label: string }[]).map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === f.value
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px]",
                  filter === f.value ? "bg-gold/20" : "bg-muted"
                )}
              >
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, message…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {setupRequired ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-400/60 bg-amber-500/5 px-6 py-14 text-center">
          <DatabaseZap className="h-8 w-8 text-amber-600" />
          <p className="font-medium">One-time database setup needed</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs">supabase/migrations/0014_inquiries.sql</code>{" "}
            in the Supabase SQL editor, then refresh this page. Until then, new messages still arrive in
            Notifications.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {counts.all === 0
              ? "No inquiries yet — messages from the website contact form will show up here."
              : "No inquiries match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setSelectedId(i.id)}
              className={cn(
                "group relative flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-gold/40 hover:bg-accent/30",
                i.status === "new" ? "border-gold/40" : "border-border"
              )}
            >
              {i.status === "new" && (
                <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gold" />
              )}
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-gold/15 text-xs text-gold-dark">
                  {getInitials(i.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("truncate text-sm", i.status === "new" ? "font-semibold" : "font-medium")}>
                    {i.full_name}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {i.phone}
                  </span>
                  {i.event_type && (
                    <span className="inline-flex items-center gap-1">
                      <PartyPopper className="h-3 w-3" /> {i.event_type}
                    </span>
                  )}
                  {i.event_date && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {formatDate(i.event_date)}
                    </span>
                  )}
                </div>
                {i.message && (
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{i.message}</p>
                )}
              </div>
              <div className="shrink-0 self-center">
                <InquiryStatusBadge status={i.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      <InquiryDetailDrawer
        inquiry={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        onChanged={() => refetch()}
      />
    </div>
  );
}
