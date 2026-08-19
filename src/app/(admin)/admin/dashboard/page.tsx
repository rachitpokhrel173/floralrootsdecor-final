import {
  CalendarCheck,
  CalendarClock,
  FileClock,
  Wallet,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BadgeDollarSign,
} from "lucide-react";
import { getDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { EventTypeChart } from "@/components/admin/dashboard/event-type-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { NepaliCalendar } from "@/components/nepali-calendar/nepali-calendar";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const eventDates = stats.bookings.map((b) => b.event_date);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening across your events today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Bookings"
          value={String(stats.todaysBookings)}
          icon={<CalendarCheck className="h-5 w-5" />}
          accent="gold"
          delay={0}
        />
        <StatCard
          label="Upcoming Events"
          value={String(stats.upcomingEvents)}
          icon={<CalendarClock className="h-5 w-5" />}
          accent="default"
          delay={0.03}
        />
        <StatCard
          label="Pending Quotations"
          value={String(stats.pendingQuotations)}
          icon={<FileClock className="h-5 w-5" />}
          accent="default"
          delay={0.06}
        />
        <StatCard
          label="Total Customers"
          value={String(stats.totalCustomers)}
          icon={<Users className="h-5 w-5" />}
          accent="default"
          delay={0.09}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<Wallet className="h-5 w-5" />}
          accent="emerald"
          delay={0.12}
        />
        <StatCard
          label="Yearly Revenue"
          value={formatCurrency(stats.yearlyRevenue)}
          icon={<BadgeDollarSign className="h-5 w-5" />}
          accent="emerald"
          delay={0.15}
        />
        <StatCard
          label="Active Events"
          value={String(stats.activeEvents)}
          icon={<Activity className="h-5 w-5" />}
          accent="gold"
          delay={0.18}
        />
        <StatCard
          label="Completed Events"
          value={String(stats.completedEvents)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
          delay={0.21}
        />
        <StatCard
          label="Cancelled Events"
          value={String(stats.cancelledEvents)}
          icon={<XCircle className="h-5 w-5" />}
          accent="red"
          delay={0.24}
        />
        <StatCard
          label="Outstanding Amount"
          value={formatCurrency(stats.outstandingAmount)}
          icon={<Wallet className="h-5 w-5" />}
          accent="red"
          delay={0.27}
        />
        <StatCard
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="gold"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <RevenueChart data={stats.revenueByMonth} />
          <EventTypeChart data={stats.bookingsByEventType} />
        </div>
        <div className="space-y-4">
          <NepaliCalendar eventDates={eventDates} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
