import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandIntro from "@/components/BrandIntro";
import EventTypes from "@/components/EventTypes";
import DesignCollection from "@/components/DesignCollection";
import Services from "@/components/Services";
import Packages from "@/components/Packages";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import OfferPopup from "@/components/OfferPopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandIntro />
        <EventTypes />
        <DesignCollection />
        <Services />
        <Packages />
        <WhyUs />
        <Testimonials />
        <BookingCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
      <OfferPopup />
    </>
  );
}
