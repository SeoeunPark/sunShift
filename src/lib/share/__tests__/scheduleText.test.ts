import { describe, expect, it } from "vitest";
import { getMonthSchedule } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { LeaveRecord } from "@/types/local";
import {
  formatScheduleShareText,
  formatScheduleShareTitle,
  type ScheduleShareInput,
} from "../scheduleText";

function buildInput(
  year: number,
  month: number,
  leaves: Array<Pick<LeaveRecord, "date" | "type">> = [],
): ScheduleShareInput {
  const schedule = getMonthSchedule(year, month, DEFAULT_SHIFT_SETTINGS);

  return {
    year,
    month,
    scheduleByDate: new Map(schedule.map((day) => [day.date, day])),
    leaveByDate: new Map(
      leaves.map((leave, index) => [
        leave.date,
        {
          id: `leave-${index}`,
          userId: "user-1",
          date: leave.date,
          type: leave.type,
          memo: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    ),
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
    const text = formatScheduleShareText(
      buildInput(2026, 9, [{ date: "2026-09-02", type: "annual" }]),
    );

    expect(text).toContain("9월 2일");
    expect(text).toContain("연중");
  });

  it("marks night care leave in shared text", () => {
    const text = formatScheduleShareText(
      buildInput(2026, 9, [{ date: "2026-09-02", type: "night_care" }]),
    );

    expect(text).toContain("야간케어");
  });

  it("builds share title", () => {
    expect(formatScheduleShareTitle(2026, 9)).toBe("2026년 9월 근무표");
  });
});
