"use client";

import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveRecordList } from "@/components/leave/LeaveRecordList";
import { LeaveSummaryCard } from "@/components/leave/LeaveSummaryCard";
import { PAGE_VIEWPORT_HEIGHT } from "@/lib/layout/viewport";
import { cn } from "@/lib/utils";

interface LeaveDashboardProps {
  initialDate?: string;
}

export function LeaveDashboard({ initialDate = "" }: LeaveDashboardProps) {
  return (
    <div className={cn(PAGE_VIEWPORT_HEIGHT, "flex min-h-0 flex-col gap-1.5 overflow-hidden py-1")}>
      <LeaveSummaryCard compact />
      <LeaveForm key={initialDate} initialDate={initialDate} compact />
      <LeaveRecordList compact className="min-h-0 flex-1" />
    </div>
  );
}
