import { addSeoulDays, formatKoreanDateWithWeekday } from "@/lib/date/dateUtils";
import { getTodaySeoul } from "@/lib/date/today";
import {
  formatCompactSleepRange,
  formatCompactTimeRange,
  formatRecommendedSleep,
  getRecommendedSleepNow,
} from "@/lib/sleep/sleepSchedule";
import {
  getCyclePosition,
  getDaysUntilNextOff,
  getNextOffDate,
  getShiftForDate,
} from "@/lib/shift";
import { formatShiftDayLabelWithTotal } from "@/lib/shift/shiftLabels";
import { DEFAULT_SHIFT_SETTINGS, getPatternById } from "@/lib/shift/shiftPattern";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import type { WidgetSnapshot } from "./widgetTypes";

function getSleepDurationHours(bedTime: string, wakeTime: string): number {
  const [bedHour, bedMinute] = bedTime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const bedTotal = bedHour * 60 + bedMinute;
  let wakeTotal = wakeHour * 60 + wakeMinute;

  if (wakeTotal <= bedTotal) {
    wakeTotal += 24 * 60;
  }

  return Math.round((wakeTotal - bedTotal) / 60);
}

function findNextWorkDay(today: string, settings: ShiftSettings) {
  for (let offset = 1; offset <= 365; offset += 1) {
    const date = addSeoulDays(today, offset);
    const shift = getShiftForDate(date, settings);
    if (shift.code === "OFF") {
      continue;
    }

    return {
      date,
      code: shift.code,
      name: shift.name,
      workRange:
        shift.startTime && shift.endTime
          ? formatCompactTimeRange(shift.startTime, shift.endTime)
          : null,
    };
  }

  return null;
}

export function buildWidgetSnapshot(
  settings: ShiftSettings = DEFAULT_SHIFT_SETTINGS,
  options?: { today?: string; now?: Date; origin?: string },
): WidgetSnapshot {
  const today = options?.today ?? getTodaySeoul();
  const now = options?.now ?? new Date();
  const origin = options?.origin ?? "";
  const pattern = getPatternById(settings.patternId);
  const todayShift = getShiftForDate(today, settings);
  const cyclePosition = getCyclePosition(today, settings);
  const sleep = getRecommendedSleepNow(now, settings);
  const nextOffDate = getNextOffDate(today, settings);
  const daysUntilOff = getDaysUntilNextOff(today, settings);
  const nextWork = findNextWorkDay(today, settings);

  const workRange =
    todayShift.code !== "OFF" && todayShift.startTime && todayShift.endTime
      ? formatCompactTimeRange(todayShift.startTime, todayShift.endTime)
      : null;

  const prefix = origin.replace(/\/$/, "");

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    today,
    shift: {
      code: todayShift.code,
      name: todayShift.name,
      cycleLabel: formatShiftDayLabelWithTotal(cyclePosition, pattern),
      workRange,
      isOff: todayShift.code === "OFF",
    },
    sleep: {
      label: sleep.label,
      rangeCompact: formatCompactSleepRange(sleep.bedTime, sleep.wakeTime),
      rangeFull: formatRecommendedSleep(sleep),
      durationHours: getSleepDurationHours(sleep.bedTime, sleep.wakeTime),
    },
    nextOff: nextOffDate
      ? {
          date: nextOffDate,
          daysUntil: daysUntilOff,
        }
      : null,
    nextWork,
    deepLinks: {
      home: `${prefix}/`,
      sleep: `${prefix}/sleep`,
      calendar: `${prefix}/calendar`,
    },
  };
}

/** Human-readable lines for widget mockups / native rendering helpers. */
export function formatWidgetLines(snapshot: WidgetSnapshot, family: "small" | "medium" | "large") {
  const dateLabel = formatKoreanDateWithWeekday(snapshot.today);

  if (family === "small") {
    return {
      primary: snapshot.shift.isOff ? "휴무" : snapshot.shift.code,
      secondary: snapshot.shift.isOff ? snapshot.shift.cycleLabel : snapshot.shift.workRange ?? "-",
      tertiary: snapshot.shift.isOff ? null : snapshot.shift.cycleLabel,
    };
  }

  if (family === "medium") {
    return {
      title: dateLabel,
      leftTitle: snapshot.shift.cycleLabel,
      leftSubtitle: snapshot.shift.isOff ? "휴무" : `근무 ${snapshot.shift.workRange ?? "-"}`,
      rightTitle: "꿀잠",
      rightSubtitle: `${snapshot.sleep.rangeCompact} · ${snapshot.sleep.durationHours}시간`,
      footer: snapshot.nextOff ? `다음 휴무 D-${snapshot.nextOff.daysUntil}` : null,
    };
  }

  return {
    title: dateLabel,
    shiftLine: snapshot.shift.isOff
      ? `${snapshot.shift.cycleLabel} · 휴무`
      : `${snapshot.shift.cycleLabel} · 근무 ${snapshot.shift.workRange ?? "-"}`,
    sleepLine: `취침 ${snapshot.sleep.rangeCompact} (${snapshot.sleep.durationHours}시간)`,
    nextOffLine: snapshot.nextOff
      ? `다음 휴무 D-${snapshot.nextOff.daysUntil}`
      : "다음 휴무 -",
    nextWorkLine: snapshot.nextWork
      ? `다음 근무 ${snapshot.nextWork.name}`
      : "다음 근무 -",
  };
}
