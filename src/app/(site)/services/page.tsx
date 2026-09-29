import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import PageHero from "@/components/PageHero";
import BookingCTA from "@/components/BookingCTA";
import { Container, ButtonPrimary } from "@/components/ui";
import { allServices, contact, routes } from "@/lib/site-data";

const WHATSAPP_NUMBER = contact.phones[0].replace(/[^0-9]/g, "");

function enquireHref(service: string) {
  const message = `Namaste! I would like to know more about your "${service}" service.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const metadata: Metadata = {
  title: "Services",
  description:
    "Every decoration and event service offered by Floral Roots & Decor — from mandap and stage design to full event coordination across Nepal.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="What We Do"
          title="Services built around"
          accent="every celebration."
          description="From a single floral installation to full end-to-end event production — here's everything our team can bring to your event."
        />

        <section className="bg-cream py-20 md:py-28">
          <Container>
            <div className="space-y-16 md:space-y-20">
              {allServices.map((group, gi) => (
                <div key={group.category}>
                  <div className="mb-8 flex items-end gap-4 border-b border-line pb-5">
                    <span className="num-marker font-display text-2xl text-leaf">
                      {String(gi + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-2xl font-light text-ink sm:text-3xl">
                      {group.category}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <div
                        key={item.name}
                        className="group relative flex flex-col rounded-2xl border border-line bg-white/60 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-leaf/40 hover:bg-white hover:shadow-lg"
                      >
                        {"isNew" in item && item.isNew && (
                          <span className="absolute right-4 top-4 rounded-full bg-peach px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-forest">
                            New
                          </span>
                        )}
                        <h3 className="pr-12 font-display text-lg text-ink transition-colors group-hover:text-leaf">
                          {item.name}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>
                        <a
                          href={enquireHref(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-[0.12em] text-leaf transition-colors hover:text-forest"
                        >
                          Ask about this <span aria-hidden>→</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 flex flex-col items-center gap-5 rounded-[1.75rem] bg-forest px-8 py-14 text-center text-cream md:mt-24">
              <h3 className="max-w-lg font-display text-2xl font-light leading-snug sm:text-3xl">
                Don&apos;t see exactly what you need? <span className="italic text-peach">Tell us your vision.</span>
              </h3>
              <p className="max-w-md text-sm text-cream/70">
                Most of what we do is custom — reach out and we&apos;ll shape a service around your event.
              </p>
              <ButtonPrimary href={routes.contact} className="mt-2">
                Get In Touch
              </ButtonPrimary>
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
