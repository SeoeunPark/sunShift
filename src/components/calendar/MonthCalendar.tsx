"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { ShareScheduleActions } from "@/components/share/ShareScheduleActions";
import {
  formatMonthYear,
  getCalendarDays,
  getMonthFromDate,
  getWeekdayLabels,
  shiftMonth,
} from "@/lib/date/calendarUtils";
import { getCurrentSeoulMonth } from "@/lib/date/today";
import { cn } from "@/lib/utils";
import { useSeoulToday } from "@/hooks/useClientOnly";
import { useMonthSchedule } from "@/hooks/useMonthSchedule";
import { CalendarDayCell } from "./CalendarDayCell";
import { DateDetailSheet } from "./DateDetailSheet";

interface MonthCalendarProps {
  focusDate?: string | null;
  /** Hide share actions and simplify layout for home embed */
  embedded?: boolean;
  /** Dense cells that fill available height (home screen) */
  compact?: boolean;
  /** Calendar tab: compact grid + share bar, fills viewport */
  fullscreen?: boolean;
}

export function MonthCalendar({
  focusDate = null,
  embedded = false,
  compact = false,
  fullscreen = false,
}: MonthCalendarProps) {
  const initial = focusDate ? getMonthFromDate(focusDate) : getCurrentSeoulMonth();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(focusDate);
  const [sheetOpen, setSheetOpen] = useState(Boolean(focusDate));

  const { scheduleByDate, leaveByDate, memoByDate, isLoading } = useMonthSchedule(year, month);
  const days = getCalendarDays(year, month);
  const weekdays = getWeekdayLabels();
  const isCompact = compact || fullscreen;
  const today = useSeoulToday();

  const shareInput = useMemo(
    () => ({
      year,
      month,
      scheduleByDate,
      leaveDates: new Set(leaveByDate.keys()),
    }),
    [year, month, scheduleByDate, leaveByDate],
  );

  function goToMonth(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
  }

  function handlePrevMonth() {
    const next = shiftMonth(year, month, -1);
    goToMonth(next.year, next.month);
  }

  function handleNextMonth() {
    const next = shiftMonth(year, month, 1);
    goToMonth(next.year, next.month);
  }

  function handleToday() {
    const { year: y, month: m } = getMonthFromDate(today);
    goToMonth(y, m);
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSheetOpen(true);
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        isCompact ? "h-full min-h-0 gap-1" : embedded ? "gap-3" : "gap-4",
      )}
    >
      <div className={cn("flex shrink-0 items-center justify-between gap-1", isCompact && "px-0.5")}>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handlePrevMonth}
          aria-label="이전 달"
          className={isCompact ? "size-7" : undefined}
        >
          <ChevronLeft className={isCompact ? "size-3.5" : "size-4"} />
        </Button>

        <div className="text-center">
          <h2
            className={cn(
              "font-semibold",
              isCompact ? "text-xs" : embedded ? "text-base" : "text-lg",
            )}
          >
            {formatMonthYear(year, month)}
          </h2>
          {fullscreen && (
            <button
              type="button"
              onClick={handleToday}
              className="mt-0.5 text-[10px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              오늘
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleNextMonth}
          aria-label="다음 달"
          className={isCompact ? "size-7" : undefined}
        >
          <ChevronRight className={isCompact ? "size-3.5" : "size-4"} />
        </Button>
      </div>

      {!embedded && !fullscreen && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleToday}>
            오늘
          </Button>
        </div>
      )}

      <div
        className={cn(
          "grid shrink-0 grid-cols-7 text-center font-medium text-muted-foreground",
          isCompact ? "gap-0.5 text-[10px]" : "gap-1 text-xs",
        )}
      >
        {weekdays.map((label, index) => (
          <div
            key={label}
            className={index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : undefined}
          >
            {label}
          </div>
        ))}
      </div>

      {isLoading ? (
        <LoadingCard lines={isCompact ? 4 : 6} className={isCompact ? "flex-1 py-2" : "py-8"} />
      ) : (
        <div
          className={cn(
            "grid min-h-0 grid-cols-7",
            isCompact ? "flex-1 grid-rows-6 gap-0.5" : "gap-1",
          )}
        >
          {days.map((day) => (
            <CalendarDayCell
              key={day.date}
              date={day.date}
              day={day.day}
              today={today}
              inCurrentMonth={day.inCurrentMonth}
              shift={scheduleByDate.get(day.date)}
              hasLeave={leaveByDate.has(day.date)}
              hasMemo={memoByDate.has(day.date)}
              compact={isCompact}
              onSelect={handleSelectDate}
            />
          ))}
        </div>
      )}

      {!embedded && (
        <ShareScheduleActions input={shareInput} disabled={isLoading} compact={fullscreen} />
      )}

      <DateDetailSheet
        date={selectedDate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
