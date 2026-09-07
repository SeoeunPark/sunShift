import type { ShiftCode } from "./shiftTypes";

export type GroupNumber = 1 | 2 | 3 | 4;

export interface GroupShiftPreset {
  groupNumber: GroupNumber;
  baseDate: string;
  baseShift: ShiftCode;
}

/** Fixed 2026 cycle anchors per group (6근2휴 4조). */
export const GROUP_SHIFT_PRESETS: Record<GroupNumber, GroupShiftPreset> = {
  1: { groupNumber: 1, baseDate: "2026-09-04", baseShift: "C" },
  2: { groupNumber: 2, baseDate: "2026-09-06", baseShift: "A" },
  3: { groupNumber: 3, baseDate: "2026-09-08", baseShift: "B" },
  4: { groupNumber: 4, baseDate: "2026-09-10", baseShift: "C" },
};

export const GROUP_NUMBERS: GroupNumber[] = [1, 2, 3, 4];

export function isGroupNumber(value: number): value is GroupNumber {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

export function getGroupShiftPreset(groupNumber: number): GroupShiftPreset {
  if (!isGroupNumber(groupNumber)) {
    throw new Error(`Unsupported group number: ${groupNumber}`);
  }

  return GROUP_SHIFT_PRESETS[groupNumber];
}

export function formatGroupPresetSummary(groupNumber: number): string {
  const preset = getGroupShiftPreset(groupNumber);
  const [, month, day] = preset.baseDate.split("-").map(Number);

  return `${preset.baseShift}조 · ${month}/${day} 시작`;
}

export function formatGroupPresetLongLabel(groupNumber: number): string {
  return `${groupNumber}조 · ${formatGroupPresetSummary(groupNumber)}`;
}
