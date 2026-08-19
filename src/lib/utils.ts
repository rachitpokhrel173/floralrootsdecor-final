import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as NPR currency, e.g. 45000 -> "Rs. 45,000" */
export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

/** Format an ISO date string as "12 Jul 2026" */
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

/** Days remaining until a given date (negative if in the past) */
export function daysUntil(date: string | Date) {
  const target = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
