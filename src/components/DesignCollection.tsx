"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container, Eyebrow, ButtonSecondary } from "./ui";
import { collectionItems } from "@/lib/site-data";
import { routes } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

const spanClasses: Record<string, string> = {
  tall: "row-span-2",
  wide: "col-span-2",
  square: "",
};

export default function DesignCollection() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Eyebrow>Our Portfolio</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
              The Design <span className="italic text-emerald">Collection.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A curated look at stage, floral, entrance and table designs from real celebrations —
            each one shaped around the people it was made for.
          </p>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
          {collectionItems.map((item, i) => (
            <motion.a
              href={`${routes.designs}?item=${item.id}`}
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease }}
              className={`group relative overflow-hidden rounded-2xl ${spanClasses[item.size]}`}
            >
              <Image
                src={item.image}
                alt={`${item.name} — ${item.type} decoration by Floral Roots & Decor`}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-110"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-400 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 md:p-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-peach">
                  {item.type}
                </p>
                <p className="font-display text-lg text-cream md:text-xl">{item.name}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <ButtonSecondary href={routes.designs}>View All Designs</ButtonSecondary>
        </div>
      </Container>
    </section>
  );
}
