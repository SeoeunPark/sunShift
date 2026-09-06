"use client";

import { useState } from "react";
import { getCurrentSeoulMonth } from "@/lib/date/today";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMonthlyStats } from "@/hooks/useMonthlyStats";
import { StatsMonthComparison } from "@/components/stats/StatsMonthComparison";
import { StatsMonthNavigator } from "@/components/stats/StatsMonthNavigator";
import { StatsShiftBars } from "@/components/stats/StatsShiftBars";
import { StatsSummaryGrid } from "@/components/stats/StatsSummaryGrid";
import { StatsYearOverview } from "@/components/stats/StatsYearOverview";

export default function StatsPage() {
  const initial = getCurrentSeoulMonth();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const { stats, leaveCount, workHours, comparison, yearSummaries, isLoading } = useMonthlyStats(
    year,
    month,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 py-4">
        <PageHeader title="통계" description="월별 근무·휴무·연차 현황을 확인합니다." />
        <LoadingCard lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <PageHeader title="통계" description="월별 근무·휴무·연차 현황을 확인합니다." />

      <StatsMonthNavigator
        year={year}
        month={month}
        onChange={(nextYear, nextMonth) => {
          setYear(nextYear);
          setMonth(nextMonth);
        }}
      />

      <StatsSummaryGrid stats={stats} leaveCount={leaveCount} workHours={workHours} />
      <StatsShiftBars stats={stats} />
      <StatsMonthComparison year={year} month={month} comparison={comparison} />
      <StatsYearOverview year={year} month={month} summaries={yearSummaries} />
    </div>
  );
}
