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
      countLeaveDaysInMonth(
        [
          { date: "2026-09-02", type: "annual" },
          { date: "2026-09-10", type: "night_care" },
          { date: "2026-10-01", type: "annual" },
        ],
        2026,
        9,
      ),
    ).toBe(2);
  });

  it("counts leave days by type", () => {
    const records = [
      { date: "2026-09-02", type: "annual" as const },
      { date: "2026-09-10", type: "night_care" as const },
    ];

    expect(countLeaveDaysInMonth(records, 2026, 9, "annual")).toBe(1);
    expect(countLeaveDaysInMonth(records, 2026, 9, "night_care")).toBe(1);
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
