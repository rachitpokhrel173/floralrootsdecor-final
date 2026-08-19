import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandIntro from "@/components/BrandIntro";
import EventTypes from "@/components/EventTypes";
import DesignCollection from "@/components/DesignCollection";
import FeaturedDesign from "@/components/FeaturedDesign";
import Services from "@/components/Services";
import Packages from "@/components/Packages";
import WhyUs from "@/components/WhyUs";
import RealEvents from "@/components/RealEvents";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import OurTeam from "@/components/OurTeam";
import BookingCTA from "@/components/BookingCTA";
import FinalStatement from "@/components/FinalStatement";
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
        <FeaturedDesign />
        <Services />
        <Packages />
        <WhyUs />
        <RealEvents />
        <Testimonials />
        <HowItWorks />
        <OurTeam />
        <BookingCTA />
        <FinalStatement />
      </main>
      <Footer />
      <MobileStickyCTA />
      <OfferPopup />
    </>
  );
}
