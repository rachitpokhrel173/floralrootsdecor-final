"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container, Eyebrow, ButtonSecondary } from "./ui";
import { routes } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function BrandIntro() {
  return (
    <section className="relative bg-cream py-24 md:py-36">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
            className="relative lg:col-span-5"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/images/entrance-real/entrance-real-08.jpg"
                alt="Floral Roots & Decor arch backdrop styling detail"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
            <div className="absolute -bottom-8 -right-6 hidden w-44 rounded-2xl bg-forest px-6 py-5 text-cream shadow-xl sm:block">
              <p className="font-display text-2xl italic">Est. 2024</p>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/70">
                Banepa, Nepal
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="lg:col-span-7 lg:pl-8"
          >
            <Eyebrow>Who We Are</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-5xl md:text-[3.4rem]">
              Every celebration deserves{" "}
              <span className="italic text-emerald">its own beautiful setting.</span>
            </h2>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              Floral Roots &amp; Decor is an event decoration studio built around one idea:
              your celebration should look and feel like nothing else. We shape thoughtful
              environments through floral design, styling and full-scale execution — for
              weddings, engagements, birthdays, corporate events and the traditions that matter
              to you.
            </p>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              From the first sketch to the final flower placed on site, every detail is
              considered, sourced and crafted by hand — rooted in quality, flourishing in
              beauty.
            </p>
            <div className="mt-10">
              <ButtonSecondary href={routes.about}>Our Story</ButtonSecondary>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
