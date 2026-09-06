import { getRecommendedSleepForDate } from "@/lib/sleep/sleepSchedule";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import { buildSleepNotification, type PlannedNotification } from "./notificationMessages";
import { getSeoulDateTimeParts, subtractMinutesFromTime } from "./notificationPlanner";

export interface SleepPlannerInput {
  now: Date;
  sleepEnabled: boolean;
  shiftSettings: ShiftSettings;
  leaveDates: string[];
}

export function planSleepNotifications(input: SleepPlannerInput): PlannedNotification[] {
  const { now, sleepEnabled, shiftSettings, leaveDates } = input;

  if (!sleepEnabled) {
    return [];
  }

  const leaveSet = new Set(leaveDates);
  const { date: today, time: currentTime } = getSeoulDateTimeParts(now);

  if (leaveSet.has(today)) {
    return [];
  }

  const recommended = getRecommendedSleepForDate(today, shiftSettings);
  const notifyTime = subtractMinutesFromTime(recommended.bedTime, 60);

  if (currentTime !== notifyTime) {
    return [];
  }

  return [buildSleepNotification(recommended, today)];
}
