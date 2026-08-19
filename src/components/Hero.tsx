"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "./ui";
import { routes } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-forest">
      <Image
        src="/images/stage/stage-24.jpg"
        alt="Signature event decoration by Floral Roots & Decor"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/70 via-transparent to-transparent" />

      <Container className="relative z-10 pb-24 pt-40 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Eyebrow light>Event Decoration Studio — Nepal</Eyebrow>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="mt-6 max-w-4xl font-display text-[2.8rem] font-light leading-[1.04] text-cream sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          We design the moments{" "}
          <span className="italic font-normal text-peach">you&rsquo;ll never forget.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease }}
          className="mt-7 max-w-lg text-base leading-relaxed text-cream/80 md:text-lg"
        >
          Floral Roots &amp; Decor creates thoughtful decoration and styling for weddings,
          engagements, birthdays and celebrations across Nepal — rooted in quality, flourishing
          in beauty.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.42, ease }}
          className="mt-11 flex flex-wrap items-center gap-4"
        >
          <ButtonPrimary href={routes.book}>Book Your Event</ButtonPrimary>
          <ButtonSecondary href={routes.designs} dark>
            Explore Our Designs
          </ButtonSecondary>
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 right-6 z-10 hidden items-center gap-2 text-cream/70 md:flex md:right-16"
      >
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}
