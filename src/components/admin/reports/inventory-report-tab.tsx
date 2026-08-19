"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Boxes, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { exportRowsToCsv } from "@/lib/utils/export-csv";
import { INVENTORY_CATEGORY_LABELS } from "@/lib/validations/inventory";
import type { InventoryReportData } from "@/lib/data/reports";

export function InventoryReportTab({ data }: { data: InventoryReportData }) {
  function handleExport() {
    exportRowsToCsv(
      ["Category", "Items", "Total Quantity", "Total Value", "Low Stock Items"],
      data.byCategory.map((c) => [
        INVENTORY_CATEGORY_LABELS[c.category as keyof typeof INVENTORY_CATEGORY_LABELS] ?? c.category,
        c.itemCount,
        c.totalQuantity,
        c.totalValue,
        c.lowStockCount,
      ]),
      `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  const chartData = data.byCategory.map((c) => ({
    category: INVENTORY_CATEGORY_LABELS[c.category as keyof typeof INVENTORY_CATEGORY_LABELS] ?? c.category,
    value: c.totalValue,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Total Inventory Value</p>
              <p className="font-display text-2xl">{formatCurrency(data.totalValue)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">Low Stock Items</p>
              <p className="font-display text-2xl">{data.totalLowStock}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-normal">Value by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No inventory items yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="category" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Value"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#c9a961" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base font-normal">By Category</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data.byCategory.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No items yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium text-center">Items</th>
                  <th className="px-5 py-2.5 font-medium text-center">Total Qty</th>
                  <th className="px-5 py-2.5 font-medium text-right">Value</th>
                  <th className="px-5 py-2.5 font-medium text-center">Low Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.byCategory.map((c) => (
                  <tr key={c.category} className="border-t border-border">
                    <td className="px-5 py-2.5 font-medium">
                      {INVENTORY_CATEGORY_LABELS[c.category as keyof typeof INVENTORY_CATEGORY_LABELS] ?? c.category}
                    </td>
                    <td className="px-5 py-2.5 text-center">{c.itemCount}</td>
                    <td className="px-5 py-2.5 text-center">{c.totalQuantity}</td>
                    <td className="px-5 py-2.5 text-right font-medium">{formatCurrency(c.totalValue)}</td>
                    <td className="px-5 py-2.5 text-center">
                      {c.lowStockCount > 0 ? (
                        <Badge variant="destructive" className="text-[10px]">
                          {c.lowStockCount}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
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
