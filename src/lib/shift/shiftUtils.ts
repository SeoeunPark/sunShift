import type { ShiftCode, ShiftPattern } from "./shiftTypes";

/** Map cycle position (0-based) to shift code */
export function getCodeAtPosition(pattern: ShiftPattern, position: number): ShiftCode {
  const normalized = ((position % pattern.cycleLength) + pattern.cycleLength) % pattern.cycleLength;

  let cursor = 0;
  for (const phase of pattern.phases) {
    if (normalized >= cursor && normalized < cursor + phase.duration) {
      return phase.type;
    }
    cursor += phase.duration;
  }

  throw new Error(`Invalid cycle position: ${position}`);
}

/** Find cycle position where a given shift code starts */
export function findPhaseStartPosition(pattern: ShiftPattern, code: ShiftCode): number {
  let cursor = 0;
  for (const phase of pattern.phases) {
    if (phase.type === code) {
      return cursor;
    }
    cursor += phase.duration;
  }

  throw new Error(`Shift code not found in pattern: ${code}`);
}

/** Get detailed cycle position info */
export function resolveCyclePosition(
  pattern: ShiftPattern,
  position: number,
): { position: number; phaseIndex: number; phaseOffset: number; code: ShiftCode } {
  const normalized = ((position % pattern.cycleLength) + pattern.cycleLength) % pattern.cycleLength;

  let cursor = 0;
  for (let phaseIndex = 0; phaseIndex < pattern.phases.length; phaseIndex++) {
    const phase = pattern.phases[phaseIndex];
    if (normalized >= cursor && normalized < cursor + phase.duration) {
      return {
        position: normalized,
        phaseIndex,
        phaseOffset: normalized - cursor,
        code: phase.type,
      };
    }
    cursor += phase.duration;
  }

  throw new Error(`Invalid cycle position: ${position}`);
}
