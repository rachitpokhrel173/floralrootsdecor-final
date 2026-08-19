"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, CalendarRange, KanbanSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { label: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: Table2 },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarRange },
  { label: "Pipeline", href: "/admin/pipeline", icon: KanbanSquare },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur px-1 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      {MOBILE_NAV.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium",
              isActive ? "text-gold" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
