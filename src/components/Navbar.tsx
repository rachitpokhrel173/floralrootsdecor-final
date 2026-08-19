"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container, ButtonPrimary } from "./ui";
import { routes } from "@/lib/site-data";

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: routes.services },
  { label: "Designs", href: routes.designs },
  { label: "Packages", href: routes.packages },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial ${
        scrolled ? "bg-cream/90 backdrop-blur-md shadow-[0_1px_0_rgba(22,36,26,0.06)]" : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between md:h-24">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Floral Roots & Decor"
              width={52}
              height={52}
              className="h-11 w-11 rounded-full md:h-12 md:w-12"
              priority
            />
            <span
              className={`font-display text-lg tracking-tight md:text-xl ${
                scrolled ? "text-forest" : "text-cream"
              }`}
            >
              Floral Roots <span className="italic font-normal">&amp; Decor</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
                  scrolled ? "text-ink/70 hover:text-emerald" : "text-cream/85 hover:text-cream"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <ButtonPrimary href={routes.book}>Book Your Event</ButtonPrimary>
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className={`lg:hidden ${scrolled ? "text-forest" : "text-cream"}`}
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-cream lg:hidden"
          >
            <Container>
              <nav className="flex flex-col gap-1 pb-8 pt-2">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-line py-4 font-display text-2xl text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="pt-6">
                  <ButtonPrimary href={routes.book} className="w-full justify-center">
                    Book Your Event
                  </ButtonPrimary>
                </div>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
