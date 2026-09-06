import { describe, expect, it } from "vitest";
import { getCyclePosition } from "@/lib/shift/shiftCalculator";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import {
  formatCompactSleepRange,
  formatCompactTimeRange,
  formatRecommendedSleep,
  formatSleepTimeRange,
  getAllSleepSchedules,
  getRecommendedSleepForDate,
  resolveSleepScheduleKey,
} from "@/lib/sleep/sleepSchedule";

const settings = DEFAULT_SHIFT_SETTINGS;

describe("sleepSchedule", () => {
  it("maps B shift day to B조 꿀잠", () => {
    const sleep = getRecommendedSleepForDate("2026-09-06", settings);
    expect(sleep.label).toBe("B조");
    expect(formatRecommendedSleep(sleep)).toBe("01:00 ~ 08:00");
  });

  it("maps first OFF after B to B조 휴무 1일차", () => {
    const sleep = getRecommendedSleepForDate("2026-09-08", settings);
    expect(sleep.label).toBe("B조 휴무 1일차");
    expect(formatRecommendedSleep(sleep)).toBe("05:00 ~ 12:00");
  });

  it("maps second OFF after B to B조 휴무 2일차", () => {
    const sleep = getRecommendedSleepForDate("2026-09-09", settings);
    expect(sleep.label).toBe("B조 휴무 2일차");
    expect(formatRecommendedSleep(sleep)).toBe("07:00 ~ 14:00");
  });

  it("maps C shift to C조 꿀잠", () => {
    const sleep = getRecommendedSleepForDate("2026-09-10", settings);
    expect(sleep.label).toBe("C조");
    expect(formatRecommendedSleep(sleep)).toBe("12:00 ~ 19:00");
  });

  it("maps OFF after C to C→A조", () => {
    const sleep = getRecommendedSleepForDate("2026-09-16", settings);
    expect(sleep.label).toBe("C→A조");
    expect(formatRecommendedSleep(sleep)).toBe("21:00 ~ 익일 06:00");
  });

  it("maps A shift to A조 with next-day wake", () => {
    const sleep = getRecommendedSleepForDate("2026-09-18", settings);
    expect(sleep.label).toBe("A조");
    expect(formatRecommendedSleep(sleep)).toBe("21:00 ~ 익일 04:00");
  });

  it("maps OFF after A to A→B조", () => {
    const sleep = getRecommendedSleepForDate("2026-09-01", settings);
    expect(sleep.label).toBe("A→B조");
    expect(formatRecommendedSleep(sleep)).toBe("01:00 ~ 09:00");
  });

  it("resolves schedule key from cycle position", () => {
    const position = getCyclePosition("2026-09-06", settings);
    expect(resolveSleepScheduleKey(position)).toBe("B");
  });

  it("formats overnight sleep ranges", () => {
    expect(formatSleepTimeRange("21:00", "04:00")).toBe("21:00 ~ 익일 04:00");
    expect(formatSleepTimeRange("01:00", "08:00")).toBe("01:00 ~ 08:00");
  });

  it("lists all schedules in display order", () => {
    const schedules = getAllSleepSchedules();
    expect(schedules).toHaveLength(7);
    expect(schedules[0]?.label).toBe("A조");
    expect(schedules[2]?.label).toBe("B조");
  });

  it("formats compact time ranges for home display", () => {
    expect(formatCompactTimeRange("15:00", "23:00")).toBe("15 ~ 23");
    expect(formatCompactSleepRange("01:00", "08:00")).toBe("01 ~ 08");
  });
});
