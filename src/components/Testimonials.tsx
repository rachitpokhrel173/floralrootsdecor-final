
"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { testimonials } from "@/lib/site-data";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="bg-cream py-24 md:py-32">
      <Container className="max-w-4xl text-center">
        <Eyebrow>Customer Stories</Eyebrow>
        <Quote className="mx-auto mt-6 h-9 w-9 text-peach" />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease }}
            className="mt-6"
          >
            <p className="font-display text-2xl font-light italic leading-relaxed text-ink sm:text-3xl md:text-4xl">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src={t.image} alt={t.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.event}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            aria-label="Previous testimonial"
            onClick={prev}
            className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-forest"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-emerald" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
          <button
            aria-label="Next testimonial"
            onClick={next}
            className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-forest"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </section>
  );
}
