import { describe, expect, it } from "vitest";
import { LEGACY_TEST_SHIFT_SETTINGS } from "@/lib/shift/__tests__/fixtures";
import { planSleepNotifications } from "../sleepPlanner";

describe("planSleepNotifications", () => {
  it("plans sleep notification one hour before recommended bedtime", () => {
    const planned = planSleepNotifications({
      now: new Date("2026-09-02T00:00:00+09:00"),
      sleepEnabled: true,
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(1);
    expect(planned[0]?.kind).toBe("sleep");
    expect(planned[0]?.body).toContain("B조");
    expect(planned[0]?.body).toContain("1시간 전");
  });

  it("skips sleep notification on OFF days", () => {
    const planned = planSleepNotifications({
      now: new Date("2026-09-01T20:00:00+09:00"),
      sleepEnabled: true,
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(0);
  });

  it("skips when sleep notifications are disabled", () => {
    const planned = planSleepNotifications({
      now: new Date("2026-09-02T00:00:00+09:00"),
      sleepEnabled: false,
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(0);
  });

  it("skips sleep notification on leave days", () => {
    const planned = planSleepNotifications({
      now: new Date("2026-09-02T00:00:00+09:00"),
      sleepEnabled: true,
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: ["2026-09-02"],
    });

    expect(planned).toHaveLength(0);
  });
});
