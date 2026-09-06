"use client";

import type { MonthComparison } from "@/lib/stats/statsUtils";
import { formatMonthYear, shiftMonth } from "@/lib/date/calendarUtils";

interface StatsMonthComparisonProps {
  year: number;
  month: number;
  comparison: MonthComparison[];
}

function formatDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }
  return String(delta);
}

export function StatsMonthComparison({ year, month, comparison }: StatsMonthComparisonProps) {
  const previous = shiftMonth(year, month, -1);

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">
        {formatMonthYear(previous.year, previous.month)} 대비
      </h2>
      <ul className="space-y-3">
        {comparison.map((item) => (
          <li key={item.metric} className="flex items-center justify-between rounded-xl border px-4 py-3">
            <span className="font-medium">{item.metric}</span>
            <div className="text-right text-sm">
              <p>
                {item.current}
                <span className="text-muted-foreground"> / 이전 {item.previous}</span>
              </p>
              <p
                className={
                  item.delta > 0
                    ? "text-primary"
                    : item.delta < 0
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }
              >
                {formatDelta(item.delta)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
