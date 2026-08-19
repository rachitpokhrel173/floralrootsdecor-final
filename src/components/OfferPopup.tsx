"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { routes } from "@/lib/site-data";

const SESSION_KEY = "fr-offer-popup-dismissed";
const SHOW_DELAY_MS = 2500;

export default function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-forest-deep/60 p-5 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-md grid-cols-1 overflow-hidden rounded-[1.75rem] bg-forest text-cream shadow-2xl sm:max-w-3xl sm:grid-cols-2"
          >
            <button
              aria-label="Close offer"
              onClick={close}
              className="absolute right-4 top-4 z-10 rounded-full bg-forest-deep/60 p-2 text-cream/80 backdrop-blur-sm transition-colors hover:bg-forest-deep hover:text-cream"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative hidden aspect-[4/5] sm:block">
              <Image
                src="/images/stage/stage-13.jpg"
                alt="Gold wedding decoration package by Floral Roots & Decor"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 320px, 0px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-7 py-9 sm:px-9 sm:py-10">
              <span className="eyebrow eyebrow--light">Booking Open — Mangsir</span>
              <h3 className="mt-4 font-display text-3xl font-light leading-[1.08] sm:text-[2.1rem]">
                Wedding decoration{" "}
                <span className="italic text-peach">packages, starting Rs. 55,000.</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/75">
                Mandap, stage backdrop, gate and welcome board included from our Silver package —
                Gold and Diamond add fire works, barmala, chadar and more.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={routes.packages}
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-full bg-peach px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-forest transition-colors hover:bg-cream"
                >
                  View Packages
                </Link>
                <Link
                  href={routes.book}
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:border-cream"
                >
                  Book Your Event
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
