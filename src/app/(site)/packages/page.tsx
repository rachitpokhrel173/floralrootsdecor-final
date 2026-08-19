import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import PageHero from "@/components/PageHero";
import Packages from "@/components/Packages";
import HowItWorks from "@/components/HowItWorks";
import BookingCTA from "@/components/BookingCTA";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Wedding decoration packages from Floral Roots & Decor — Silver, Gold and Diamond tiers for every kind of celebration in Nepal.",
};

export default function PackagesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Pricing"
          title="Packages for every"
          accent="kind of occasion."
          description="Starting prices shown as a guide — every package is refined around your venue, guest count and vision. Final quotes are confirmed after a short consultation."
        />
        <Packages />

        <section className="bg-sand py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-light text-ink sm:text-3xl">
                How pricing works
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Starting prices reflect a baseline setup for that tier. Your final quote depends on
                venue size, guest count, floral volume and any custom requests — we&apos;ll walk you
                through the breakdown before you confirm anything.
              </p>
            </div>
          </Container>
        </section>

        <HowItWorks />
        <BookingCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
