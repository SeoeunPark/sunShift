import { addSeoulDays } from "@/lib/date/dateUtils";
import {
  getRecommendedSleepForDate,
  resolveSleepNotifySlot,
  resolveSleepWindow,
} from "@/lib/sleep/sleepSchedule";
import { buildSleepNotification, type PlannedNotification } from "./notificationMessages";
import {
  getSeoulDateTimeParts,
  hasNotifySlotStarted,
  NOTIFY_CATCHUP_MINUTES,
} from "./notificationPlanner";

const SLEEP_NOTIFY_CATCHUP_MINUTES = 180;
import type { ShiftSettings } from "@/lib/shift/shiftTypes";

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
  const planned: PlannedNotification[] = [];

  for (const cycleDate of [addSeoulDays(today, -1), today]) {
    const sleep = getRecommendedSleepForDate(cycleDate, shiftSettings);
    const window = resolveSleepWindow(cycleDate, sleep);
    const notifySlot = resolveSleepNotifySlot(window, 60);

    if (leaveSet.has(cycleDate) || leaveSet.has(notifySlot.date)) {
      continue;
    }

    if (
      !hasNotifySlotStarted(
        today,
        currentTime,
        notifySlot,
        Math.min(NOTIFY_CATCHUP_MINUTES, SLEEP_NOTIFY_CATCHUP_MINUTES),
      )
    ) {
      continue;
    }

    planned.push(buildSleepNotification(sleep, cycleDate));
  }

  return planned;
}
