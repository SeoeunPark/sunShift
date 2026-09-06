"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MemoForm } from "@/components/memo/MemoForm";
import { MemoRecordList } from "@/components/memo/MemoRecordList";
import { MemoSummaryCard } from "@/components/memo/MemoSummaryCard";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageHeader } from "@/components/ui/PageHeader";

function MemoPageContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";
  const [activeDate, setActiveDate] = useState(initialDate);
  const formDate = activeDate || initialDate;

  return (
    <div className="flex flex-col gap-4 py-6">
      <PageHeader title="메모" description="날짜별 일정과 메모를 관리합니다." />

      <MemoSummaryCard />
      <MemoForm key={formDate || "new"} initialDate={formDate} />
      <MemoRecordList activeDate={formDate} onSelect={setActiveDate} />
    </div>
  );
}

export default function MemoPage() {
  return (
    <Suspense fallback={<LoadingCard lines={3} className="my-6" />}>
      <MemoPageContent />
    </Suspense>
  );
}
