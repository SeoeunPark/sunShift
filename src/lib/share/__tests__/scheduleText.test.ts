import { describe, expect, it } from "vitest";
import { getMonthSchedule } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import {
  formatScheduleShareText,
  formatScheduleShareTitle,
  type ScheduleShareInput,
} from "../scheduleText";

function buildInput(year: number, month: number, leaveDates: string[] = []): ScheduleShareInput {
  const schedule = getMonthSchedule(year, month, DEFAULT_SHIFT_SETTINGS);

  return {
    year,
    month,
    scheduleByDate: new Map(schedule.map((day) => [day.date, day])),
    leaveDates: new Set(leaveDates),
  };
}

describe("schedule share text", () => {
  it("formats month schedule as shareable text", () => {
    const text = formatScheduleShareText(buildInput(2026, 9));

    expect(text).toContain("2026년 9월");
    expect(text).toContain("9월 2일");
    expect(text).toContain("B조");
    expect(text).toContain("SHIFT");
  });

  it("marks leave days in shared text", () => {
    const text = formatScheduleShareText(buildInput(2026, 9, ["2026-09-02"]));

    expect(text).toContain("9월 2일");
    expect(text).toContain("연차");
  });

  it("builds share title", () => {
    expect(formatScheduleShareTitle(2026, 9)).toBe("2026년 9월 근무표");
  });
});
