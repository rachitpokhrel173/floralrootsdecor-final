"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { useAdminUiStore } from "@/stores/admin-ui-store";
import { useInquiries } from "@/hooks/use-inquiries";

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminUiStore();
  const { newCount: newInquiries } = useInquiries();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 248 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden md:flex h-screen sticky top-0 flex-col border-r border-border bg-card"
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/logo.png"
            alt="Floral Roots & Decor"
            fill
            sizes="32px"
            className="object-cover"
            priority
          />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display text-base tracking-tight truncate">Floral R&D CRM</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold/10 text-gold-dark"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              {item.href === "/admin/inquiries" && newInquiries > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-semibold text-white",
                    sidebarCollapsed ? "absolute right-1.5 top-1 h-4 min-w-4 px-1" : "ml-auto"
                  )}
                >
                  {newInquiries > 99 ? "99+" : newInquiries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronsLeft
          className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
        />
        {!sidebarCollapsed && "Collapse"}
      </button>
    </motion.aside>
  );
}
