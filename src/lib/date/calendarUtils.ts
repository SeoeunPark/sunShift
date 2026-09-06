import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { parseSeoulDate, formatSeoulDate } from "./dateUtils";

export interface CalendarDay {
  date: string;
  day: number;
  inCurrentMonth: boolean;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/** Build calendar grid (Sunday start) for a given month */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const monthStart = startOfMonth(parseSeoulDate(`${year}-${String(month).padStart(2, "0")}-01`));
  const monthEnd = endOfMonth(monthStart);

  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const days: CalendarDay[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    const date = formatSeoulDate(cursor);
    days.push({
      date,
      day: cursor.getDate(),
      inCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
    });
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function formatMonthYear(year: number, month: number): string {
  return format(parseSeoulDate(`${year}-${String(month).padStart(2, "0")}-01`), "yyyy년 M월");
}

export function getMonthFromDate(dateStr: string): { year: number; month: number } {
  const [year, month] = dateStr.split("-").map(Number);
  return { year, month };
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = parseSeoulDate(`${year}-${String(month).padStart(2, "0")}-01`);
  const shifted = addMonths(date, delta);
  return getMonthFromDate(formatSeoulDate(shifted));
}
