import type { ShiftResult } from "@/lib/shift/shiftTypes";
import { getWeekdayIndex } from "@/lib/date/dateUtils";
import { getKoreanHoliday } from "@/lib/date/koreanHolidays";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { LEAVE_COLOR } from "@/lib/theme/shiftColors";
import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
  date: string;
  day: number;
  today: string;
  inCurrentMonth: boolean;
  shift?: ShiftResult;
  hasLeave?: boolean;
  hasMemo?: boolean;
  compact?: boolean;
  onSelect: (date: string) => void;
}

export function CalendarDayCell({
  date,
  day,
  today,
  inCurrentMonth,
  shift,
  hasLeave,
  hasMemo,
  compact = false,
  onSelect,
}: CalendarDayCellProps) {
  const isToday = date === today;
  const weekday = getWeekdayIndex(date);
  const isSunday = weekday === 0;
  const isSaturday = weekday === 6;
  const holidayName = getKoreanHoliday(date);
  const isHoliday = Boolean(holidayName);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect(date)}
        aria-label={`${date} ${shift?.name ?? ""}${holidayName ? ` ${holidayName}` : ""}`}
        className={cn(
          "flex h-full min-h-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-border/50 px-0.5 py-1 text-center transition-all",
          inCurrentMonth ? "bg-card/90" : "bg-muted/15 text-muted-foreground/60",
          isToday && "border-primary/60 bg-primary/[0.06] ring-1 ring-primary/25 shadow-sm",
          "active:scale-[0.97]",
        )}
      >
        <span
          className={cn(
            "text-xs font-medium leading-none",
            (isHoliday || isSunday) && inCurrentMonth && "text-red-500",
            isSaturday && inCurrentMonth && !isHoliday && "text-blue-500",
            isToday && "font-bold",
          )}
        >
          {day}
        </span>
        {shift && inCurrentMonth && (
          <ShiftBadge code={shift.code} size="sm" className="min-w-[1.75rem] px-1.5 py-0 text-[11px]" />
        )}
        {(hasLeave || hasMemo) && inCurrentMonth && (
          <span className="flex gap-0.5">
            {hasLeave && (
              <span className={cn("size-1.5 rounded-full", LEAVE_COLOR.bg)} aria-label="연차" />
            )}
            {hasMemo && (
              <span className="size-1.5 rounded-full bg-primary" aria-label="메모" />
            )}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      aria-label={`${date} ${shift?.name ?? ""}${holidayName ? ` ${holidayName}` : ""}`}
      className={cn(
        "flex min-h-[5rem] flex-col items-center gap-0.5 rounded-xl border border-border/60 p-1 text-center transition-all",
        inCurrentMonth ? "bg-card/90 shadow-sm" : "bg-muted/20 text-muted-foreground",
        isToday && "border-primary/60 bg-primary/[0.04] ring-2 ring-primary/20 shadow-md",
        "hover:bg-accent/40 active:scale-[0.98]",
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          (isHoliday || isSunday) && inCurrentMonth && "text-red-500",
          isSaturday && inCurrentMonth && !isHoliday && "text-blue-500",
          isToday && "font-bold",
        )}
      >
        {day}
      </span>

      {holidayName && inCurrentMonth && (
        <span className="max-w-full truncate text-[9px] font-medium leading-none text-red-500">
          {holidayName}
        </span>
      )}

      {shift && inCurrentMonth && (
        <ShiftBadge code={shift.code} size="sm" className="scale-90" />
      )}

      <div className="flex min-h-[0.875rem] items-center gap-1">
        {hasLeave && inCurrentMonth && (
          <span
            className={cn(
              "rounded px-1 text-[10px] font-medium leading-none",
              LEAVE_COLOR.bg,
              LEAVE_COLOR.text,
            )}
          >
            연차
          </span>
        )}
        {hasMemo && inCurrentMonth && (
          <span className="size-1.5 rounded-full bg-primary" aria-label="메모 있음" />
        )}
      </div>
    </button>
  );
}
