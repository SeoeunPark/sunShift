import { addSeoulDays, buildSeoulDateTime, SEOUL_TIMEZONE } from "@/lib/date/dateUtils";
import { getCyclePosition } from "@/lib/shift/shiftCalculator";
import { getPatternById } from "@/lib/shift/shiftPattern";
import type { CyclePosition, ShiftSettings } from "@/lib/shift/shiftTypes";
import { formatInTimeZone } from "date-fns-tz";

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

export interface SleepWindow {
  cycleDate: string;
  sleep: RecommendedSleep;
  bedDate: string;
  wakeDate: string;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Morning bedtimes (01:00, 05:00, 07:00) fall on the calendar day after the cycle date. */
function isMorningBedTime(bedTime: string): boolean {
  return timeToMinutes(bedTime) < 12 * 60;
}

function isOvernightWake(bedTime: string, wakeTime: string): boolean {
  return timeToMinutes(wakeTime) <= timeToMinutes(bedTime);
}

export function resolveSleepWindow(cycleDate: string, sleep: RecommendedSleep): SleepWindow {
  const bedDate = isMorningBedTime(sleep.bedTime) ? addSeoulDays(cycleDate, 1) : cycleDate;
  const wakeDate = isOvernightWake(sleep.bedTime, sleep.wakeTime)
    ? addSeoulDays(bedDate, 1)
    : bedDate;

  return { cycleDate, sleep, bedDate, wakeDate };
}

function getSeoulDateTimeParts(now: Date): { date: string; time: string } {
  return {
    date: formatInTimeZone(now, SEOUL_TIMEZONE, "yyyy-MM-dd"),
    time: formatInTimeZone(now, SEOUL_TIMEZONE, "HH:mm"),
  };
}

/** Pick the sleep row whose bed/wake window matches now, or the next upcoming bed time. */
export function getCurrentSleepContext(now: Date, settings: ShiftSettings): SleepWindow {
  const { date: today } = getSeoulDateTimeParts(now);
  const nowMs = now.getTime();

  const candidates = [addSeoulDays(today, -2), addSeoulDays(today, -1), today].map(
    (cycleDate) => {
      const sleep = getRecommendedSleepForDate(cycleDate, settings);
      const window = resolveSleepWindow(cycleDate, sleep);
      const bedDateTime = new Date(buildSeoulDateTime(window.bedDate, sleep.bedTime)).getTime();
      const wakeDateTime = new Date(buildSeoulDateTime(window.wakeDate, sleep.wakeTime)).getTime();

      return { window, bedDateTime, wakeDateTime };
    },
  );

  const active = candidates.find(
    ({ bedDateTime, wakeDateTime }) => nowMs >= bedDateTime && nowMs < wakeDateTime,
  );
  if (active) {
    return active.window;
  }

  const upcoming = candidates
    .filter(({ bedDateTime }) => nowMs < bedDateTime)
    .sort((a, b) => a.bedDateTime - b.bedDateTime);
  if (upcoming.length > 0) {
    return upcoming[0].window;
  }

  const recent = candidates
    .filter(({ wakeDateTime }) => nowMs >= wakeDateTime)
    .sort((a, b) => b.wakeDateTime - a.wakeDateTime);
  if (recent.length > 0) {
    return recent[0].window;
  }

  const sleep = getRecommendedSleepForDate(today, settings);
  return resolveSleepWindow(today, sleep);
}

export function getRecommendedSleepNow(now: Date, settings: ShiftSettings): RecommendedSleep {
  return getCurrentSleepContext(now, settings).sleep;
}

export function resolveSleepNotifySlot(
  window: SleepWindow,
  minutesBefore = 60,
): { date: string; time: string } {
  const notifyMinutes = timeToMinutes(window.sleep.bedTime) - minutesBefore;

  if (notifyMinutes >= 0) {
    return { date: window.bedDate, time: minutesToTime(notifyMinutes) };
  }

  return {
    date: addSeoulDays(window.bedDate, -1),
    time: minutesToTime(notifyMinutes),
  };
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
