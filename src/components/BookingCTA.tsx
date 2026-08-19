"use client";

import { motion } from "framer-motion";
import { Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "./ui";
import { routes } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function BookingCTA() {
  return (
    <section className="relative overflow-hidden bg-forest py-28 text-cream md:py-36">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #0FA958 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #E8B4A0 0%, transparent 70%)" }}
      />

      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <Eyebrow light>Let&rsquo;s Begin</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-light leading-[1.08] sm:text-5xl md:text-6xl">
            Ready to create{" "}
            <span className="italic text-peach">your event?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-cream/75">
            Tell us about your celebration and we&rsquo;ll help you create the perfect setup —
            from first concept to final flower.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonPrimary href={routes.book} className="bg-peach text-forest hover:bg-cream hover:shadow-[0_8px_30px_rgba(232,180,160,0.4)]">
              Book Your Event
            </ButtonPrimary>
            <ButtonSecondary href={routes.quote} dark>
              Get a Quote
            </ButtonSecondary>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
