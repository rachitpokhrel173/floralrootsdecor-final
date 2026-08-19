"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { PlusCircle } from "lucide-react";
import { useAdminUiStore } from "@/stores/admin-ui-store";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAdminUiStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  function go(href: string) {
    router.push(href);
    setCommandPaletteOpen(false);
  }

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg px-4">
        <Command className="rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs text-muted-foreground [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => go("/admin/bookings")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm cursor-pointer aria-selected:bg-accent"
              >
                <PlusCircle className="h-4 w-4" /> View all bookings
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigate" className="px-2 py-1.5 text-xs text-muted-foreground mt-1">
              {ADMIN_NAV.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => go(item.href)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm cursor-pointer aria-selected:bg-accent"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
