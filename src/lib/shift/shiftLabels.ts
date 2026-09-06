import type { CyclePosition, ShiftPattern } from "./shiftTypes";

/** e.g. "B조 3일차", "휴무 1일차" */
export function formatShiftDayLabel(cyclePosition: CyclePosition): string {
  const dayNumber = cyclePosition.phaseOffset + 1;

  if (cyclePosition.code === "OFF") {
    return `휴무 ${dayNumber}일차`;
  }

  return `${cyclePosition.code}조 ${dayNumber}일차`;
}

export function getPhaseDuration(pattern: ShiftPattern, cyclePosition: CyclePosition): number {
  return pattern.phases[cyclePosition.phaseIndex]?.duration ?? 0;
}

/** e.g. "B조 3/6일차" */
export function formatShiftDayLabelWithTotal(
  cyclePosition: CyclePosition,
  pattern: ShiftPattern,
): string {
  const dayNumber = cyclePosition.phaseOffset + 1;
  const total = getPhaseDuration(pattern, cyclePosition);

  if (cyclePosition.code === "OFF") {
    return `휴무 ${dayNumber}/${total}일차`;
  }

  return `${cyclePosition.code}조 ${dayNumber}/${total}일차`;
}
