"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RevenueReportTab } from "./revenue-report-tab";
import { BookingReportTab } from "./booking-report-tab";
import { CustomerReportTab } from "./customer-report-tab";
import { InventoryReportTab } from "./inventory-report-tab";
import type { RevenueReportData, BookingReportData, CustomerReportData, InventoryReportData } from "@/lib/data/reports";

export function ReportsTabs({
  revenue,
  bookings,
  customers,
  inventory,
}: {
  revenue: RevenueReportData;
  bookings: BookingReportData;
  customers: CustomerReportData;
  inventory: InventoryReportData;
}) {
  return (
    <Tabs defaultValue="revenue">
      <TabsList>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue">
        <RevenueReportTab data={revenue} />
      </TabsContent>
      <TabsContent value="bookings">
        <BookingReportTab data={bookings} />
      </TabsContent>
      <TabsContent value="customers">
        <CustomerReportTab data={customers} />
      </TabsContent>
      <TabsContent value="inventory">
        <InventoryReportTab data={inventory} />
      </TabsContent>
    </Tabs>
  );
}
