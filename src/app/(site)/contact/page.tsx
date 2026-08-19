import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import PageHero from "@/components/PageHero";
import { Container, Eyebrow } from "@/components/ui";
import { contact } from "@/lib/site-data";
import { Phone, Mail, MapPin } from "lucide-react";
import { Instagram, Facebook } from "@/components/social-icons";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Floral Roots & Decor to plan your wedding, engagement, birthday or corporate event decoration in Nepal.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Get In Touch"
          title="Let's start"
          accent="planning your event."
          description="Send us a message with a few details about your event, or reach out directly — we typically respond within a day."
        />

        <section className="bg-cream py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              <div className="lg:col-span-5">
                <Eyebrow>Reach Us Directly</Eyebrow>
                <ul className="mt-6 space-y-6">
                  {contact.phones.map((phone) => (
                    <li key={phone} className="flex items-start gap-3.5">
                      <span className="rounded-full bg-emerald/10 p-2.5">
                        <Phone className="h-4 w-4 text-emerald" />
                      </span>
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">Phone</p>
                        <a href={`tel:${phone}`} className="text-sm text-ink transition-colors hover:text-emerald">
                          {phone}
                        </a>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-start gap-3.5">
                    <span className="rounded-full bg-emerald/10 p-2.5">
                      <Mail className="h-4 w-4 text-emerald" />
                    </span>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-sm text-ink transition-colors hover:text-emerald">
                        {contact.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="rounded-full bg-emerald/10 p-2.5">
                      <MapPin className="h-4 w-4 text-emerald" />
                    </span>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">Location</p>
                      <p className="text-sm text-ink">{contact.location}</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 flex gap-3">
                  <a
                    href={contact.instagram}
                    aria-label="Instagram"
                    className="rounded-full border border-line p-2.5 text-ink/70 transition-colors hover:border-emerald hover:text-emerald"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href={contact.facebook}
                    aria-label="Facebook"
                    className="rounded-full border border-line p-2.5 text-ink/70 transition-colors hover:border-emerald hover:text-emerald"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
