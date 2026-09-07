import {
  DEFAULT_FOUR_GROUP_PATTERN,
  DEFAULT_SHIFT_DEFINITIONS,
} from "../shiftPattern";
import type { ShiftSettings } from "../shiftTypes";

/** Legacy anchor used by calculator and notification unit tests. */
export const LEGACY_TEST_SHIFT_SETTINGS: ShiftSettings = {
  groupNumber: 4,
  baseDate: "2026-09-02",
  baseShift: "B",
  patternId: DEFAULT_FOUR_GROUP_PATTERN.id,
  shiftDefinitions: DEFAULT_SHIFT_DEFINITIONS,
};
