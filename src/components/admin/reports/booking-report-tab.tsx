"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, CalendarCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportRowsToCsv } from "@/lib/utils/export-csv";
import type { BookingReportData } from "@/lib/data/reports";

const COLORS = ["#c9a961", "#8f6f3f", "#e2c68a", "#6b4226", "#a3824a", "#d9bc86", "#4a3520", "#71717a", "#c0392b"];

export function BookingReportTab({ data }: { data: BookingReportData }) {
  function handleExport() {
    exportRowsToCsv(
      ["Month", "Bookings"],
      data.byMonth.map((m) => [m.month, m.count]),
      `booking-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Total Bookings</p>
              <p className="font-display text-2xl">{data.totalBookings}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Conversion Rate</p>
              <p className="font-display text-2xl">{data.conversionRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base font-normal">Bookings — Last 12 Months</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {data.totalBookings === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No bookings yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byMonth} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Bar dataKey="count" name="Bookings" fill="#c9a961" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base font-normal">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byStatus.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.byStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {data.byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base font-normal">By Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byEventType.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.byEventType} dataKey="count" nameKey="eventType" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {data.byEventType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
