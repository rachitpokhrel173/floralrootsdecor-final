"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container, Eyebrow } from "./ui";
import { whyUs } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export default function WhyUs() {
  return (
    <section className="bg-forest py-24 text-cream md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow light>Why Floral Roots</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] sm:text-5xl">
              Because the details{" "}
              <span className="italic text-peach">are the whole point.</span>
            </h2>
            <div className="relative mt-10 hidden aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] lg:block">
              <Image src="/images/82.png" alt="Floral Roots & Decor craft detail" fill className="object-cover" sizes="35vw" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <dl>
              {whyUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  className={`flex flex-col gap-2 border-b border-cream/15 py-7 sm:flex-row sm:items-baseline sm:gap-10 ${
                    i === 0 ? "border-t" : ""
                  }`}
                >
                  <dt className="font-display text-3xl italic text-peach sm:w-56 sm:shrink-0 md:text-4xl">
                    {item.title}
                  </dt>
                  <dd className="max-w-md text-[1.02rem] leading-relaxed text-cream/75">
                    {item.description}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
