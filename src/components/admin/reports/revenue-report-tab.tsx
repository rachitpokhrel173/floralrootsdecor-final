"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { exportRowsToCsv } from "@/lib/utils/export-csv";
import type { RevenueReportData } from "@/lib/data/reports";

export function RevenueReportTab({ data }: { data: RevenueReportData }) {
  const hasData = data.byMonth.some((m) => m.revenue > 0);

  function handleExport() {
    exportRowsToCsv(
      ["Month", "Revenue"],
      data.byMonth.map((m) => [m.month, m.revenue]),
      `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Total Revenue</p>
              <p className="font-display text-2xl">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Outstanding</p>
              <p className="font-display text-2xl">{formatCurrency(data.totalOutstanding)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base font-normal">Revenue — Last 12 Months</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="pl-0">
          {!hasData ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No revenue recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.byMonth} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revReportGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a961" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#c9a961" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#b8935a" strokeWidth={2} fill="url(#revReportGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {data.byMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base font-normal">Revenue by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byMethod} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="method" fontSize={12} width={80} className="capitalize" />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Amount"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="#c9a961" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
