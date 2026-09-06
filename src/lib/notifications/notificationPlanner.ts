import { addMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addSeoulDays, formatSeoulDate, SEOUL_TIMEZONE } from "@/lib/date/dateUtils";
import { getShiftForDate } from "@/lib/shift";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import type { NotificationSettings } from "@/types/local";
import {
  buildTodayShiftNotification,
  buildTomorrowShiftNotification,
  type PlannedNotification,
} from "./notificationMessages";

/** Minutes before shift start for today's work reminder */
export const TODAY_WORK_NOTICE_MINUTES = 60;

/** Hours before tomorrow's shift start; if that falls on tomorrow, use fallback time instead */
export const TOMORROW_WORK_NOTICE_HOURS_BEFORE = 12;

/** Evening fallback for next-day work preview when 12h-before falls on the work day itself */
export const TOMORROW_WORK_NOTICE_FALLBACK_TIME = "20:00";

export interface NotificationPlannerInput {
  now: Date;
  settings: NotificationSettings;
  shiftSettings: ShiftSettings;
  leaveDates: string[];
}

export interface NotifySlot {
  date: string;
  time: string;
}

export function getSeoulDateTimeParts(now: Date): { date: string; time: string } {
  return {
    date: formatInTimeZone(now, SEOUL_TIMEZONE, "yyyy-MM-dd"),
    time: formatInTimeZone(now, SEOUL_TIMEZONE, "HH:mm"),
  };
}

export function normalizeTimeToHm(time: string): string {
  return time.slice(0, 5);
}

export function subtractMinutesFromTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins - minutes;
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

export function subtractMinutesFromDateTime(
  date: string,
  time: string,
  minutes: number,
): NotifySlot {
  const normalized = normalizeTimeToHm(time);
  const base = toZonedTime(`${date}T${normalized}:00`, SEOUL_TIMEZONE);
  const result = addMinutes(base, -minutes);

  return {
    date: formatSeoulDate(result),
    time: formatInTimeZone(result, SEOUL_TIMEZONE, "HH:mm"),
  };
}

export function getTodayWorkNotifySlot(date: string, startTime: string): NotifySlot {
  return {
    date,
    time: subtractMinutesFromTime(normalizeTimeToHm(startTime), TODAY_WORK_NOTICE_MINUTES),
  };
}

export function getTomorrowWorkNotifySlot(
  today: string,
  tomorrow: string,
  startTime: string,
): NotifySlot {
  const advanced = subtractMinutesFromDateTime(
    tomorrow,
    startTime,
    TOMORROW_WORK_NOTICE_HOURS_BEFORE * 60,
  );

  if (advanced.date === today) {
    return advanced;
  }

  return {
    date: today,
    time: TOMORROW_WORK_NOTICE_FALLBACK_TIME,
  };
}

/** Pre-day work notify time for a shift start (date pair only affects fallback logic). */
export function getPreDayWorkNotifyTime(startTime: string): string {
  const slot = getTomorrowWorkNotifySlot("2026-01-01", "2026-01-02", startTime);
  return slot.time;
}

function matchesCurrentSlot(
  currentDate: string,
  currentTime: string,
  slot: NotifySlot,
): boolean {
  return currentDate === slot.date && currentTime === slot.time;
}

export function planNotifications(input: NotificationPlannerInput): PlannedNotification[] {
  const { now, settings, shiftSettings, leaveDates } = input;
  const leaveSet = new Set(leaveDates);
  const { date: today, time: currentTime } = getSeoulDateTimeParts(now);
  const tomorrow = addSeoulDays(today, 1);
  const todayShift = getShiftForDate(today, shiftSettings);
  const tomorrowShift = getShiftForDate(tomorrow, shiftSettings);
  const planned: PlannedNotification[] = [];

  const hasLeaveToday = leaveSet.has(today);
  const hasLeaveTomorrow = leaveSet.has(tomorrow);

  const todayNotification =
    settings.todayEnabled &&
    !hasLeaveToday &&
    todayShift.code !== "OFF" &&
    todayShift.startTime &&
    matchesCurrentSlot(
      today,
      currentTime,
      getTodayWorkNotifySlot(today, todayShift.startTime),
    )
      ? buildTodayShiftNotification(todayShift, TODAY_WORK_NOTICE_MINUTES)
      : null;

  const tomorrowNotification =
    settings.tomorrowEnabled &&
    !hasLeaveTomorrow &&
    tomorrowShift.code !== "OFF" &&
    tomorrowShift.startTime &&
    matchesCurrentSlot(
      today,
      currentTime,
      getTomorrowWorkNotifySlot(today, tomorrow, tomorrowShift.startTime),
    )
      ? buildTomorrowShiftNotification(tomorrowShift)
      : null;

  if (todayNotification && tomorrowNotification) {
    planned.push(todayNotification);
  } else {
    if (todayNotification) planned.push(todayNotification);
    if (tomorrowNotification) planned.push(tomorrowNotification);
  }

  return planned;
}
