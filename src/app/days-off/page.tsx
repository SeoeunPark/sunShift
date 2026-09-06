"use client";

import { DaysOffBlockList } from "@/components/days-off/DaysOffBlockList";
import { DaysOffMonthSummary } from "@/components/days-off/DaysOffMonthSummary";
import { DaysOffNextCard } from "@/components/days-off/DaysOffNextCard";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDaysOff } from "@/hooks/useDaysOff";

export default function DaysOffPage() {
  const {
    today,
    upcomingOffBlocks,
    pastOffBlocks,
    currentOffBlock,
    isLoading,
  } = useDaysOff();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <PageHeader title="휴무" description="다음 휴무와 연속 휴무 일정을 확인합니다." />
        <LoadingCard lines={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <PageHeader title="휴무" description="다음 휴무와 연속 휴무 일정을 확인합니다." />

      <DaysOffNextCard />
      <DaysOffMonthSummary />

      {currentOffBlock && (
        <DaysOffBlockList
          title="현재 연속 휴무"
          blocks={[currentOffBlock]}
          highlightToday
          today={today}
        />
      )}

      <DaysOffBlockList
        title="다가오는 연속 휴무"
        blocks={upcomingOffBlocks.filter(
          (block) =>
            !currentOffBlock ||
            block.startDate !== currentOffBlock.startDate ||
            block.endDate !== currentOffBlock.endDate,
        )}
        highlightToday
        today={today}
        emptyMessage="이번 달 남은 연속 휴무가 없습니다."
      />

      {pastOffBlocks.length > 0 && (
        <DaysOffBlockList
          title="지난 연속 휴무"
          blocks={[...pastOffBlocks].reverse()}
          emptyMessage=""
        />
      )}
    </div>
  );
}
