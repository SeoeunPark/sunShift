import { getLeaveTypeLabel } from "@/lib/leave/leaveDisplay";
import type { LeaveRecord } from "@/types/local";
import type { ShiftCode, ShiftResult } from "@/lib/shift/shiftTypes";
import { formatMonthYear, getCalendarDays, getWeekdayLabels } from "@/lib/date/calendarUtils";
import { formatKoreanDate, getWeekdayIndex } from "@/lib/date/dateUtils";
import { SHIFT_COLORS } from "@/lib/theme/shiftColors";

export interface ScheduleShareInput {
  year: number;
  month: number;
  scheduleByDate: Map<string, ShiftResult>;
  leaveByDate: Map<string, LeaveRecord>;
}

export function formatScheduleShareText(input: ScheduleShareInput): string {
  const { year, month, scheduleByDate, leaveByDate } = input;
  const days = getCalendarDays(year, month).filter((day) => day.inCurrentMonth);
  const lines = [`SHIFT — ${formatMonthYear(year, month)} 근무표`, ""];

  for (const day of days) {
    const shift = scheduleByDate.get(day.date);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][getWeekdayIndex(day.date)];
    const leave = leaveByDate.get(day.date);
    const leaveMark = leave ? ` · ${getLeaveTypeLabel(leave.type)}` : "";
    const timeRange =
      shift?.startTime && shift.endTime ? ` (${shift.startTime}~${shift.endTime})` : "";

    lines.push(
      `${formatKoreanDate(day.date)} (${weekday}) ${shift?.name ?? "-"}${timeRange}${leaveMark}`,
    );
  }

  lines.push("", "— SHIFT 교대근무 관리");
  return lines.join("\n");
}

export function formatScheduleShareTitle(year: number, month: number): string {
  return `${formatMonthYear(year, month)} 근무표`;
}

export function getShiftShareLabel(code: ShiftCode): string {
  return SHIFT_COLORS[code].label;
}

export function getWeekdayHeaderLabels(): readonly string[] {
  return getWeekdayLabels();
}
