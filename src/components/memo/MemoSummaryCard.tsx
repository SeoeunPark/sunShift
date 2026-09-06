"use client";

import { useMemoGroups } from "@/hooks/useMemoGroups";

export function MemoSummaryCard() {
  const { total, thisMonthCount, upcomingCount, isLoading } = useMemoGroups();

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">메모 불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">메모 현황</h2>
      <dl className="grid grid-cols-3 gap-4 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">전체</dt>
          <dd className="text-2xl font-bold">{total}개</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">이번 달</dt>
          <dd className="text-2xl font-bold">{thisMonthCount}개</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">다가오는</dt>
          <dd className="text-2xl font-bold text-primary">{upcomingCount}개</dd>
        </div>
      </dl>
    </section>
  );
}
