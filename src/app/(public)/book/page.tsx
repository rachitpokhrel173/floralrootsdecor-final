import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { getAllSettings } from "@/lib/data/settings";
import { BookingSteps } from "@/components/booking/booking-steps";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { eventTypes } = await getAllSettings();

  return (
    <>
      <Navbar />
      <PageHero
        eyebrow="Reserve Your Date"
        title="Plan Your"
        accent="Perfect Event."
        description="A few details now saves hours of back-and-forth later — takes under 2 minutes. We reply within 24 hours with a tailored proposal."
      />

      <BookingSteps eventTypes={eventTypes} />

      <Footer />
    </>
  );
}
