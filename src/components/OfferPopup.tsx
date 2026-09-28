"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { routes } from "@/lib/site-data";

const SESSION_KEY = "fr-offer-popup-dismissed";
// Show once the visitor has scrolled through half the page (they've seen the
// work first), or on desktop exit intent — never straight on landing.
const SCROLL_TRIGGER = 0.5;

function wasDismissed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export default function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;

    const show = () => {
      setOpen(true);
      cleanup();
    };
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_TRIGGER) show();
    };
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    return cleanup;
  }, []);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage unavailable (private mode) — the popup may show again next visit.
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[70] bg-forest-deep/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-[71] grid w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 grid-cols-1 overflow-hidden rounded-[1.75rem] bg-forest text-cream shadow-2xl outline-none sm:max-w-3xl sm:grid-cols-2"
              >
                <Dialog.Close
                  aria-label="Close offer"
                  className="absolute right-4 top-4 z-10 rounded-full bg-forest-deep/60 p-2 text-cream/80 backdrop-blur-sm transition-colors hover:bg-forest-deep hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>

                <div className="relative hidden aspect-[4/5] sm:block">
                  <Image
                    src="/images/stage/stage-13.jpg"
                    alt="Gold wedding decoration package by Floral Roots & Decor"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 384px, 0px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-transparent to-transparent" />
                </div>

                <div className="flex flex-col justify-center px-7 py-9 sm:px-9 sm:py-10">
                  <span className="eyebrow eyebrow--light">Booking Open — Mangsir</span>
                  <Dialog.Title className="mt-4 font-display text-3xl font-light leading-[1.08] sm:text-[2.1rem]">
                    Wedding decoration{" "}
                    <span className="italic text-peach">packages, starting Rs. 55,000.</span>
                  </Dialog.Title>
                  <Dialog.Description className="mt-4 text-sm leading-relaxed text-cream/75">
                    Mandap, stage backdrop, gate and welcome board included from our Silver package —
                    Gold and Diamond add fire works, barmala, chadar and more.
                  </Dialog.Description>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href={routes.packages}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex items-center justify-center rounded-full bg-peach px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-forest transition-colors hover:bg-cream"
                    >
                      View Packages
                    </Link>
                    <Link
                      href={routes.book}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:border-cream"
                    >
                      Book Your Event
                    </Link>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
