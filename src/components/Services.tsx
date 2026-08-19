"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { services } from "@/lib/site-data";

export default function Services() {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <section className="bg-sand py-24 md:py-32">
      <Container>
        <div className="mb-14 max-w-xl">
          <Eyebrow>What We Do</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
            Services built for the{" "}
            <span className="italic text-emerald">full celebration.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {services.map((s, i) => (
              <button
                key={s.index}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`flex w-full items-center gap-6 border-b py-6 text-left transition-colors duration-300 md:py-7 ${
                  i === 0 ? "border-t" : ""
                } ${active === i ? "border-forest/30" : "border-line"}`}
              >
                <span
                  className={`num-marker text-lg transition-colors duration-300 ${
                    active === i ? "text-emerald" : "text-muted/50"
                  }`}
                >
                  {s.index}
                </span>
                <span
                  className={`flex-1 font-display text-2xl transition-colors duration-300 sm:text-3xl md:text-4xl ${
                    active === i ? "text-ink" : "text-muted/60"
                  }`}
                >
                  {s.name}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.index}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={current.image} alt={current.name} fill className="object-cover" sizes="(min-width: 1024px) 35vw, 90vw" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/80 to-transparent p-7">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.index + "-d"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-sm leading-relaxed text-cream/90"
                  >
                    {current.description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
