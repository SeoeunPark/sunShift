import type { ShiftDefinition, ShiftPattern, ShiftSettings } from "./shiftTypes";
import { getGroupShiftPreset } from "./groupPresets";

/** Default 4-group 6-work-2-off pattern (24-day cycle) */
export const DEFAULT_FOUR_GROUP_PATTERN: ShiftPattern = {
  id: "four-group-6-2",
  name: "4조 6근2휴",
  cycleLength: 24,
  phases: [
    { type: "A", duration: 6 },
    { type: "OFF", duration: 2 },
    { type: "B", duration: 6 },
    { type: "OFF", duration: 2 },
    { type: "C", duration: 6 },
    { type: "OFF", duration: 2 },
  ],
};

/** Registry of available shift patterns */
export const SHIFT_PATTERNS: Record<string, ShiftPattern> = {
  [DEFAULT_FOUR_GROUP_PATTERN.id]: DEFAULT_FOUR_GROUP_PATTERN,
};

/** Default shift time definitions for 4-group pattern */
export const DEFAULT_SHIFT_DEFINITIONS: ShiftDefinition[] = [
  {
    code: "A",
    name: "A조",
    label: "주간",
    startTime: "07:00",
    endTime: "15:00",
    displayOrder: 0,
  },
  {
    code: "B",
    name: "B조",
    label: "오후",
    startTime: "15:00",
    endTime: "23:00",
    displayOrder: 1,
  },
  {
    code: "C",
    name: "C조",
    label: "야간",
    startTime: "23:00",
    endTime: "07:00",
    displayOrder: 2,
  },
  {
    code: "OFF",
    name: "휴무",
    label: "휴무",
    startTime: null,
    endTime: null,
    displayOrder: 3,
  },
];

/** Default shift settings before onboarding: 4조 · C조 9/10 시작 */
const defaultGroupPreset = getGroupShiftPreset(4);

export const DEFAULT_SHIFT_SETTINGS: ShiftSettings = {
  groupNumber: defaultGroupPreset.groupNumber,
  baseDate: defaultGroupPreset.baseDate,
  baseShift: defaultGroupPreset.baseShift,
  patternId: DEFAULT_FOUR_GROUP_PATTERN.id,
  shiftDefinitions: DEFAULT_SHIFT_DEFINITIONS,
};

export function getPatternById(patternId: string): ShiftPattern {
  const pattern = SHIFT_PATTERNS[patternId];
  if (!pattern) {
    throw new Error(`Unknown shift pattern: ${patternId}`);
  }
  return pattern;
}

export function getShiftDefinition(
  settings: ShiftSettings,
  code: ShiftDefinition["code"],
): ShiftDefinition {
  const definition = settings.shiftDefinitions.find((item) => item.code === code);
  if (!definition) {
    throw new Error(`Unknown shift code: ${code}`);
  }
  return definition;
}
