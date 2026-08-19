"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import clsx from "clsx";
import { Container, Eyebrow } from "@/components/ui";
import { designCategories, type DesignCategory } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function DesignsClient() {
  const [activeSlug, setActiveSlug] = useState<string>(designCategories[0].slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const active = designCategories.find((c) => c.slug === activeSlug) as DesignCategory;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % active.photos.length));
  const prev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + active.photos.length) % active.photos.length));

  return (
    <section className="bg-cream py-16 md:py-24">
      <Container>
        {/* Category selector */}
        <div className="mb-4">
          <Eyebrow>Browse By Category</Eyebrow>
        </div>
        <div className="flex flex-wrap gap-3 border-b border-line pb-10">
          {designCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveSlug(cat.slug)}
              className={clsx(
                "rounded-full border px-5 py-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] transition-all duration-300",
                activeSlug === cat.slug
                  ? "border-forest bg-forest text-cream"
                  : "border-line text-ink/70 hover:border-emerald/50 hover:text-emerald"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active category header */}
        <motion.div
          key={active.slug + "-header"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-light text-ink sm:text-4xl">
              {active.label}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{active.description}</p>
          </div>
          {!active.isReal && (
            <span className="rounded-full bg-sand px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">
              Placeholder art — real photos coming soon
            </span>
          )}
          {active.isReal && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-emerald">
              <Camera className="h-3 w-3" /> Real photography
            </span>
          )}
        </motion.div>

        {/* Photo grid */}
        <motion.div
          key={active.slug + "-grid"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
          className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          {active.photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(i)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-sand"
            >
              <Image
                src={photo.image}
                alt={photo.alt}
                fill
                className={clsx(
                  "transition-transform duration-700 ease-editorial group-hover:scale-105",
                  active.isReal ? "object-cover" : "object-contain p-6"
                )}
                sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 46vw"
              />
              <div className="absolute inset-0 bg-forest-deep/0 transition-colors duration-300 group-hover:bg-forest-deep/15" />
            </button>
          ))}
        </motion.div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-deep/95 p-4 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              aria-label="Close"
              onClick={closeLightbox}
              className="absolute right-5 top-5 rounded-full border border-cream/25 p-2.5 text-cream transition-colors hover:border-cream"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-cream/25 p-2.5 text-cream transition-colors hover:border-cream md:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease }}
              className="relative h-[80vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.photos[lightboxIndex].image}
                alt={active.photos[lightboxIndex].alt}
                fill
                className={active.isReal ? "object-contain" : "object-contain p-10"}
                sizes="90vw"
                priority
              />
            </motion.div>

            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-cream/25 p-2.5 text-cream transition-colors hover:border-cream md:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
