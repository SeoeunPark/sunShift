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

/** Max minutes after scheduled time to still send (5-min cron + delay slack) */
export const NOTIFY_CATCHUP_MINUTES = 45;

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

export function notifySlotToDate(slot: NotifySlot): Date {
  return toZonedTime(`${slot.date}T${normalizeTimeToHm(slot.time)}:00`, SEOUL_TIMEZONE);
}

/** Minutes elapsed since the scheduled notify time (negative = not yet). */
export function getMinutesSinceNotifySlot(now: Date, slot: NotifySlot): number {
  const slotStart = notifySlotToDate(slot);
  const nowZoned = toZonedTime(now, SEOUL_TIMEZONE);
  return (nowZoned.getTime() - slotStart.getTime()) / (60 * 1000);
}

export function getMinutesUntilShiftStart(now: Date, date: string, startTime: string): number {
  const start = toZonedTime(`${date}T${normalizeTimeToHm(startTime)}:00`, SEOUL_TIMEZONE);
  const nowZoned = toZonedTime(now, SEOUL_TIMEZONE);
  return Math.round((start.getTime() - nowZoned.getTime()) / (60 * 1000));
}

/** True once the scheduled notify time has started (supports short cron catch-up). */
export function hasNotifySlotStarted(
  now: Date,
  slot: NotifySlot,
  catchupMinutes = NOTIFY_CATCHUP_MINUTES,
): boolean {
  const elapsed = getMinutesSinceNotifySlot(now, slot);
  return elapsed >= 0 && elapsed <= catchupMinutes;
}

export function isNotifySlotUpcoming(now: Date, slot: NotifySlot): boolean {
  return getMinutesSinceNotifySlot(now, slot) < 0;
}

export function planNotifications(input: NotificationPlannerInput): PlannedNotification[] {
  const { now, settings, shiftSettings, leaveDates } = input;
  const leaveSet = new Set(leaveDates);
  const { date: today } = getSeoulDateTimeParts(now);
  const tomorrow = addSeoulDays(today, 1);
  const todayShift = getShiftForDate(today, shiftSettings);
  const tomorrowShift = getShiftForDate(tomorrow, shiftSettings);
  const planned: PlannedNotification[] = [];

  const hasLeaveToday = leaveSet.has(today);
  const hasLeaveTomorrow = leaveSet.has(tomorrow);

  const todaySlot =
    todayShift.startTime && getTodayWorkNotifySlot(today, todayShift.startTime);
  const todayNotification =
    settings.todayEnabled &&
    !hasLeaveToday &&
    todayShift.code !== "OFF" &&
    todaySlot &&
    hasNotifySlotStarted(now, todaySlot)
      ? buildTodayShiftNotification(
          todayShift,
          Math.min(
            TODAY_WORK_NOTICE_MINUTES,
            Math.max(1, getMinutesUntilShiftStart(now, today, todayShift.startTime!)),
          ),
        )
      : null;

  const tomorrowSlot =
    tomorrowShift.startTime &&
    getTomorrowWorkNotifySlot(today, tomorrow, tomorrowShift.startTime);
  const tomorrowNotification =
    settings.tomorrowEnabled &&
    !hasLeaveTomorrow &&
    tomorrowShift.code !== "OFF" &&
    tomorrowSlot &&
    hasNotifySlotStarted(now, tomorrowSlot)
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
