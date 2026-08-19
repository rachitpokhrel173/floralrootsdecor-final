"use client";

import { motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { howItWorks } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HowItWorks() {
  return (
    <section className="bg-sand py-24 md:py-32">
      <Container>
        <div className="mb-16 max-w-xl">
          <Eyebrow>The Process</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl">
            Booking us is{" "}
            <span className="italic text-emerald">simple.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              className="relative"
            >
              <span className="num-marker text-5xl text-emerald/25">{step.step}</span>
              <h3 className="mt-4 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              {i < howItWorks.length - 1 && (
                <div className="mt-6 hidden h-px w-full bg-line lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
