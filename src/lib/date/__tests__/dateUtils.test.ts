import { describe, expect, it } from "vitest";
import {
  addSeoulDays,
  formatKoreanDate,
  getDayDifference,
  parseSeoulDate,
  toDateString,
} from "../dateUtils";

describe("dateUtils", () => {
  it("parses Seoul date correctly", () => {
    const date = parseSeoulDate("2026-09-02");
    expect(toDateString(date)).toBe("2026-09-02");
  });

  it("calculates day difference correctly", () => {
    expect(getDayDifference("2026-09-02", "2026-09-08")).toBe(6);
    expect(getDayDifference("2026-09-02", "2026-09-02")).toBe(0);
    expect(getDayDifference("2026-09-02", "2026-08-27")).toBe(-6);
  });

  it("adds days correctly across month boundary", () => {
    expect(addSeoulDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addSeoulDays("2026-09-02", -2)).toBe("2026-08-31");
  });

  it("handles leap year", () => {
    expect(addSeoulDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addSeoulDays("2028-02-29", 1)).toBe("2028-03-01");
  });

  it("formats Korean date", () => {
    expect(formatKoreanDate("2026-09-02")).toBe("9월 2일");
  });
});
