import { redirect } from "next/navigation";

// New-booking notifications (created by a database trigger) link to
// /admin/bookings/<id>. Bookings open in a drawer on the list page, so
// forward those links to it.
export default async function BookingRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/bookings?id=${encodeURIComponent(id)}`);
}
