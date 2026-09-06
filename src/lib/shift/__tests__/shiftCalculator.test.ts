import { describe, expect, it } from "vitest";
import {
  getConsecutiveOffDays,
  getCyclePosition,
  getMonthSchedule,
  getMonthlyShiftStats,
  getNextOffDate,
  getNextShift,
  getNextWorkShift,
  getOffDayBlocksInMonth,
  getPreviousShift,
  getRestPeriodAroundLeave,
  getShiftForDate,
} from "../shiftCalculator";
import { DEFAULT_SHIFT_SETTINGS } from "../shiftPattern";

const settings = DEFAULT_SHIFT_SETTINGS;

describe("getShiftForDate - required test cases", () => {
  const cases: Array<[string, string]> = [
    ["2026-09-02", "B"],
    ["2026-09-03", "B"],
    ["2026-09-04", "B"],
    ["2026-09-05", "B"],
    ["2026-09-06", "B"],
    ["2026-09-07", "B"],
    ["2026-09-08", "OFF"],
    ["2026-09-09", "OFF"],
    ["2026-09-10", "C"],
    ["2026-09-11", "C"],
    ["2026-09-12", "C"],
    ["2026-09-13", "C"],
    ["2026-09-14", "C"],
    ["2026-09-15", "C"],
    ["2026-09-16", "OFF"],
    ["2026-09-17", "OFF"],
    ["2026-09-18", "A"],
    ["2026-09-19", "A"],
    ["2026-09-20", "A"],
    ["2026-09-21", "A"],
    ["2026-09-22", "A"],
    ["2026-09-23", "A"],
    ["2026-09-24", "OFF"],
    ["2026-09-25", "OFF"],
    ["2026-09-26", "B"],
    ["2026-09-27", "B"],
    ["2026-09-28", "B"],
    ["2026-09-29", "B"],
    ["2026-09-30", "B"],
    ["2026-10-01", "B"],
    ["2026-10-02", "OFF"],
    ["2026-10-03", "OFF"],
  ];

  it.each(cases)("returns %s = %s", (date, expectedCode) => {
    const result = getShiftForDate(date, settings);
    expect(result.code).toBe(expectedCode);
  });
});

describe("getShiftForDate - before base date", () => {
  it("calculates shifts before base date correctly", () => {
    expect(getShiftForDate("2026-08-27", settings).code).toBe("A");
    expect(getShiftForDate("2026-08-28", settings).code).toBe("A");
    expect(getShiftForDate("2026-08-29", settings).code).toBe("A");
    expect(getShiftForDate("2026-08-30", settings).code).toBe("A");
    expect(getShiftForDate("2026-08-31", settings).code).toBe("OFF");
    expect(getShiftForDate("2026-09-01", settings).code).toBe("OFF");
  });
});

describe("getShiftForDate - after base date (far future)", () => {
  it("calculates shifts far in the future correctly", () => {
    expect(getShiftForDate("2027-01-15", settings).code).toBe("OFF");
    expect(getShiftForDate("2027-06-01", settings).code).toBe("C");
  });
});

describe("getShiftForDate - month boundaries", () => {
  it("handles month end correctly", () => {
    const result = getShiftForDate("2026-09-30", settings);
    expect(result.code).toBe("B");
  });

  it("handles month start correctly", () => {
    const result = getShiftForDate("2026-10-01", settings);
    expect(result.code).toBe("B");
  });
});

describe("getShiftForDate - leap year", () => {
  it("handles leap year February correctly", () => {
    expect(getShiftForDate("2028-02-29", settings).code).toBe("A");
    expect(getShiftForDate("2028-03-01", settings).code).toBe("A");
  });
});

describe("getShiftForDate - C shift overnight", () => {
  it("C shift starts on same day at 23:00", () => {
    const result = getShiftForDate("2026-09-10", settings);
    expect(result.code).toBe("C");
    expect(result.startTime).toBe("23:00");
    expect(result.endTime).toBe("07:00");
    expect(result.startDateTime).toBe("2026-09-10T23:00:00+09:00");
    expect(result.endDateTime).toBe("2026-09-11T07:00:00+09:00");
  });

  it("C shift end datetime is next day", () => {
    const result = getShiftForDate("2026-09-15", settings);
    expect(result.startDateTime).toBe("2026-09-15T23:00:00+09:00");
    expect(result.endDateTime).toBe("2026-09-16T07:00:00+09:00");
  });
});

