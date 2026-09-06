import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export const SEOUL_TIMEZONE = "Asia/Seoul";

/** Parse YYYY-MM-DD as a calendar date in Asia/Seoul */
export function parseSeoulDate(dateStr: string): Date {
  return toZonedTime(`${dateStr}T00:00:00`, SEOUL_TIMEZONE);
}

/** Format a Date to YYYY-MM-DD in Asia/Seoul */
export function formatSeoulDate(date: Date): string {
  return formatInTimeZone(date, SEOUL_TIMEZONE, "yyyy-MM-dd");
}

/** Calendar day difference (target - base) in Asia/Seoul */
export function getDayDifference(baseDateStr: string, targetDateStr: string): number {
  const base = parseSeoulDate(baseDateStr);
  const target = parseSeoulDate(targetDateStr);
  return differenceInCalendarDays(target, base);
}

/** Add calendar days to a YYYY-MM-DD string */
export function addSeoulDays(dateStr: string, days: number): string {
  const date = parseSeoulDate(dateStr);
  return formatSeoulDate(addDays(date, days));
}

/** Format date for display: M월 d일 */
export function formatKoreanDate(dateStr: string): string {
  const date = parseSeoulDate(dateStr);
  return format(date, "M월 d일");
}

/** Format date with weekday: yyyy년 M월 d일 EEEE */
export function formatKoreanDateWithWeekday(dateStr: string): string {
  const date = parseSeoulDate(dateStr);
  return format(date, "yyyy년 M월 d일 EEEE", { locale: ko });
}

/** Get weekday index (0=Sunday) for a date string */
export function getWeekdayIndex(dateStr: string): number {
  return parseSeoulDate(dateStr).getDay();
}

/** Build ISO datetime string in Seoul timezone */
export function buildSeoulDateTime(dateStr: string, time: string): string {
  return `${dateStr}T${time}:00+09:00`;
}

/** Normalize input to YYYY-MM-DD */
export function toDateString(input: string | Date): string {
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }
    return formatSeoulDate(parseISO(input));
  }
  return formatSeoulDate(input);
}
