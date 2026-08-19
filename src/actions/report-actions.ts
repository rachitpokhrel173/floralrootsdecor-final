"use server";

import { getRevenueReport, getBookingReport, getCustomerReport, getInventoryReport } from "@/lib/data/reports";

export async function getRevenueReportAction() {
  return getRevenueReport();
}

export async function getBookingReportAction() {
  return getBookingReport();
}

export async function getCustomerReportAction() {
  return getCustomerReport();
}

export async function getInventoryReportAction() {
  return getInventoryReport();
}
