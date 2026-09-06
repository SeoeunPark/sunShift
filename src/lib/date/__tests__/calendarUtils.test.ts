import { describe, expect, it } from "vitest";
import { getCalendarDays, formatMonthYear, shiftMonth } from "../calendarUtils";

describe("calendarUtils", () => {
  it("builds September 2026 calendar grid starting on Sunday", () => {
    const days = getCalendarDays(2026, 9);
    expect(days[0].date).toBe("2026-08-30");
    expect(days.find((day) => day.date === "2026-09-01")?.inCurrentMonth).toBe(true);
    expect(days.filter((day) => day.inCurrentMonth)).toHaveLength(30);
  });

  it("formats month year in Korean style", () => {
    expect(formatMonthYear(2026, 9)).toBe("2026년 9월");
  });

  it("shifts month correctly", () => {
    expect(shiftMonth(2026, 9, 1)).toEqual({ year: 2026, month: 10 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});
