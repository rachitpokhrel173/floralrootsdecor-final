"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Mail, MessageCircle, Phone, X } from "lucide-react";
import { SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toWhatsAppNumber } from "@/lib/quotation-share";
import { cn, getInitials } from "@/lib/utils";

/*
 * Shared building blocks for the admin detail drawers (booking, customer,
 * staff, vendor) so they all share one layout: a tinted hero header with its
 * own close button, a scrollable body, and consistent cards inside.
 */

/** Right-side sheet laid out as fixed header + scrolling body (+ optional footer). */
export function DrawerShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SheetContent
      side="right"
      hideClose
      // Don't jump focus to the first header button (shows a focus ring on the star/edit icon)
      onOpenAutoFocus={(e) => e.preventDefault()}
      className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-xl", className)}
    >
      {children}
    </SheetContent>
  );
}

export function DrawerHero({
  name,
  avatarUrl,
  avatarIcon,
  eyebrow,
  subtitle,
  actions,
  badges,
  children,
}: {
  name: string;
  avatarUrl?: string | null;
  /** Shown instead of initials (e.g. a category icon for vendors). */
  avatarIcon?: React.ReactNode;
  /** Small label above the name, e.g. a booking code. */
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Icon buttons shown next to the close button. */
  actions?: React.ReactNode;
  badges?: React.ReactNode;
  /** Extra content under the header row (quick contacts, stats…). */
  children?: React.ReactNode;
}) {
  return (
    <div className="relative shrink-0 overflow-hidden border-b border-border bg-gradient-to-br from-gold/20 via-gold/[0.07] to-transparent">
      {/* Soft decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative space-y-4 px-5 pb-5 pt-5 sm:px-6">
        <div className="flex items-start gap-3.5">
          <Avatar className="h-14 w-14 shrink-0 shadow-sm ring-4 ring-background">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-gold/20 font-display text-lg text-gold-dark">
              {avatarIcon ?? getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-0.5">
            {eyebrow && (
              <p className="mb-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <SheetTitle className="font-display text-xl font-normal leading-tight sm:text-2xl">
              {name}
            </SheetTitle>
            <SheetDescription asChild>
              <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
            </SheetDescription>
          </div>

          <div className="-mr-1.5 -mt-1 flex shrink-0 items-center gap-0.5">
            {actions}
            <SheetClose asChild>
              <HeroIconButton label="Close">
                <X className="h-4 w-4" />
              </HeroIconButton>
            </SheetClose>
          </div>
        </div>

        {badges && <div className="flex flex-wrap items-center gap-1.5">{badges}</div>}
        {children}
      </div>
    </div>
  );
}

/** Round icon button styled for the hero header. */
export const HeroIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(({ label, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
HeroIconButton.displayName = "HeroIconButton";

/** Call / WhatsApp / Email shortcuts. Buttons without a value are hidden. */
export function QuickContact({ phone, email }: { phone?: string | null; email?: string | null }) {
  const wa = toWhatsAppNumber(phone);
  if (!phone && !email) return null;

  const base =
    "flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium backdrop-blur transition-colors hover:border-gold/40 hover:bg-background active:bg-gold/10";

  return (
    <div className="flex gap-2">
      {phone && (
        <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className={base}>
          <Phone className="h-3.5 w-3.5 text-gold-dark" /> Call
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={base}>
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={base}>
          <Mail className="h-3.5 w-3.5 text-gold-dark" /> Email
        </a>
      )}
    </div>
  );
}

export interface StatTileItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  tone?: "default" | "gold" | "emerald" | "red";
}

const TONE: Record<NonNullable<StatTileItem["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  gold: "bg-gold/15 text-gold-dark",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function StatTiles({ items }: { items: StatTileItem[] }) {
  return (
    <div className={cn("grid gap-2", items.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
      {items.map(({ label, value, icon: Icon, tone = "default" }) => (
        <div key={label} className="rounded-xl border border-border/60 bg-background/80 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5">
            {Icon && (
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", TONE[tone])}>
                <Icon className="h-3 w-3" />
              </span>
            )}
            <p className="truncate text-[11px] text-muted-foreground">{label}</p>
          </div>
          <p className="mt-1.5 truncate font-display text-base leading-none sm:text-lg">{value}</p>
        </div>
      ))}
    </div>
  );
}

/** Scrollable drawer body. */
export function DrawerBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-5 sm:px-6", className)}>{children}</div>;
}

/** Sticky footer for primary actions. */
export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-background/95 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
      {children}
    </div>
  );
}

export function DrawerSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Card of label/value rows separated by dividers. */
export function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {children}
    </div>
  );
}

export function InfoItem({
  icon: Icon,
  label,
  value,
  href,
  copyable,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  href?: string;
  /** Show a copy button for this plain-text value. */
  copyable?: string | null;
}) {
  const empty = value === null || value === undefined || value === "" || value === "—";

  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className={cn("break-words text-sm font-medium", empty && "font-normal text-muted-foreground/70")}>
          {empty ? "Not added" : value}
        </div>
      </div>
    </>
  );

  return (
    <div className="group flex items-center gap-3 px-3.5 py-3">
      {href && !empty ? (
        <a href={href} className="flex min-w-0 flex-1 items-center gap-3 hover:text-gold-dark">
          {content}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      )}
      {copyable && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(copyable).then(
              () => toast.success(`${label} copied`),
              () => toast.error("Couldn't copy")
            );
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-60 transition hover:bg-accent hover:text-foreground group-hover:opacity-100"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function DrawerEmpty({
  icon: Icon,
  text,
  children,
}: {
  icon: React.ElementType;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border px-4 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}

/** Full-width tab strip used under the hero. */
export const drawerTabsListClass = "grid w-full h-11 rounded-2xl";
