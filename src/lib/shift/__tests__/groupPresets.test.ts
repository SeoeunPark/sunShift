import { describe, expect, it } from "vitest";
import { getShiftForDate } from "../shiftCalculator";
import {
  formatGroupPresetLongLabel,
  formatGroupPresetSummary,
  getGroupShiftPreset,
  GROUP_SHIFT_PRESETS,
} from "../groupPresets";
import { DEFAULT_FOUR_GROUP_PATTERN, DEFAULT_SHIFT_DEFINITIONS } from "../shiftPattern";
import type { ShiftSettings } from "../shiftTypes";

function settingsForGroup(groupNumber: 1 | 2 | 3 | 4): ShiftSettings {
  const preset = getGroupShiftPreset(groupNumber);

  return {
    ...preset,
    patternId: DEFAULT_FOUR_GROUP_PATTERN.id,
    shiftDefinitions: DEFAULT_SHIFT_DEFINITIONS,
  };
}

describe("groupPresets", () => {
  it("stores the fixed group anchors", () => {
    expect(GROUP_SHIFT_PRESETS[1]).toEqual({
      groupNumber: 1,
      baseDate: "2026-09-04",
      baseShift: "C",
    });
    expect(GROUP_SHIFT_PRESETS[2]).toEqual({
      groupNumber: 2,
      baseDate: "2026-09-06",
      baseShift: "A",
    });
    expect(GROUP_SHIFT_PRESETS[3]).toEqual({
      groupNumber: 3,
      baseDate: "2026-09-08",
      baseShift: "B",
    });
    expect(GROUP_SHIFT_PRESETS[4]).toEqual({
      groupNumber: 4,
      baseDate: "2026-09-10",
      baseShift: "C",
    });
  });

  it("formats preset summaries for onboarding copy", () => {
    expect(formatGroupPresetSummary(2)).toBe("A조 · 9/6 시작");
    expect(formatGroupPresetLongLabel(4)).toBe("4조 · C조 · 9/10 시작");
  });

  it.each([
    [1, "2026-09-04", "C"],
    [2, "2026-09-06", "A"],
    [3, "2026-09-08", "B"],
    [4, "2026-09-10", "C"],
  ] as const)("group %i starts %s on %s", (groupNumber, date, code) => {
    const settings = settingsForGroup(groupNumber);
    expect(getShiftForDate(date, settings).code).toBe(code);
  });
});