describe("getShiftForDate - work times", () => {
  it("A shift times are correct", () => {
    const result = getShiftForDate("2026-09-18", settings);
    expect(result.code).toBe("A");
    expect(result.startTime).toBe("07:00");
    expect(result.endTime).toBe("15:00");
    expect(result.startDateTime).toBe("2026-09-18T07:00:00+09:00");
    expect(result.endDateTime).toBe("2026-09-18T15:00:00+09:00");
  });

  it("B shift times are correct", () => {
    const result = getShiftForDate("2026-09-02", settings);
    expect(result.code).toBe("B");
    expect(result.startTime).toBe("15:00");
    expect(result.endTime).toBe("23:00");
    expect(result.startDateTime).toBe("2026-09-02T15:00:00+09:00");
    expect(result.endDateTime).toBe("2026-09-02T23:00:00+09:00");
  });

  it("OFF has no times", () => {
    const result = getShiftForDate("2026-09-08", settings);
    expect(result.code).toBe("OFF");
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBeNull();
    expect(result.startDateTime).toBeNull();
    expect(result.endDateTime).toBeNull();
  });
});

describe("getCyclePosition", () => {
  it("returns correct cycle position for base date", () => {
    const pos = getCyclePosition("2026-09-02", settings);
    expect(pos.code).toBe("B");
    expect(pos.position).toBe(8);
    expect(pos.phaseOffset).toBe(0);
  });
});

describe("getNextShift and getPreviousShift", () => {
  it("returns next day shift", () => {
    expect(getNextShift("2026-09-07", settings).code).toBe("OFF");
    expect(getNextShift("2026-09-08", settings).code).toBe("OFF");
    expect(getNextShift("2026-09-09", settings).code).toBe("C");
  });

  it("returns previous day shift", () => {
    expect(getPreviousShift("2026-09-08", settings).code).toBe("B");
    expect(getPreviousShift("2026-09-10", settings).code).toBe("OFF");
  });
});

describe("getNextOffDate", () => {
  it("returns today when already off", () => {
    expect(getNextOffDate("2026-09-08", settings)).toBe("2026-09-08");
  });

  it("returns next off date from work day", () => {
    expect(getNextOffDate("2026-09-02", settings)).toBe("2026-09-08");
    expect(getNextOffDate("2026-09-10", settings)).toBe("2026-09-16");
  });
});

describe("getConsecutiveOffDays", () => {
  it("returns off block for off day", () => {
    const block = getConsecutiveOffDays("2026-09-08", settings);
    expect(block).toEqual({
      startDate: "2026-09-08",
      endDate: "2026-09-09",
      days: 2,
    });
  });

  it("returns null for work day", () => {
    expect(getConsecutiveOffDays("2026-09-02", settings)).toBeNull();
  });
});

describe("getMonthSchedule", () => {
  it("returns full month schedule for September 2026", () => {
    const schedule = getMonthSchedule(2026, 9, settings);
    expect(schedule).toHaveLength(30);
    expect(schedule[0].date).toBe("2026-09-01");
    expect(schedule[0].code).toBe("OFF");
    expect(schedule[29].date).toBe("2026-09-30");
    expect(schedule[29].code).toBe("B");
  });
});

describe("getMonthlyShiftStats", () => {
  it("returns correct stats for September 2026", () => {
    const stats = getMonthlyShiftStats(2026, 9, settings);
    expect(stats.counts.A).toBe(6);
    expect(stats.counts.B).toBe(11);
    expect(stats.counts.C).toBe(6);
    expect(stats.counts.OFF).toBe(7);
    expect(stats.nightShiftCount).toBe(6);
    expect(stats.totalWorkDays).toBe(23);
    expect(stats.totalOffDays).toBe(7);
  });
});

describe("getRestPeriodAroundLeave", () => {
  it("calculates rest period including adjacent OFF days", () => {
    const rest = getRestPeriodAroundLeave("2026-09-09", settings);
    expect(rest.startDate).toBe("2026-09-08");
    expect(rest.endDate).toBe("2026-09-09");
    expect(rest.totalRestDays).toBe(2);
  });
});

describe("getNextWorkShift", () => {
  it("returns today when working", () => {
    const shift = getNextWorkShift("2026-09-02", settings);
    expect(shift.code).toBe("B");
    expect(shift.date).toBe("2026-09-02");
  });

  it("returns next work day when off", () => {
    const shift = getNextWorkShift("2026-09-08", settings);
    expect(shift.code).toBe("C");
    expect(shift.date).toBe("2026-09-10");
  });
});

describe("getOffDayBlocksInMonth", () => {
  it("returns all off blocks in September 2026", () => {
    const blocks = getOffDayBlocksInMonth(2026, 9, settings);
    expect(blocks).toEqual([
      { startDate: "2026-09-01", endDate: "2026-09-01", days: 1 },
      { startDate: "2026-09-08", endDate: "2026-09-09", days: 2 },
      { startDate: "2026-09-16", endDate: "2026-09-17", days: 2 },
      { startDate: "2026-09-24", endDate: "2026-09-25", days: 2 },
    ]);
  });
});

describe("Asia/Seoul timezone", () => {
  it("uses calendar dates consistently regardless of UTC offset", () => {
    const fromString = getShiftForDate("2026-09-02", settings);
    const fromDate = getShiftForDate(new Date("2026-09-02T15:00:00+09:00"), settings);
    expect(fromString.code).toBe("B");
    expect(fromDate.code).toBe("B");
  });
});
