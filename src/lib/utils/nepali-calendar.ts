import NepaliDateLib, { dateConfigMap as importedDateConfigMap } from "nepali-date-converter";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NepaliDate: any = (NepaliDateLib as any).default || NepaliDateLib;
const dateConfigMap: Record<number, Record<string, number>> = importedDateConfigMap;

export const BS_MONTH_NAMES = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
] as const;

export const BS_MONTH_NAMES_EN = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_DAY_NAMES = [
  "आइतवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
] as const;

export const BS_DAY_NAMES_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** Convert an integer (or numeral string) to Devanagari numerals, e.g. 2083 -> "२०८३" */
export function toDevanagariDigits(value: number | string): string {
  return String(value)
    .split("")
    .map((ch) => (/[0-9]/.test(ch) ? DEVANAGARI_DIGITS[Number(ch)] : ch))
    .join("");
}

export interface BsCalendarDay {
  bsDate: number;
  bsMonth: number; // 0-indexed
  bsYear: number;
  adDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/** Number of days in a given BS year/month (month 0-indexed) */
export function daysInBsMonth(bsYear: number, bsMonth: number): number {
  const yearData = dateConfigMap[bsYear];
  if (!yearData) return 30;
  return Object.values(yearData)[bsMonth] ?? 30;
}

/** Get today's date expressed in the Bikram Sambat calendar */
export function getTodayBs(): { year: number; month: number; date: number } {
  const d = new NepaliDate();
  const bs = d.getBS();
  return { year: bs.year, month: bs.month, date: bs.date };
}

/**
 * Builds a full 6-week (max) grid for the given BS year/month, including
 * greyed-out leading/trailing days from the adjacent months, each paired
 * with its equivalent Gregorian (AD) date.
 */
export function buildBsMonthGrid(bsYear: number, bsMonth: number): BsCalendarDay[] {
  const daysThisMonth = daysInBsMonth(bsYear, bsMonth);
  const firstOfMonth = new NepaliDate(bsYear, bsMonth, 1);
  const firstWeekday: number = firstOfMonth.getDay(); // 0 = Sunday

  const today = getTodayBs();

  // Previous month info (for leading grey cells)
  let prevYear = bsYear;
  let prevMonth = bsMonth - 1;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear = bsYear - 1;
  }
  const daysPrevMonth = daysInBsMonth(prevYear, prevMonth);

  // Next month info (for trailing grey cells)
  let nextYear = bsYear;
  let nextMonth = bsMonth + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear = bsYear + 1;
  }

  const cells: BsCalendarDay[] = [];

  // Leading days from previous month
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const date = daysPrevMonth - i;
    const nd = new NepaliDate(prevYear, prevMonth, date);
    cells.push({
      bsDate: date,
      bsMonth: prevMonth,
      bsYear: prevYear,
      adDate: nd.toJsDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let date = 1; date <= daysThisMonth; date++) {
    const nd = new NepaliDate(bsYear, bsMonth, date);
    cells.push({
      bsDate: date,
      bsMonth,
      bsYear,
      adDate: nd.toJsDate(),
      isCurrentMonth: true,
      isToday:
        today.year === bsYear && today.month === bsMonth && today.date === date,
    });
  }

  // Trailing days from next month to fill out the last week
  const remainder = cells.length % 7;
  const trailingCount = remainder === 0 ? 0 : 7 - remainder;
  for (let date = 1; date <= trailingCount; date++) {
    const nd = new NepaliDate(nextYear, nextMonth, date);
    cells.push({
      bsDate: date,
      bsMonth: nextMonth,
      bsYear: nextYear,
      adDate: nd.toJsDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return cells;
}

/** Convert a Gregorian (AD) Date into its Bikram Sambat equivalent */
export function adToBs(date: Date): { year: number; month: number; date: number } {
  const nd = new NepaliDate(date);
  return nd.getBS();
}

/** Convert a BS year/month/date into a JS (AD) Date */
export function bsToAd(year: number, month: number, date: number): Date {
  return new NepaliDate(year, month, date).toJsDate();
}