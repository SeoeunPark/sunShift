import { getCyclePosition } from "@/lib/shift/shiftCalculator";
import { getPatternById } from "@/lib/shift/shiftPattern";
import type { CyclePosition, ShiftSettings } from "@/lib/shift/shiftTypes";

/** Keys aligned with the 꿀잠 시간표 */
export type SleepScheduleKey =
  | "A"
  | "A_TO_B"
  | "B"
  | "B_OFF_1"
  | "B_OFF_2"
  | "C"
  | "C_TO_A";

export interface RecommendedSleep {
  key: SleepScheduleKey;
  label: string;
  bedTime: string;
  wakeTime: string;
}

const SLEEP_SCHEDULE: Record<SleepScheduleKey, Omit<RecommendedSleep, "key">> = {
  A: { label: "A조", bedTime: "21:00", wakeTime: "04:00" },
  A_TO_B: { label: "A→B조", bedTime: "01:00", wakeTime: "09:00" },
  B: { label: "B조", bedTime: "01:00", wakeTime: "08:00" },
  B_OFF_1: { label: "B조 휴무 1일차", bedTime: "05:00", wakeTime: "12:00" },
  B_OFF_2: { label: "B조 휴무 2일차", bedTime: "07:00", wakeTime: "14:00" },
  C: { label: "C조", bedTime: "12:00", wakeTime: "19:00" },
  C_TO_A: { label: "C→A조", bedTime: "21:00", wakeTime: "06:00" },
};

/** Display order for the 꿀잠 시간표 tab */
export const SLEEP_SCHEDULE_ORDER: SleepScheduleKey[] = [
  "A",
  "A_TO_B",
  "B",
  "B_OFF_1",
  "B_OFF_2",
  "C",
  "C_TO_A",
];

export function getAllSleepSchedules(): RecommendedSleep[] {
  return SLEEP_SCHEDULE_ORDER.map((key) => ({ key, ...SLEEP_SCHEDULE[key] }));
}

/** Map cycle position to 꿀잠 시간표 row */
export function resolveSleepScheduleKey(cyclePosition: CyclePosition): SleepScheduleKey {
  const { code, phaseIndex, phaseOffset } = cyclePosition;

  if (code === "A") return "A";
  if (code === "B") return "B";
  if (code === "C") return "C";

  // OFF blocks between shifts
  if (phaseIndex === 1) return "A_TO_B";
  if (phaseIndex === 3) return phaseOffset === 0 ? "B_OFF_1" : "B_OFF_2";
  if (phaseIndex === 5) return "C_TO_A";

  throw new Error(`Unknown sleep schedule for phase ${phaseIndex}`);
}

export function getRecommendedSleep(cyclePosition: CyclePosition): RecommendedSleep {
  const key = resolveSleepScheduleKey(cyclePosition);
  return { key, ...SLEEP_SCHEDULE[key] };
}

export function getRecommendedSleepForDate(
  date: string,
  settings: ShiftSettings,
): RecommendedSleep {
  const pattern = getPatternById(settings.patternId);
  const cyclePosition = getCyclePosition(date, settings);

  // Guard: only the default 4-group pattern is mapped today
  if (pattern.id !== "four-group-6-2") {
    return getRecommendedSleep(cyclePosition);
  }

  return getRecommendedSleep(cyclePosition);
}

/** e.g. "01:00 ~ 08:00" or "21:00 ~ 익일 04:00" */
export function formatSleepTimeRange(bedTime: string, wakeTime: string): string {
  const [bedHour] = bedTime.split(":").map(Number);
  const [wakeHour] = wakeTime.split(":").map(Number);
  const wakeIsNextDay = wakeHour <= bedHour;

  if (wakeIsNextDay) {
    return `${bedTime} ~ 익일 ${wakeTime}`;
  }

  return `${bedTime} ~ ${wakeTime}`;
}

export function formatRecommendedSleep(sleep: RecommendedSleep): string {
  return formatSleepTimeRange(sleep.bedTime, sleep.wakeTime);
}

/** e.g. "15" from "15:00", "01" from "01:00" */
export function formatCompactTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  if (minute === 0) {
    return String(hour).padStart(2, "0");
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** e.g. "15 ~ 23" */
export function formatCompactTimeRange(start: string, end: string): string {
  return `${formatCompactTime(start)} ~ ${formatCompactTime(end)}`;
}

/** e.g. "01 ~ 08" (compact, no 익일 label) */
export function formatCompactSleepRange(bedTime: string, wakeTime: string): string {
  return formatCompactTimeRange(bedTime, wakeTime);
}
