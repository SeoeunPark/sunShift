import { describe, expect, it } from "vitest";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { getMonthlyShiftStats } from "@/lib/shift";
import {
  calculateMonthlyWorkHours,
  compareMonthlyStats,
  countLeaveDaysInMonth,
  getShiftDurationHours,
} from "../statsUtils";

describe("statsUtils", () => {
  it("counts leave days in a month", () => {
    expect(
      countLeaveDaysInMonth(["2026-09-02", "2026-09-10", "2026-10-01"], 2026, 9),
    ).toBe(2);
  });

  it("calculates shift duration hours", () => {
    const definition = DEFAULT_SHIFT_SETTINGS.shiftDefinitions.find((item) => item.code === "C");
    expect(definition).toBeDefined();
    expect(getShiftDurationHours(definition!)).toBe(8);
  });

  it("calculates monthly work hours", () => {
    const hours = calculateMonthlyWorkHours(2026, 9, DEFAULT_SHIFT_SETTINGS);
    const stats = getMonthlyShiftStats(2026, 9, DEFAULT_SHIFT_SETTINGS);
    expect(hours).toBe(stats.totalWorkDays * 8);
  });

  it("compares monthly stats against previous month", () => {
    const current = getMonthlyShiftStats(2026, 9, DEFAULT_SHIFT_SETTINGS);
    const previous = getMonthlyShiftStats(2026, 8, DEFAULT_SHIFT_SETTINGS);
    const comparison = compareMonthlyStats(current, previous, 2, 1);

    expect(comparison).toHaveLength(6);
    expect(comparison[0]?.metric).toBe("A조");
    expect(comparison[0]?.delta).toBe(current.counts.A - previous.counts.A);
  });
});
