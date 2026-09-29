"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, CalendarRange, FileText, LayoutGrid, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { useNotifications } from "@/hooks/use-notifications";
import { logoutAction } from "@/actions/auth-actions";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { label: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: Table2 },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarRange },
  { label: "Quotes", href: "/admin/quotations", icon: FileText },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [, startLogoutTransition] = useTransition();

  // Close the sheet after navigating to a page from it
  useEffect(() => setMoreOpen(false), [pathname]);

  const moreIsActive = !MOBILE_NAV.some((item) => pathname.startsWith(item.href));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium",
                isActive ? "text-gold" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium",
            moreIsActive ? "text-gold" : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          More
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-[calc(50%-18px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="md:hidden max-h-[85dvh] overflow-y-auto rounded-t-3xl px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <SheetTitle className="font-display text-lg font-normal">All sections</SheetTitle>
          <SheetDescription className="sr-only">Navigate to any part of the admin panel</SheetDescription>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              const showBadge = item.href === "/admin/notifications" && unreadCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-gold/40 bg-gold/10 text-gold-dark"
                      : "border-border bg-card text-foreground active:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate max-w-full">{item.label}</span>
                  {showBadge && (
                    <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => startLogoutTransition(() => logoutAction())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-red-600 active:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
