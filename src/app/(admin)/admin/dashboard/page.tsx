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
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { NepaliCalendar } from "@/components/nepali-calendar/nepali-calendar";
import { AttentionPanel } from "@/components/admin/dashboard/attention-panel";
import { UpcomingEvents } from "@/components/admin/dashboard/upcoming-events";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { adToBs, BS_MONTH_NAMES_EN } from "@/lib/utils/nepali-calendar";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Greeting and today's date (AD + BS), computed in Nepal time. */
function getTodayHeader() {
  const now = new Date();
  const tz = "Asia/Kathmandu";
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const ad = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now).split("-").map(Number);
  let bs = "";
  try {
    const b = adToBs(new Date(y, m - 1, d));
    bs = `${b.date} ${BS_MONTH_NAMES_EN[b.month]} ${b.year}`;
  } catch {
    // Date outside the converter's supported range — show AD only
  }
  return { greeting, ad, bs };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const eventDates = stats.bookings.map((b) => b.event_date);
  const { greeting, ad, bs } = getTodayHeader();
  const urgentCount = stats.attention.filter((a) => a.severity === "high").length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {urgentCount > 0
              ? `${urgentCount} urgent item${urgentCount === 1 ? "" : "s"} need${urgentCount === 1 ? "s" : ""} your attention today.`
              : "Here's what's happening across your events today."}
          </p>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right">
          {ad}
          {bs && <span className="block text-gold-dark">{bs} BS</span>}
        </p>
      </div>

      <QuickActions />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <AttentionPanel items={stats.attention} />
        <UpcomingEvents events={stats.upcoming} />
        <div className="md:col-span-2 xl:col-span-1">
          <NepaliCalendar eventDates={eventDates} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <div className="space-y-4">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
