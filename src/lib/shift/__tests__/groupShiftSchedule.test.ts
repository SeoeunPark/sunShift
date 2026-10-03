import { describe, expect, it } from "vitest";
import { getAllGroupsShiftForDate, shiftSettingsForGroup } from "../groupShiftSchedule";
import { getGroupShiftPreset } from "../groupPresets";
import { DEFAULT_FOUR_GROUP_PATTERN, DEFAULT_SHIFT_DEFINITIONS } from "../shiftPattern";
import { getShiftForDate } from "../shiftCalculator";
import type { ShiftSettings } from "../shiftTypes";

const settingsForGroup4: ShiftSettings = {
  ...getGroupShiftPreset(4),
  patternId: DEFAULT_FOUR_GROUP_PATTERN.id,
  shiftDefinitions: DEFAULT_SHIFT_DEFINITIONS,
};

describe("getAllGroupsShiftForDate", () => {
  it("returns four groups with distinct shifts on a sample date", () => {
    const rows = getAllGroupsShiftForDate("2026-09-10", settingsForGroup4);

    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.groupNumber)).toEqual([1, 2, 3, 4]);
    expect(rows.find((row) => row.groupNumber === 4)?.isMine).toBe(true);
    expect(rows.find((row) => row.groupNumber === 1)?.isMine).toBe(false);
    expect(new Set(rows.map((row) => row.shift.code)).size).toBeGreaterThan(1);
  });

  it("matches per-group calculator for each row", () => {
    const date = "2026-09-18";
    const rows = getAllGroupsShiftForDate(date, settingsForGroup4);

    for (const row of rows) {
      const expected = getShiftForDate(date, shiftSettingsForGroup(row.groupNumber, settingsForGroup4));
      expect(row.shift.code).toBe(expected.code);
      expect(row.shift.name).toBe(expected.name);
    }
  });
});
