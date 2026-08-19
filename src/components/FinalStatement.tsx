"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FinalStatement() {
  return (
    <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-forest">
      <Image
        src="/images/engagement-real/engagement-real-02.jpg"
        alt="Floral Roots & Decor — your moment, our craft"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-forest-deep/40" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-light leading-[1.05] text-cream sm:text-6xl md:text-7xl"
        >
          Your moment.
          <br />
          <span className="italic text-peach">Our craft.</span>
        </motion.h2>
      </div>
    </section>
  );
}
