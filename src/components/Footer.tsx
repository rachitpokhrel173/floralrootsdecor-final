import Image from "next/image";
import Link from "next/link";
import { Container } from "./ui";
import { routes, contact, builtBy } from "@/lib/site-data";
import { Instagram, Facebook } from "./social-icons";
import { Phone, Mail, MapPin } from "lucide-react";

const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: routes.services },
  { label: "Designs", href: routes.designs },
  { label: "Packages", href: routes.packages },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

const customer = [
  { label: "Book Your Event", href: routes.book },
  { label: "Get a Quote", href: routes.quote },
];

export default function Footer() {
  return (
    <footer className="bg-forest-deep text-cream">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Floral Roots & Decor" width={48} height={48} className="h-12 w-12 rounded-full" />
              <span className="font-display text-lg">
                Floral Roots <span className="italic font-normal">&amp; Decor</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              Rooted in quality, flourishing in beauty — premium event decoration across Nepal.
            </p>
            <div className="mt-6 flex gap-3">
              <a href={contact.instagram} aria-label="Instagram" className="rounded-full border border-cream/20 p-2.5 transition-colors hover:border-emerald hover:text-emerald">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={contact.facebook} aria-label="Facebook" className="rounded-full border border-cream/20 p-2.5 transition-colors hover:border-emerald hover:text-emerald">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/40">Explore</p>
            <ul className="mt-5 space-y-3">
              {nav.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-cream/75 transition-colors hover:text-emerald">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/40">Booking</p>
            <ul className="mt-5 space-y-3">
              {customer.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-cream/75 transition-colors hover:text-emerald">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/40">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/75">
              {contact.phones.map((phone) => (
                <li key={phone} className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-emerald" />
                  <a href={`tel:${phone}`} className="transition-colors hover:text-emerald">{phone}</a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-emerald" />
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-emerald">{contact.email}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-emerald" />
                <span>{contact.location}</span>
              </li>
            </ul>
            <Link
              href={routes.admin}
              className="mt-5 inline-block text-xs text-cream/35 transition-colors hover:text-cream/60"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-8 text-xs text-cream/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Floral Roots &amp; Decor. All rights reserved.</p>
          <p>
            Built by{" "}
            <a
              href={builtBy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/60 underline decoration-cream/20 underline-offset-2 transition-colors hover:text-emerald hover:decoration-emerald"
            >
              {builtBy.name}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
