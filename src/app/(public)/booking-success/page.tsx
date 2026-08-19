import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Booking Confirmation",
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <EmptyState message="No booking reference provided. Please check your confirmation email or SMS for your booking code." />
    );
  }

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_code, full_name, event_type, event_date, status, created_at")
    .eq("booking_code", code)
    .maybeSingle();

  if (!booking) {
    return (
      <EmptyState message={`We couldn't find a booking with reference "${code}". Please double-check and try again.`} />
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-lg px-6 pb-16 pt-40">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-2">
              Booking Confirmation
            </p>
            <h1 className="font-display text-2xl mb-1">{booking.booking_code}</h1>
            <Badge variant="luxury" className="mb-6 capitalize">
              {booking.status}
            </Badge>

            <dl className="space-y-3 text-left border-t border-border pt-6">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{booking.full_name}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Event Type</dt>
                <dd className="font-medium">{booking.event_type}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Event Date</dt>
                <dd className="font-medium">{formatDate(booking.event_date)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="font-medium">{formatDate(booking.created_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-md px-6 pb-24 pt-40 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="font-display text-xl mb-2">Booking Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <Link href="/book" className="text-sm font-medium text-gold hover:underline">
          Submit a new booking →
        </Link>
      </div>
      <Footer />
    </>
  );
}
