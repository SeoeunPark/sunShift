import { describe, expect, it } from "vitest";
import { LEGACY_TEST_SHIFT_SETTINGS } from "@/lib/shift/__tests__/fixtures";
import type { NotificationSettings } from "@/types/local";
import {
  getPreDayWorkNotifyTime,
  getTodayWorkNotifySlot,
  getTomorrowWorkNotifySlot,
  planNotifications,
} from "../notificationPlanner";

function baseSettings(overrides: Partial<NotificationSettings> = {}): NotificationSettings {
  return {
    id: "notification-1",
    userId: "user-1",
    todayEnabled: true,
    todayTime: "07:00",
    tomorrowEnabled: true,
    tomorrowTime: "20:00",
    beforeShiftEnabled: false,
    beforeShiftMinutes: 120,
    offDayEnabled: false,
    leaveEnabled: false,
    sleepEnabled: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("planNotifications", () => {
  it("plans today shift notification one hour before shift start", () => {
    const planned = planNotifications({
      now: new Date("2026-09-02T14:00:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(1);
    expect(planned[0]?.kind).toBe("today_shift");
    expect(planned[0]?.body).toContain("B조");
    expect(planned[0]?.body).toContain("60분 후");
  });

  it("skips today shift notification on OFF days", () => {
    const planned = planNotifications({
      now: new Date("2026-09-01T06:00:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(0);
  });

  it("plans tomorrow shift notification the evening before afternoon shifts", () => {
    const planned = planNotifications({
      now: new Date("2026-09-01T20:00:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(1);
    expect(planned[0]?.kind).toBe("tomorrow_shift");
    expect(planned[0]?.body).toContain("B조");
  });

  it("calculates pre-day notify time per shift start", () => {
    expect(getPreDayWorkNotifyTime("07:00")).toBe("19:00");
    expect(getPreDayWorkNotifyTime("15:00")).toBe("20:00");
    expect(getPreDayWorkNotifyTime("23:00")).toBe("20:00");
  });

  it("calculates tomorrow preview 12 hours before morning shifts", () => {
    const slot = getTomorrowWorkNotifySlot("2026-09-01", "2026-09-02", "07:00");
    expect(slot).toEqual({ date: "2026-09-01", time: "19:00" });
  });

  it("skips today shift notification on leave days", () => {
    const slot = getTodayWorkNotifySlot("2026-09-02", "15:00");
    expect(slot.time).toBe("14:00");

    const planned = planNotifications({
      now: new Date("2026-09-02T14:00:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: ["2026-09-02"],
    });

    expect(planned.some((item) => item.kind === "today_shift")).toBe(false);
  });

  it("catches up today shift notification after the scheduled minute", () => {
    const planned = planNotifications({
      now: new Date("2026-09-02T14:04:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(1);
    expect(planned[0]?.kind).toBe("today_shift");
  });

  it("does not plan today shift notification before the scheduled minute", () => {
    const planned = planNotifications({
      now: new Date("2026-09-02T13:59:00+09:00"),
      settings: baseSettings(),
      shiftSettings: LEGACY_TEST_SHIFT_SETTINGS,
      leaveDates: [],
    });

    expect(planned).toHaveLength(0);
  });
});
