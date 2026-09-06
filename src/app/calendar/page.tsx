"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { AppCard } from "@/components/ui/AppCard";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PAGE_VIEWPORT_HEIGHT } from "@/lib/layout/viewport";
import { cn } from "@/lib/utils";

function CalendarPageContent() {
  const searchParams = useSearchParams();
  const focusDate = searchParams.get("date");

  return <MonthCalendar key={focusDate ?? "default"} focusDate={focusDate} fullscreen />;
}

export default function CalendarPage() {
  return (
    <div className={cn(PAGE_VIEWPORT_HEIGHT, "flex min-h-0 flex-col overflow-hidden py-1")}>
      <AppCard as="section" className="flex min-h-0 flex-1 flex-col p-2.5">
        <Suspense fallback={<LoadingCard lines={6} className="flex-1" />}>
          <CalendarPageContent />
        </Suspense>
      </AppCard>
    </div>
  );
}
