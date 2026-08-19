import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import PageHero from "@/components/PageHero";
import BookingCTA from "@/components/BookingCTA";
import DesignsClient from "./DesignsClient";

export const metadata: Metadata = {
  title: "Designs",
  description:
    "Explore our design collection by category — mandap, stage, car decoration, entrance, reception and birthday decor by Floral Roots & Decor.",
};

export default function DesignsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Our Portfolio"
          title="The design"
          accent="collection."
          description="Browse our work by category. Mandap features real photography from our recent events — other categories will fill in as more shoots come through."
        />
        <DesignsClient />
        <BookingCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
