import { describe, expect, it } from "vitest";
import {
  getKoreanHoliday,
  getKoreanHolidaysInMonth,
  isKoreanHoliday,
} from "@/lib/date/koreanHolidays";

describe("koreanHolidays", () => {
  it("returns holiday name for a known date", () => {
    expect(getKoreanHoliday("2026-09-25")).toBe("추석");
    expect(isKoreanHoliday("2026-09-25")).toBe(true);
  });

  it("returns undefined for a regular weekday", () => {
    expect(getKoreanHoliday("2026-09-02")).toBeUndefined();
    expect(isKoreanHoliday("2026-09-02")).toBe(false);
  });

  it("lists holidays in a month", () => {
    const holidays = getKoreanHolidaysInMonth(2026, 9);
    expect(holidays.get("2026-09-25")).toBe("추석");
    expect(holidays.size).toBeGreaterThanOrEqual(3);
  });
});
