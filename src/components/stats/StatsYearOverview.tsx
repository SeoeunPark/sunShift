"use client";

import type { YearMonthSummary } from "@/lib/stats/statsUtils";
import { cn } from "@/lib/utils";

interface StatsYearOverviewProps {
  year: number;
  month: number;
  summaries: YearMonthSummary[];
}

export function StatsYearOverview({ year, month, summaries }: StatsYearOverviewProps) {
  const maxWorkDays = Math.max(...summaries.map((item) => item.totalWorkDays), 1);

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">{year}년 근무일 추이</h2>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {summaries.map((item) => {
          const height = `${Math.max(12, Math.round((item.totalWorkDays / maxWorkDays) * 100))}%`;

          return (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end rounded-lg bg-muted/50 px-1 pb-1">
                <div
                  className={cn(
                    "w-full rounded-md bg-primary/80 transition-all",
                    item.month === month && "bg-primary",
                  )}
                  style={{ height }}
                  title={`${item.month}월 ${item.totalWorkDays}근무/${item.totalOffDays}휴무`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.month}월</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
