import { describe, expect, it, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { shiftDb } from "@/lib/db/shiftDb";
import {
  DEFAULT_ANNUAL_LEAVE_TOTAL,
  DEFAULT_NIGHT_CARE_LEAVE_TOTAL,
  getLeaveTotal,
  setLeaveTotal,
} from "@/lib/db/leaveSettings";

async function clearDatabase() {
  await shiftDb.delete();
  await shiftDb.open();
}

describe("leaveSettings", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("returns default leave totals when not set", async () => {
    expect(await getLeaveTotal("user-1", "annual")).toBe(DEFAULT_ANNUAL_LEAVE_TOTAL);
    expect(await getLeaveTotal("user-1", "night_care")).toBe(DEFAULT_NIGHT_CARE_LEAVE_TOTAL);
  });

  it("persists leave totals per user and type", async () => {
    await setLeaveTotal("user-1", "annual", 20);
    await setLeaveTotal("user-1", "night_care", 5);

    expect(await getLeaveTotal("user-1", "annual")).toBe(20);
    expect(await getLeaveTotal("user-1", "night_care")).toBe(5);
    expect(await getLeaveTotal("user-2", "annual")).toBe(DEFAULT_ANNUAL_LEAVE_TOTAL);
  });
});
