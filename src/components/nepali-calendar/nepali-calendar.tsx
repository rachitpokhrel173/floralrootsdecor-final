"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_EN,
  BS_DAY_NAMES,
  toDevanagariDigits,
  getTodayBs,
  buildBsMonthGrid,
  type BsCalendarDay,
} from "@/lib/utils/nepali-calendar";

export interface NepaliCalendarProps {
  /** Called when a date cell is clicked */
  onSelectDate?: (day: BsCalendarDay) => void;
  /** Highlight these AD dates (e.g. ISO "YYYY-MM-DD") as having events */
  eventDates?: string[];
  className?: string;
}

export function NepaliCalendar({ onSelectDate, eventDates, className }: NepaliCalendarProps) {
  const today = getTodayBs();
  const [year, setYear] = React.useState(today.year);
  const [month, setMonth] = React.useState(today.month);

  const grid = React.useMemo(() => buildBsMonthGrid(year, month), [year, month]);

  const eventSet = React.useMemo(() => new Set(eventDates ?? []), [eventDates]);

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToday() {
    setYear(today.year);
    setMonth(today.month);
  }

  const weeks: BsCalendarDay[][] = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gold" />
          <div>
            <p className="font-display text-lg leading-tight">
              {BS_MONTH_NAMES[month]} {toDevanagariDigits(year)}
            </p>
            <p className="text-xs text-muted-foreground">
              {BS_MONTH_NAMES_EN[month]} &middot; {new Date(grid[7]?.adDate ?? new Date()).toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="luxury" onClick={goToday} className="h-8 px-3 text-xs">
            आज
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={goNext} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {BS_DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-2.5 text-center text-[13px] font-semibold",
              i === 0 ? "text-red-500" : i === 6 ? "text-red-500" : "text-foreground/80"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const isSunday = di === 0;
                const isSaturday = di === 6;
                const iso = day.adDate.toISOString().slice(0, 10);
                const hasEvent = eventSet.has(iso);

                return (
                  <button
                    key={`${day.bsYear}-${day.bsMonth}-${day.bsDate}-${di}`}
                    onClick={() => onSelectDate?.(day)}
                    className={cn(
                      "relative flex flex-col items-start gap-0.5 border-b border-r border-border p-2.5 text-left transition-colors hover:bg-accent min-h-[74px]",
                      di === 6 && "border-r-0",
                      !day.isCurrentMonth && "opacity-35",
                      day.isToday && "bg-gold/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md text-sm font-semibold",
                        day.isToday && "bg-gold text-white",
                        !day.isToday && (isSunday || isSaturday) && "text-red-500",
                        !day.isToday && !isSunday && !isSaturday && "text-foreground"
                      )}
                    >
                      {toDevanagariDigits(day.bsDate)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{day.adDate.getDate()}</span>
                    {hasEvent && (
                      <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
