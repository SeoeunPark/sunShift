/** Shift code representing work group or day off */
export type ShiftCode = "A" | "B" | "C" | "OFF";

/** Phase type within a shift pattern cycle */
export type ShiftPhaseType = ShiftCode;

/** Single phase in a repeating shift pattern */
export interface ShiftPhase {
  type: ShiftPhaseType;
  duration: number;
}

/** Reusable shift pattern definition */
export interface ShiftPattern {
  id: string;
  name: string;
  cycleLength: number;
  phases: ShiftPhase[];
}

/** Work hours for a specific shift code */
export interface ShiftDefinition {
  code: ShiftCode;
  name: string;
  label: string;
  startTime: string | null;
  endTime: string | null;
  displayOrder: number;
}

/** User shift settings used for calculation */
export interface ShiftSettings {
  id?: string;
  userId?: string;
  groupNumber: number;
  baseDate: string;
  baseShift: ShiftCode;
  patternId: string;
  shiftDefinitions: ShiftDefinition[];
}

/** Computed shift result for a specific calendar date */
export interface ShiftResult {
  date: string;
  code: ShiftCode;
  name: string;
  label: string;
  startTime: string | null;
  endTime: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
}

/** Position within the repeating cycle (0-based) */
export interface CyclePosition {
  position: number;
  phaseIndex: number;
  phaseOffset: number;
  code: ShiftCode;
}

/** Monthly shift statistics */
export interface MonthlyShiftStats {
  year: number;
  month: number;
  counts: Record<ShiftCode, number>;
  nightShiftCount: number;
  totalWorkDays: number;
  totalOffDays: number;
}

/** Consecutive off-day block */
export interface OffDayBlock {
  startDate: string;
  endDate: string;
  days: number;
}

/** Rest period around a leave date including adjacent OFF days */
export interface RestPeriodAroundLeave {
  leaveDate: string;
  totalRestDays: number;
  startDate: string;
  endDate: string;
  includesLeave: boolean;
}
