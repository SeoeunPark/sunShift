import {
  addSeoulDays,
  buildSeoulDateTime,
  getDayDifference,
  toDateString,
} from "@/lib/date/dateUtils";
import { getPatternById, getShiftDefinition } from "./shiftPattern";
import type {
  CyclePosition,
  MonthlyShiftStats,
  OffDayBlock,
  RestPeriodAroundLeave,
  ShiftResult,
  ShiftSettings,
} from "./shiftTypes";
import {
  findPhaseStartPosition,
  getCodeAtPosition,
  resolveCyclePosition,
} from "./shiftUtils";

function getBaseCyclePosition(settings: ShiftSettings): number {
  const pattern = getPatternById(settings.patternId);
  return findPhaseStartPosition(pattern, settings.baseShift);
}

function getCyclePositionForDate(date: string, settings: ShiftSettings): number {
  const pattern = getPatternById(settings.patternId);
  const dayDiff = getDayDifference(settings.baseDate, date);
  const basePosition = getBaseCyclePosition(settings);
  return ((basePosition + dayDiff) % pattern.cycleLength + pattern.cycleLength) % pattern.cycleLength;
}

function buildShiftDateTimes(
  date: string,
  code: ShiftResult["code"],
  startTime: string | null,
  endTime: string | null,
): { startDateTime: string | null; endDateTime: string | null } {
  if (code === "OFF" || !startTime || !endTime) {
    return { startDateTime: null, endDateTime: null };
  }

  const startDateTime = buildSeoulDateTime(date, startTime);

  // C shift and any end time before start time crosses midnight
  const [startHour] = startTime.split(":").map(Number);
  const [endHour] = endTime.split(":").map(Number);
  const endDate = endHour < startHour ? addSeoulDays(date, 1) : date;
  const endDateTime = buildSeoulDateTime(endDate, endTime);

  return { startDateTime, endDateTime };
}

export function getShiftForDate(
  dateInput: string | Date,
  settings: ShiftSettings,
): ShiftResult {
  const date = toDateString(dateInput);
  const pattern = getPatternById(settings.patternId);
  const position = getCyclePositionForDate(date, settings);
  const code = getCodeAtPosition(pattern, position);
  const definition = getShiftDefinition(settings, code);
  const { startDateTime, endDateTime } = buildShiftDateTimes(
    date,
    code,
    definition.startTime,
    definition.endTime,
  );

  return {
    date,
    code,
    name: definition.name,
    label: definition.label,
    startTime: definition.startTime,
    endTime: definition.endTime,
    startDateTime,
    endDateTime,
  };
}

export function getCyclePosition(
  dateInput: string | Date,
  settings: ShiftSettings,
): CyclePosition {
  const date = toDateString(dateInput);
  const pattern = getPatternById(settings.patternId);
  const position = getCyclePositionForDate(date, settings);
  return resolveCyclePosition(pattern, position);
}

export function getNextShift(
  dateInput: string | Date,
  settings: ShiftSettings,
): ShiftResult {
  const date = toDateString(dateInput);
  return getShiftForDate(addSeoulDays(date, 1), settings);
}

export function getPreviousShift(
  dateInput: string | Date,
  settings: ShiftSettings,
): ShiftResult {
  const date = toDateString(dateInput);
  return getShiftForDate(addSeoulDays(date, -1), settings);
}

export function getNextOffDate(
  dateInput: string | Date,
  settings: ShiftSettings,
): string {
  const startDate = toDateString(dateInput);
  let cursor = startDate;
  const today = getShiftForDate(cursor, settings);

  if (today.code === "OFF") {
    return cursor;
  }

  for (let i = 1; i <= 365; i++) {
    cursor = addSeoulDays(startDate, i);
    const shift = getShiftForDate(cursor, settings);
    if (shift.code === "OFF") {
      return cursor;
    }
  }

  throw new Error("Could not find next off date within 365 days");
}

