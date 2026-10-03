import {
  GROUP_NUMBERS,
  getGroupShiftPreset,
  isGroupNumber,
  type GroupNumber,
} from "./groupPresets";
import { getCyclePosition, getShiftForDate } from "./shiftCalculator";
import { formatShiftDayLabelWithTotal } from "./shiftLabels";
import { DEFAULT_FOUR_GROUP_PATTERN, getPatternById } from "./shiftPattern";
import type { ShiftResult, ShiftSettings } from "./shiftTypes";

export interface GroupShiftOnDate {
  groupNumber: GroupNumber;
  shift: ShiftResult;
  cycleLabel: string;
  isMine: boolean;
}

export function isFourGroupSchedule(settings: ShiftSettings): boolean {
  return (
    settings.patternId === DEFAULT_FOUR_GROUP_PATTERN.id &&
    isGroupNumber(settings.groupNumber)
  );
}

export function shiftSettingsForGroup(
  groupNumber: GroupNumber,
  settings: ShiftSettings,
): ShiftSettings {
  const preset = getGroupShiftPreset(groupNumber);
  return {
    ...settings,
    groupNumber: preset.groupNumber,
    baseDate: preset.baseDate,
    baseShift: preset.baseShift,
  };
}

export function getAllGroupsShiftForDate(
  date: string,
  settings: ShiftSettings,
): GroupShiftOnDate[] {
  if (!isFourGroupSchedule(settings)) {
    return [];
  }

  const pattern = getPatternById(settings.patternId);
  const myGroup = settings.groupNumber as GroupNumber;

  return GROUP_NUMBERS.map((groupNumber) => {
    const groupSettings = shiftSettingsForGroup(groupNumber, settings);
    const shift = getShiftForDate(date, groupSettings);
    const cyclePosition = getCyclePosition(date, groupSettings);
    const cycleLabel = formatShiftDayLabelWithTotal(cyclePosition, pattern);

    return {
      groupNumber,
      shift,
      cycleLabel,
      isMine: groupNumber === myGroup,
    };
  });
}
