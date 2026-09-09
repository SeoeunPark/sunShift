import { describe, expect, it } from "vitest";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { buildWidgetSnapshot, formatWidgetLines } from "../buildWidgetSnapshot";

describe("buildWidgetSnapshot", () => {
  it("builds today shift and sleep payload", () => {
    const snapshot = buildWidgetSnapshot(DEFAULT_SHIFT_SETTINGS, {
      today: "2026-09-06",
      now: new Date("2026-09-06T15:00:00+09:00"),
      origin: "https://shift.example.com",
    });

    expect(snapshot.version).toBe(1);
    expect(snapshot.today).toBe("2026-09-06");
    expect(snapshot.shift.code).toBe("B");
    expect(snapshot.shift.workRange).toBe("15 ~ 23");
    expect(snapshot.shift.cycleLabel).toContain("B조");
    expect(snapshot.sleep.rangeCompact).toBe("01 ~ 08");
    expect(snapshot.sleep.durationHours).toBe(7);
    expect(snapshot.deepLinks.home).toBe("https://shift.example.com/");
    expect(snapshot.deepLinks.sleep).toBe("https://shift.example.com/sleep");
  });

  it("formats widget preview lines", () => {
    const snapshot = buildWidgetSnapshot(DEFAULT_SHIFT_SETTINGS, {
      today: "2026-09-06",
      now: new Date("2026-09-06T15:00:00+09:00"),
    });

    expect(formatWidgetLines(snapshot, "small")).toEqual({
      primary: "B",
      secondary: "15 ~ 23",
      tertiary: expect.stringContaining("B조"),
    });

    expect(formatWidgetLines(snapshot, "medium").rightSubtitle).toBe("01 ~ 08 · 7시간");
  });
});
