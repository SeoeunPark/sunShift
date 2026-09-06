"use client";

import { formatMonthYear } from "@/lib/date/calendarUtils";
import { useDaysOff } from "@/hooks/useDaysOff";

export function DaysOffMonthSummary() {
  const { year, month, totalOffDays, isLoading } = useDaysOff();

  if (isLoading) {
    return null;
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {formatMonthYear(year, month)}
      </h2>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">휴무</span>
        <span className="text-3xl font-bold">{totalOffDays}</span>
        <span className="text-sm text-muted-foreground">일</span>
      </div>
    </section>
  );
}
