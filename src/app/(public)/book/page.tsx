"use client";

import { AnimatePresence } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/ui";
import { contact } from "@/lib/site-data";
import { useBookingFormStore } from "@/stores/booking-form-store";
import { BookingStepIndicator } from "@/components/booking/booking-step-indicator";
import { Step1PersonalInfo } from "@/components/booking/step1-personal-info";
import { Step2EventDetails } from "@/components/booking/step2-event-details";
import { Step3Services } from "@/components/booking/step3-services";
import { BookingSuccess } from "@/components/booking/booking-success";
import { Card, CardContent } from "@/components/ui/card";

export default function BookPage() {
  const { step, submittedBookingCode, reset } = useBookingFormStore();

  return (
    <>
      <Navbar />
      <PageHero
        eyebrow="Reserve Your Date"
        title="Plan Your"
        accent="Perfect Event."
        description="A few details now saves hours of back-and-forth later — takes under 2 minutes. We reply within 24 hours with a tailored proposal."
      />

      <section className="bg-sand py-14 md:py-20">
        <Container className="max-w-2xl">
          {!submittedBookingCode && (
            <div className="mb-10">
              <BookingStepIndicator currentStep={step} />
            </div>
          )}

          <Card className="shadow-lg">
            <CardContent className="p-6 sm:p-8">
              {submittedBookingCode ? (
                <BookingSuccess bookingCode={submittedBookingCode} onStartOver={reset} />
              ) : (
                <AnimatePresence mode="wait">
                  {step === 1 && <Step1PersonalInfo key="step1" />}
                  {step === 2 && <Step2EventDetails key="step2" />}
                  {step === 3 && <Step3Services key="step3" />}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Prefer to talk it through first?{" "}
            <a href={`tel:${contact.phones[0]}`} className="inline-flex items-center gap-1.5 font-semibold text-forest hover:text-emerald">
              <Phone className="h-3.5 w-3.5" /> Call us
            </a>{" "}
            or{" "}
            <a
              href={`https://wa.me/${contact.phones[0].replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-forest hover:text-emerald"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp us
            </a>
            .
          </p>
        </Container>
      </section>

      <Footer />
    </>
  );
}
