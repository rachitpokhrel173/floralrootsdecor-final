import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { QueryProvider } from "@/components/layout/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const SITE_URL = "https://www.floralrootsdecor.com.np";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Floral Roots & Decor | Premium Event Decoration in Nepal",
    template: "%s | Floral Roots & Decor",
  },
  description:
    "Floral Roots & Decor designs weddings, engagements, birthdays, corporate events and celebrations across Nepal. Explore our design collection, packages and book your event.",
  keywords: [
    "Floral Roots & Decor",
    "event decoration Nepal",
    "wedding decoration Kathmandu",
    "birthday decoration Nepal",
    "corporate event decoration",
    "mandap decoration Nepal",
    "event management Nepal",
    "floral design Kathmandu",
  ],
  openGraph: {
    title: "Floral Roots & Decor | Premium Event Decoration in Nepal",
    description:
      "We design the moments you'll never forget — weddings, engagements, birthdays, corporate events and celebrations across Nepal.",
    url: SITE_URL,
    siteName: "Floral Roots & Decor",
    locale: "en_NP",
    type: "website",
    images: [{ url: "/images/hero-main.svg", width: 1600, height: 1000, alt: "Floral Roots & Decor — event decoration" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Floral Roots & Decor | Premium Event Decoration in Nepal",
    description: "Rooted in quality, flourishing in beauty — event decoration across Nepal.",
    images: ["/images/hero-main.svg"],
  },
  icons: {
    icon: "/logo.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Floral Roots & Decor",
  image: `${SITE_URL}/logo.png`,
  url: SITE_URL,
  description:
    "Premium event decoration studio in Nepal specializing in weddings, engagements, birthdays, corporate events and celebrations.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Banepa-Nala Road",
    addressLocality: "Banepa",
    addressRegion: "Kavrepalanchok",
    postalCode: "45210",
    addressCountry: "NP",
  },
  telephone: "+977-9840261629",
  email: "floralrootsdecors@gmail.com",
  areaServed: "Nepal",
  slogan: "Rooted in Quality, Flourishing in Beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider delayDuration={200}>
              <div className="print:hidden">{children}</div>
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}