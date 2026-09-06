"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear, shiftMonth } from "@/lib/date/calendarUtils";
import { getCurrentSeoulMonth } from "@/lib/date/today";

interface StatsMonthNavigatorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function StatsMonthNavigator({ year, month, onChange }: StatsMonthNavigatorProps) {
  function handlePrevMonth() {
    const next = shiftMonth(year, month, -1);
    onChange(next.year, next.month);
  }

  function handleNextMonth() {
    const next = shiftMonth(year, month, 1);
    onChange(next.year, next.month);
  }

  function handleToday() {
    const today = getCurrentSeoulMonth();
    onChange(today.year, today.month);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" size="icon-sm" onClick={handlePrevMonth} aria-label="이전 달">
        <ChevronLeft className="size-4" />
      </Button>

      <div className="text-center">
        <h2 className="text-lg font-semibold">{formatMonthYear(year, month)}</h2>
        <Button variant="ghost" size="sm" onClick={handleToday}>
          이번 달
        </Button>
      </div>

      <Button variant="outline" size="icon-sm" onClick={handleNextMonth} aria-label="다음 달">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
