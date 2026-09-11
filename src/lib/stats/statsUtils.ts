import type { LeaveType } from "@/lib/leave/leaveTypes";
import { getMonthSchedule } from "@/lib/shift";
import { getShiftDefinition } from "@/lib/shift/shiftPattern";
import type { ShiftDefinition, ShiftSettings, MonthlyShiftStats } from "@/lib/shift/shiftTypes";
import type { LeaveRecord } from "@/types/local";

export function countLeaveDaysInMonth(
  leaveRecords: Pick<LeaveRecord, "date" | "type">[],
  year: number,
  month: number,
  type?: LeaveType,
): number {
  return leaveRecords.filter((record) => {
    const [y, m] = record.date.split("-").map(Number);
    if (y !== year || m !== month) {
      return false;
    }
    return type ? record.type === type : true;
  }).length;
}

export function getShiftDurationHours(definition: ShiftDefinition): number {
  if (!definition.startTime || !definition.endTime) {
    return 0;
  }

  const [startHour, startMinute] = definition.startTime.split(":").map(Number);
  const [endHour, endMinute] = definition.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

export function calculateMonthlyWorkHours(
  year: number,
  month: number,
  settings: ShiftSettings,
): number {
  const schedule = getMonthSchedule(year, month, settings);

  return schedule.reduce((total, day) => {
    if (day.code === "OFF") {
      return total;
    }

    const definition = getShiftDefinition(settings, day.code);
    return total + getShiftDurationHours(definition);
  }, 0);
}

export interface MonthComparison {
  metric: string;
  current: number;
  previous: number;
  delta: number;
}

export function compareMonthlyStats(
  current: MonthlyShiftStats,
  previous: MonthlyShiftStats,
  currentLeaveCount: number,
  previousLeaveCount: number,
): MonthComparison[] {
  return [
    {
      metric: "A조",
      current: current.counts.A,
      previous: previous.counts.A,
      delta: current.counts.A - previous.counts.A,
    },
    {
      metric: "B조",
      current: current.counts.B,
      previous: previous.counts.B,
      delta: current.counts.B - previous.counts.B,
    },
    {
      metric: "C조",
      current: current.counts.C,
      previous: previous.counts.C,
      delta: current.counts.C - previous.counts.C,
    },
    {
      metric: "휴무",
      current: current.counts.OFF,
      previous: previous.counts.OFF,
      delta: current.counts.OFF - previous.counts.OFF,
    },
    {
      metric: "야간",
      current: current.nightShiftCount,
      previous: previous.nightShiftCount,
      delta: current.nightShiftCount - previous.nightShiftCount,
    },
    {
      metric: "연차",
      current: currentLeaveCount,
      previous: previousLeaveCount,
      delta: currentLeaveCount - previousLeaveCount,
    },
  ];
}

export interface YearMonthSummary {
  year: number;
  month: number;
  totalWorkDays: number;
  totalOffDays: number;
}

export function buildYearSummaries(
  year: number,
  settings: ShiftSettings,
): YearMonthSummary[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const schedule = getMonthSchedule(year, month, settings);
    const totalWorkDays = schedule.filter((day) => day.code !== "OFF").length;
    const totalOffDays = schedule.filter((day) => day.code === "OFF").length;

    return {
      year,
      month,
      totalWorkDays,
      totalOffDays,
    };
  });
}
