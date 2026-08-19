"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { exportRowsToCsv } from "@/lib/utils/export-csv";
import type { CustomerReportData } from "@/lib/data/reports";

export function CustomerReportTab({ data }: { data: CustomerReportData }) {
  function handleExport() {
    exportRowsToCsv(
      ["Name", "Phone", "Bookings", "Total Spent"],
      data.topCustomers.map((c) => [c.full_name, c.phone, c.bookingsCount, c.totalSpent]),
      `customer-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Total Customers</p>
              <p className="font-display text-2xl">{data.totalCustomers}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">New This Month</p>
              <p className="font-display text-2xl">
                {data.newCustomersByMonth[data.newCustomersByMonth.length - 1]?.count ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-normal">New Customers — Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          {data.totalCustomers === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.newCustomersByMonth} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Bar dataKey="count" name="New Customers" fill="#c9a961" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base font-normal">Top Customers by Spend</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data.topCustomers.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No customers yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Phone</th>
                  <th className="px-5 py-2.5 font-medium text-center">Bookings</th>
                  <th className="px-5 py-2.5 font-medium text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-5 py-2.5 font-medium">{c.full_name}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{c.phone}</td>
                    <td className="px-5 py-2.5 text-center">{c.bookingsCount}</td>
                    <td className="px-5 py-2.5 text-right font-medium">{formatCurrency(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
