"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { packages, routes } from "@/lib/site-data";
import { ArrowUpRight, Check } from "lucide-react";
import clsx from "clsx";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Packages() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <Container>
        <div className="mb-14 max-w-xl">
          <Eyebrow>Choose Your Experience</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
            Packages for every{" "}
            <span className="italic text-emerald">kind of occasion.</span>
          </h2>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
            Starting prices shown as a guide — every package is refined around your venue, guest
            count and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((p, i) => (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className={clsx(
                "group flex flex-col overflow-hidden rounded-[1.5rem] border transition-all duration-500",
                p.featured
                  ? "border-emerald bg-forest text-cream shadow-[0_20px_50px_rgba(21,60,34,0.25)]"
                  : "border-line bg-white text-ink hover:border-emerald/40 hover:shadow-[0_16px_40px_rgba(22,36,26,0.08)]"
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={p.image}
                  alt={`${p.tier} package`}
                  fill
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 90vw"
                />
                {p.featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-peach px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest">
                    Most Booked
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-2xl italic">{p.tier}</h3>
                <p className={clsx("mt-1.5 text-xs leading-relaxed", p.featured ? "text-cream/70" : "text-muted")}>
                  {p.suitedFor}
                </p>

                <p className={clsx("mt-5 font-display text-xl", p.featured ? "text-peach" : "text-emerald")}>
                  {p.startingPrice}
                  {p.startingPrice !== "On request" && (
                    <span className={clsx("ml-1 font-body text-[0.65rem] font-medium", p.featured ? "text-cream/50" : "text-muted")}>
                      starting
                    </span>
                  )}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-[0.85rem] leading-snug">
                      <Check className={clsx("mt-0.5 h-3.5 w-3.5 shrink-0", p.featured ? "text-peach" : "text-emerald")} />
                      <span className={p.featured ? "text-cream/85" : "text-ink/80"}>{inc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-center justify-between border-t pt-5 text-[0.72rem] font-semibold uppercase tracking-[0.1em]" style={{ borderColor: p.featured ? "rgba(251,246,236,0.15)" : "#E4DCC8" }}>
                  <Link href={`${routes.packages}?tier=${p.tier.toLowerCase()}`} className="hover:opacity-70">
                    View Package
                  </Link>
                  <Link
                    href={`${routes.book}?package=${p.tier.toLowerCase()}`}
                    className={clsx("inline-flex items-center gap-1", p.featured ? "text-peach" : "text-emerald")}
                  >
                    Book <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
