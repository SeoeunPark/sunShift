"use client";

import type { MonthlyShiftStats } from "@/lib/shift/shiftTypes";
import { SHIFT_COLORS } from "@/lib/theme/shiftColors";
import { cn } from "@/lib/utils";

interface StatsShiftBarsProps {
  stats: MonthlyShiftStats;
}

const BAR_ITEMS = [
  { code: "A" as const, label: "A조" },
  { code: "B" as const, label: "B조" },
  { code: "C" as const, label: "C조" },
  { code: "OFF" as const, label: "휴무" },
];

export function StatsShiftBars({ stats }: StatsShiftBarsProps) {
  const maxCount = Math.max(...BAR_ITEMS.map((item) => stats.counts[item.code]), 1);

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">근무 분포</h2>
      <ul className="space-y-3">
        {BAR_ITEMS.map((item) => {
          const count = stats.counts[item.code];
          const width = `${Math.round((count / maxCount) * 100)}%`;
          const colors = SHIFT_COLORS[item.code];

          return (
            <li key={item.code} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className={cn("h-3 rounded-full transition-all", colors.bg)}
                  style={{ width }}
                  role="presentation"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
