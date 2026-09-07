import { describe, expect, it } from "vitest";
import { getCyclePosition } from "@/lib/shift/shiftCalculator";
import { getPatternById } from "@/lib/shift/shiftPattern";
import {
  formatShiftDayLabel,
  formatShiftDayLabelWithTotal,
} from "@/lib/shift/shiftLabels";
import { LEGACY_TEST_SHIFT_SETTINGS } from "./fixtures";

const settings = LEGACY_TEST_SHIFT_SETTINGS;
const pattern = getPatternById(settings.patternId);

describe("formatShiftDayLabel", () => {
  it("returns first day of B shift on base date", () => {
    const position = getCyclePosition("2026-09-02", settings);
    expect(formatShiftDayLabel(position)).toBe("B조 1일차");
    expect(formatShiftDayLabelWithTotal(position, pattern)).toBe("B조 1/6일차");
  });

  it("returns day count within current phase", () => {
    const position = getCyclePosition("2026-09-04", settings);
    expect(formatShiftDayLabel(position)).toBe("B조 3일차");
    expect(formatShiftDayLabelWithTotal(position, pattern)).toBe("B조 3/6일차");
  });

  it("returns off-day label", () => {
    const position = getCyclePosition("2026-09-08", settings);
    expect(formatShiftDayLabel(position)).toBe("휴무 1일차");
    expect(formatShiftDayLabelWithTotal(position, pattern)).toBe("휴무 1/2일차");
  });
});
