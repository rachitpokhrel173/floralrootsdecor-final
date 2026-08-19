"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { realEvents } from "@/lib/site-data";
import { MapPin } from "lucide-react";
import clsx from "clsx";

const ease = [0.22, 1, 0.36, 1] as const;

export default function RealEvents() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(realEvents.map((e) => e.type)))],
    []
  );
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? realEvents : realEvents.filter((e) => e.type === filter);

  return (
    <section className="bg-sand py-24 md:py-32">
      <Container>
        <div className="mb-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Eyebrow>Our Portfolio</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
              Moments <span className="italic text-emerald">we&rsquo;ve created.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-300",
                  filter === c
                    ? "border-forest bg-forest text-cream"
                    : "border-line bg-transparent text-muted hover:border-forest/40"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {filtered.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={ev.image}
                alt={`${ev.name} — ${ev.type} in ${ev.location}`}
                fill
                className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-110"
                sizes="(min-width: 768px) 30vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-peach">{ev.type}</p>
                <p className="font-display text-base text-cream md:text-lg">{ev.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-cream/70">
                  <MapPin className="h-3 w-3" /> {ev.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
