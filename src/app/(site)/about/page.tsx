import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import PageHero from "@/components/PageHero";
import WhyUs from "@/components/WhyUs";
import BookingCTA from "@/components/BookingCTA";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Floral Roots & Decor is a premium event decoration studio based in Banepa, Nepal — rooted in quality, flourishing in beauty.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Our Story"
          title="Rooted in quality,"
          accent="flourishing in beauty."
          description="Floral Roots & Decor is a Banepa-based event decoration studio designing weddings, celebrations and corporate events across Nepal."
        />

        {/* Intro / mission */}
        <section className="bg-cream py-20 md:py-28">
          <Container>
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <Eyebrow>What We Believe</Eyebrow>
                <h2 className="mt-5 font-display text-3xl font-light leading-[1.15] text-ink sm:text-4xl">
                  Every event tells a story —{" "}
                  <span className="italic text-emerald">we design the setting for it.</span>
                </h2>
                <p className="mt-6 text-[1.02rem] leading-relaxed text-muted">
                  From an intimate Bratabandha to a full wedding production, we treat every booking
                  with the same care: understanding the people at the center of the celebration, and
                  building a design around them rather than reaching for a template.
                </p>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
                  Our team handles the full arc of decoration — mandap and stage design, fresh
                  florals, lighting, draping and on-site execution — so the day runs the way it was
                  imagined.
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:col-span-6">
                <Image
                  src="/images/mandap/mandap-01.jpg"
                  alt="Mandap decoration by Floral Roots & Decor"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 90vw"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Values, reusing WhyUs */}
        <WhyUs />

        {/* Approach */}
        <section className="bg-cream py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Our Approach</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-light leading-[1.15] text-ink sm:text-4xl">
                From first conversation to{" "}
                <span className="italic text-emerald">final walkthrough.</span>
              </h2>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-muted">
                We start by listening — your venue, your rituals, your guest count, the feeling you
                want people to walk into. From there we shape a design, refine it with you, and
                handle the full setup and execution so you can actually enjoy the day.
              </p>
            </div>
          </Container>
        </section>

        <BookingCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
