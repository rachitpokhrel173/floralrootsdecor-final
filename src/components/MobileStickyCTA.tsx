"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { routes } from "@/lib/site-data";

export default function MobileStickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-5 py-3.5 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href={routes.book}
            className="flex w-full items-center justify-center rounded-full bg-forest py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-emerald"
          >
            Book Your Event
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