export function getConsecutiveOffDays(
  dateInput: string | Date,
  settings: ShiftSettings,
): OffDayBlock | null {
  const date = toDateString(dateInput);
  const shift = getShiftForDate(date, settings);

  if (shift.code !== "OFF") {
    return null;
  }

  let startDate = date;
  while (getShiftForDate(addSeoulDays(startDate, -1), settings).code === "OFF") {
    startDate = addSeoulDays(startDate, -1);
  }

  let endDate = date;
  while (getShiftForDate(addSeoulDays(endDate, 1), settings).code === "OFF") {
    endDate = addSeoulDays(endDate, 1);
  }

  const days = getDayDifference(startDate, endDate) + 1;

  return { startDate, endDate, days };
}

export function getMonthSchedule(
  year: number,
  month: number,
  settings: ShiftSettings,
): ShiftResult[] {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const schedule: ShiftResult[] = [];

  let cursor = startDate;
  while (true) {
    const [y, m] = cursor.split("-").map(Number);
    if (y !== year || m !== month) {
      break;
    }
    schedule.push(getShiftForDate(cursor, settings));
    cursor = addSeoulDays(cursor, 1);
  }

  return schedule;
}

export function getMonthlyShiftStats(
  year: number,
  month: number,
  settings: ShiftSettings,
): MonthlyShiftStats {
  const schedule = getMonthSchedule(year, month, settings);

  const counts = {
    A: 0,
    B: 0,
    C: 0,
    OFF: 0,
  };

  for (const day of schedule) {
    counts[day.code]++;
  }

  return {
    year,
    month,
    counts,
    nightShiftCount: counts.C,
    totalWorkDays: counts.A + counts.B + counts.C,
    totalOffDays: counts.OFF,
  };
}

export function getRestPeriodAroundLeave(
  leaveDateInput: string | Date,
  settings: ShiftSettings,
): RestPeriodAroundLeave {
  const leaveDate = toDateString(leaveDateInput);

  let startDate = leaveDate;
  while (getShiftForDate(addSeoulDays(startDate, -1), settings).code === "OFF") {
    startDate = addSeoulDays(startDate, -1);
  }

  let endDate = leaveDate;
  while (getShiftForDate(addSeoulDays(endDate, 1), settings).code === "OFF") {
    endDate = addSeoulDays(endDate, 1);
  }

  const totalRestDays = getDayDifference(startDate, endDate) + 1;

  return {
    leaveDate,
    totalRestDays,
    startDate,
    endDate,
    includesLeave: true,
  };
}

/** Days until target date from reference date (D-day style) */
export function getDaysUntil(fromDate: string, toDate: string): number {
  return getDayDifference(fromDate, toDate);
}

/** Find next work shift date (non-OFF) after given date */
export function getNextWorkShift(
  dateInput: string | Date,
  settings: ShiftSettings,
): ShiftResult {
  const startDate = toDateString(dateInput);
  const today = getShiftForDate(startDate, settings);

  if (today.code !== "OFF") {
    return today;
  }

  for (let i = 1; i <= 365; i++) {
    const cursor = addSeoulDays(startDate, i);
    const shift = getShiftForDate(cursor, settings);
    if (shift.code !== "OFF") {
      return shift;
    }
  }

  throw new Error("Could not find next work shift within 365 days");
}

/** Get all off-day blocks in a month */
export function getOffDayBlocksInMonth(
  year: number,
  month: number,
  settings: ShiftSettings,
): OffDayBlock[] {
  const schedule = getMonthSchedule(year, month, settings);
  const blocks: OffDayBlock[] = [];
  let index = 0;

  while (index < schedule.length) {
    if (schedule[index].code !== "OFF") {
      index++;
      continue;
    }

    const startDate = schedule[index].date;
    let endDate = startDate;

    while (
      index + 1 < schedule.length &&
      schedule[index + 1].code === "OFF"
    ) {
      index++;
      endDate = schedule[index].date;
    }

    blocks.push({
      startDate,
      endDate,
      days: getDayDifference(startDate, endDate) + 1,
    });
    index++;
  }

  return blocks;
}

export function getDaysUntilNextOff(
  dateInput: string | Date,
  settings: ShiftSettings,
): number {
  const date = toDateString(dateInput);
  const today = getShiftForDate(date, settings);

  if (today.code === "OFF") {
    return 0;
  }

  const nextOff = getNextOffDate(date, settings);
  return getDayDifference(date, nextOff);
}
