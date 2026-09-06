"use client";

import { formatKoreanDate } from "@/lib/date/dateUtils";
import { useDaysOff } from "@/hooks/useDaysOff";

export function DaysOffNextCard() {
  const { nextOffDate, daysUntilOff, todayShift, isLoading } = useDaysOff();

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">다음 휴무</h2>
      {todayShift.code === "OFF" ? (
        <div>
          <p className="text-3xl font-bold">오늘 휴무 💤</p>
          <p className="mt-2 text-muted-foreground">{formatKoreanDate(nextOffDate)}</p>
        </div>
      ) : (
        <div>
          <p className="text-4xl font-bold text-primary">D-{daysUntilOff}</p>
          <p className="mt-2 text-lg font-medium">{formatKoreanDate(nextOffDate)}</p>
        </div>
      )}
    </section>
  );
}
