"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eyebrow, ButtonPrimary } from "./ui";
import { routes } from "@/lib/site-data";

export default function FeaturedDesign() {
  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-forest">
      <motion.div
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image
          src="/images/stage/stage-05.jpg"
          alt="Signature Wedding setup by Floral Roots & Decor"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 md:px-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg"
        >
          <Eyebrow light>Featured Design</Eyebrow>
          <h3 className="mt-5 font-display text-5xl italic text-cream md:text-6xl">
            Signature Wedding
          </h3>
          <p className="mt-5 text-base leading-relaxed text-cream/80">
            A full-venue transformation built on ivory drapery, brass detail and layered
            florals — one of our most requested design languages for grand celebrations.
          </p>
          <div className="mt-8">
            <ButtonPrimary href={`${routes.designs}?item=1`}>Explore This Setup</ButtonPrimary>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
