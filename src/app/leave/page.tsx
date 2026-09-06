"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeaveDashboard } from "@/components/leave/LeaveDashboard";
import { LoadingCard } from "@/components/ui/LoadingCard";

function MemoTabRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab") === "memo") {
      const date = searchParams.get("date");
      router.replace(date ? `/memo?date=${date}` : "/memo");
    }
  }, [router, searchParams]);

  return null;
}

function LeavePageContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";

  if (searchParams.get("tab") === "memo") {
    return (
      <>
        <MemoTabRedirect />
        <div className="py-6 text-sm text-muted-foreground">메모 화면으로 이동 중...</div>
      </>
    );
  }

  return <LeaveDashboard initialDate={initialDate} />;
}

export default function LeavePage() {
  return (
    <Suspense fallback={<LoadingCard lines={3} className="my-6" />}>
      <LeavePageContent />
    </Suspense>
  );
}
