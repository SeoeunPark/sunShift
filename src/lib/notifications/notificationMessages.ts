import type { RecommendedSleep } from "@/lib/sleep/sleepSchedule";
import { formatRecommendedSleep } from "@/lib/sleep/sleepSchedule";
import { APP_DISPLAY_NAME } from "@/lib/brand/appName";
import type { ShiftResult } from "@/lib/shift/shiftTypes";

export type NotificationKind =
  | "today_shift"
  | "tomorrow_shift"
  | "before_shift"
  | "off_day"
  | "leave_tomorrow"
  | "sleep";

export interface PlannedNotification {
  kind: NotificationKind;
  title: string;
  body: string;
  data: {
    kind: NotificationKind;
    date: string;
  };
}

function formatShiftTimeRange(shift: ShiftResult): string {
  if (!shift.startTime || !shift.endTime) {
    return "";
  }
  return `\n${shift.startTime} ~ ${shift.endTime}`;
}

export function buildTodayShiftNotification(
  shift: ShiftResult,
  minutesBefore = 60,
): PlannedNotification {
  return {
    kind: "today_shift",
    title: APP_DISPLAY_NAME,
    body: `${minutesBefore}분 후 ${shift.name} 근무입니다.${formatShiftTimeRange(shift)}`,
    data: { kind: "today_shift", date: shift.date },
  };
}

export function buildTomorrowShiftNotification(shift: ShiftResult): PlannedNotification {
  return {
    kind: "tomorrow_shift",
    title: APP_DISPLAY_NAME,
    body: `내일은 ${shift.name} 근무입니다.${formatShiftTimeRange(shift)}`,
    data: { kind: "tomorrow_shift", date: shift.date },
  };
}

export function buildBeforeShiftNotification(shift: ShiftResult, minutes: number): PlannedNotification {
  return {
    kind: "before_shift",
    title: APP_DISPLAY_NAME,
    body: `${minutes}분 후 ${shift.name} 출근입니다.${formatShiftTimeRange(shift)}`,
    data: { kind: "before_shift", date: shift.date },
  };
}

export function buildOffDayNotification(date: string): PlannedNotification {
  return {
    kind: "off_day",
    title: APP_DISPLAY_NAME,
    body: "오늘은 휴무입니다. 💤",
    data: { kind: "off_day", date },
  };
}

export function buildLeaveTomorrowNotification(date: string): PlannedNotification {
  return {
    kind: "leave_tomorrow",
    title: APP_DISPLAY_NAME,
    body: "내일은 연차입니다.",
    data: { kind: "leave_tomorrow", date },
  };
}

export function buildSleepNotification(
  sleep: RecommendedSleep,
  date: string,
): PlannedNotification {
  return {
    kind: "sleep",
    title: APP_DISPLAY_NAME,
    body: `${sleep.label} 취침 1시간 전입니다. ${formatRecommendedSleep(sleep)}`,
    data: { kind: "sleep", date },
  };
}
