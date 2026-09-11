"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/ui/AppCard";
import { formatKoreanDateWithWeekday } from "@/lib/date/dateUtils";
import { getLeaveTypeColors, getLeaveTypeLabel } from "@/lib/leave/leaveDisplay";
import type { LeaveType } from "@/lib/leave/leaveTypes";
import { getShiftForDate } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { cn } from "@/lib/utils";
import { useLeave } from "@/hooks/useLeave";
import { useLeaveRestAnalysis } from "@/hooks/useLeaveRestAnalysis";
import { useShiftSettings } from "@/hooks/useShiftSettings";

function LeaveRecordItem({
  id,
  date,
  type,
  memo,
  compact,
}: {
  id: string;
  date: string;
  type: LeaveType;
  memo: string | null;
  compact?: boolean;
}) {
  const { remove } = useLeave();
  const { settings } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const originalShift = getShiftForDate(date, shiftSettings);
  const restAnalysis = useLeaveRestAnalysis(date);
  const [isDeleting, setIsDeleting] = useState(false);
  const colors = getLeaveTypeColors(type);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await remove(id);
    } finally {
      setIsDeleting(false);
    }
  }

  if (compact) {
    return (
      <li className="app-card-inset flex items-center gap-2 px-2.5 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-semibold">{formatKoreanDateWithWeekday(date)}</p>
            <Badge
              className={cn(
                "h-4 px-1.5 text-[9px] font-semibold",
                colors.bg,
                colors.text,
                colors.border,
              )}
            >
              {getLeaveTypeLabel(type)}
            </Badge>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            <ShiftBadge code={originalShift.code} size="sm" />
            {memo && <span className="truncate">{memo}</span>}
            {restAnalysis && restAnalysis.totalRestDays > 1 && (
              <span>휴식 {restAnalysis.totalRestDays}일</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          aria-label="휴가 삭제"
          className="shrink-0"
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </li>
    );
  }

  return (
    <li className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="font-medium">{formatKoreanDateWithWeekday(date)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn(colors.bg, colors.text, colors.border)}>
              {getLeaveTypeLabel(type)}
            </Badge>
            <span className="text-xs text-muted-foreground">원래</span>
            <ShiftBadge code={originalShift.code} size="sm" />
          </div>
          {memo && <p className="text-sm text-muted-foreground">{memo}</p>}
          {restAnalysis && restAnalysis.totalRestDays > 1 && (
            <p className="text-xs text-muted-foreground">
              휴식 {restAnalysis.totalRestDays}일 ({restAnalysis.rangeLabel})
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          aria-label="휴가 삭제"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </li>
  );
}

interface LeaveRecordListProps {
  compact?: boolean;
  className?: string;
}

export function LeaveRecordList({ compact = false, className }: LeaveRecordListProps) {
  const { records, isLoading } = useLeave();

  if (isLoading) {
    return compact ? (
      <AppCard className={cn("p-3", className)}>
        <p className="text-xs text-muted-foreground">목록 불러오는 중...</p>
      </AppCard>
    ) : (
      <section className="app-card p-6">
        <p className="text-sm text-muted-foreground">목록 불러오는 중...</p>
      </section>
    );
  }

  if (records.length === 0) {
    return compact ? (
      <AppCard className={cn("flex flex-1 flex-col justify-center p-4 text-center", className)}>
        <p className="text-xs font-semibold text-foreground">등록된 휴가</p>
        <p className="mt-1 text-[11px] text-muted-foreground">아직 등록된 휴가가 없습니다.</p>
      </AppCard>
    ) : (
      <section className="app-card p-6">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">등록된 휴가</h2>
        <p className="text-sm text-muted-foreground">등록된 휴가가 없습니다.</p>
      </section>
    );
  }

  if (compact) {
    return (
      <AppCard className={cn("flex min-h-0 flex-col overflow-hidden p-2.5", className)}>
        <h2 className="mb-1.5 shrink-0 px-0.5 text-xs font-semibold text-foreground">
          등록된 휴가 ({records.length})
        </h2>
        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-0.5">
          {records.map((record) => (
            <LeaveRecordItem
              key={record.id}
              id={record.id}
              date={record.date}
              type={record.type}
              memo={record.memo}
              compact
            />
          ))}
        </ul>
      </AppCard>
    );
  }

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">등록된 휴가</h2>
      <ul className="space-y-3">
        {records.map((record) => (
          <LeaveRecordItem
            key={record.id}
            id={record.id}
            date={record.date}
            type={record.type}
            memo={record.memo}
          />
        ))}
      </ul>
    </section>
  );
}
