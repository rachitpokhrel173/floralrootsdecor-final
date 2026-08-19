"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { ourTeam } from "@/lib/site-data";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function OurTeam() {
  const [index, setIndex] = useState(0);
  const member = ourTeam[index];

  const next = () => setIndex((i) => (i + 1) % ourTeam.length);
  const prev = () => setIndex((i) => (i - 1 + ourTeam.length) % ourTeam.length);

  return (
    <section className="bg-cream py-24 md:py-32">
      <Container className="max-w-2xl text-center">
        <Eyebrow>Our Team</Eyebrow>
        <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
          The people behind <span className="italic text-emerald">every setup.</span>
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease }}
            className="mt-12 flex flex-col items-center"
          >
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-emerald/30 bg-forest text-peach sm:h-32 sm:w-32">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <User className="h-11 w-11 sm:h-12 sm:w-12" strokeWidth={1.4} />
              )}
            </div>
            <p className="mt-6 font-display text-2xl italic text-ink sm:text-3xl">{member.name}</p>
            <p className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-emerald">
              {member.role}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button aria-label="Previous team member" onClick={prev} className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-forest">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {ourTeam.map((_, i) => (
              <button key={i} aria-label={`Go to team member ${i + 1}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-emerald" : "w-1.5 bg-line"}`} />
            ))}
          </div>
          <button aria-label="Next team member" onClick={next} className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-forest">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </section>
  );
}