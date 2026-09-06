"use client";

import type { MonthlyShiftStats } from "@/lib/shift/shiftTypes";

interface StatsSummaryGridProps {
  stats: MonthlyShiftStats;
  leaveCount: number;
  workHours: number;
}

export function StatsSummaryGrid({ stats, leaveCount, workHours }: StatsSummaryGridProps) {
  const items = [
    { label: "A조", value: `${stats.counts.A}회` },
    { label: "B조", value: `${stats.counts.B}회` },
    { label: "C조", value: `${stats.counts.C}회` },
    { label: "휴무", value: `${stats.counts.OFF}일` },
    { label: "야간근무", value: `${stats.nightShiftCount}회` },
    { label: "연차", value: `${leaveCount}일` },
    { label: "총 근무일", value: `${stats.totalWorkDays}일` },
    { label: "총 근무시간", value: `${workHours}시간` },
  ];

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">월별 통계</h2>
      <dl className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="text-2xl font-bold">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
