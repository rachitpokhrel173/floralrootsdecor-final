"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { eventCategories } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export default function EventTypes() {
  const [active, setActive] = useState(0);
  const current = eventCategories[active];

  return (
    <section className="bg-forest py-24 text-cream md:py-32">
      <Container>
        <div className="mb-14 max-w-xl">
          <Eyebrow light>What We Create</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] sm:text-5xl">
            Designed for every{" "}
            <span className="italic text-peach">kind of celebration.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Image */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.image}
                    alt={current.label}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 45vw, 90vw"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/80 to-transparent p-8">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.slug + "-desc"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-sm text-sm leading-relaxed text-cream/90"
                  >
                    {current.description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <ul className="border-t border-cream/15">
              {eventCategories.map((cat, i) => (
                <li key={cat.slug} className="border-b border-cream/15">
                  <Link
                    href={`${"/designs"}?category=${cat.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center justify-between py-6 md:py-7"
                  >
                    <span
                      className={`font-display text-3xl transition-colors duration-300 sm:text-4xl md:text-[2.6rem] ${
                        active === i ? "text-peach italic" : "text-cream/60 group-hover:text-cream"
                      }`}
                    >
                      {cat.label}
                    </span>
                    <ArrowUpRight
                      className={`h-6 w-6 shrink-0 transition-all duration-300 ${
                        active === i
                          ? "translate-x-0 translate-y-0 opacity-100 text-peach"
                          : "-translate-x-1 translate-y-1 opacity-0 group-hover:opacity-60"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
