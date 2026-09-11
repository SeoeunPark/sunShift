"use client";

import Link from "next/link";
import {
  getNextOffDate,
  getShiftForDate,
} from "@/lib/shift";
import {
  addSeoulDays,
  formatKoreanDate,
  formatKoreanDateWithWeekday,
  getWeekdayIndex,
} from "@/lib/date/dateUtils";
import { getKoreanHoliday } from "@/lib/date/koreanHolidays";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftResult, ShiftSettings } from "@/lib/shift/shiftTypes";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { getLeaveTypeColors, getLeaveTypeLabel } from "@/lib/leave/leaveDisplay";
import { cn } from "@/lib/utils";
import { useLeave } from "@/hooks/useLeave";
import { useMemos } from "@/hooks/useMemos";
import { useShiftSettings } from "@/hooks/useShiftSettings";

interface DateDetailSheetProps {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTimeLabel(iso: string | null): string {
  if (!iso) return "-";
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return iso;
  const [, datePart, time] = match;
  return `${formatKoreanDate(datePart)} ${time}`;
}

function getNextWorkAfterDate(date: string, settings: ShiftSettings): ShiftResult {
  for (let i = 1; i <= 365; i++) {
    const cursor = addSeoulDays(date, i);
    const shift = getShiftForDate(cursor, settings);
    if (shift.code !== "OFF") {
      return shift;
    }
  }
  return getShiftForDate(date, settings);
}

function getShiftDetail(date: string, settings: ShiftSettings) {
  const shift = getShiftForDate(date, settings);
  const nextOffDate = getNextOffDate(date, settings);
  const nextWork = getNextWorkAfterDate(date, settings);

  return { shift, nextWork, nextOffDate };
}

export function DateDetailSheet({ date, open, onOpenChange }: DateDetailSheetProps) {
  const { settings } = useShiftSettings();
  const { getByDate: getLeaveByDate } = useLeave();
  const { getByDate: getMemoByDate } = useMemos();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  if (!date) {
    return null;
  }

  const { shift, nextWork, nextOffDate } = getShiftDetail(date, shiftSettings);
  const leave = getLeaveByDate(date);
  const memo = getMemoByDate(date);
  const holidayName = getKoreanHoliday(date);
  const isSunday = getWeekdayIndex(date) === 0;
  const isSaturday = getWeekdayIndex(date) === 6;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className={cn(isSunday && "text-red-500", isSaturday && "text-blue-500")}>
            {formatKoreanDateWithWeekday(date)}
          </SheetTitle>
          <SheetDescription>날짜별 근무 상세</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          {holidayName && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
              {holidayName}
            </Badge>
          )}

          <div className="flex items-center gap-3">
            <ShiftBadge code={shift.code} size="lg" />
            <div>
              <p className="text-xl font-bold">{shift.name}</p>
              {shift.label && shift.code !== "OFF" && (
                <p className="text-sm text-muted-foreground">{shift.label}</p>
              )}
            </div>
          </div>

          {shift.startTime && shift.endTime && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{shift.startTime} ~ {shift.endTime}</p>
              {shift.code === "C" && shift.startDateTime && shift.endDateTime && (
                <dl className="mt-3 space-y-2 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>출근</dt>
                    <dd>{formatDateTimeLabel(shift.startDateTime)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>퇴근</dt>
                    <dd>{formatDateTimeLabel(shift.endDateTime)}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}

          {shift.code === "OFF" && (
            <p className="text-muted-foreground">휴무일입니다</p>
          )}

          {leave && (
            <Badge
              className={cn(
                getLeaveTypeColors(leave.type).bg,
                getLeaveTypeColors(leave.type).text,
                getLeaveTypeColors(leave.type).border,
              )}
            >
              {getLeaveTypeLabel(leave.type)}
            </Badge>
          )}

          {memo && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="mb-1 text-xs font-medium text-muted-foreground">메모</p>
              <p className="whitespace-pre-wrap">{memo.content}</p>
            </div>
          )}

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">다음 근무</dt>
              <dd>
                {formatKoreanDate(nextWork.date)} {nextWork.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">다음 휴무</dt>
              <dd>{formatKoreanDate(nextOffDate)}</dd>
            </div>
          </dl>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Link
            href={`/leave?date=${date}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            휴가 등록
          </Link>
          <Link
            href={`/memo?date=${date}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            {memo ? "메모 수정" : "메모 추가"}
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
