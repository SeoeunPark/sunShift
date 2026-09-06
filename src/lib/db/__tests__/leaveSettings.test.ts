import { describe, expect, it, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { shiftDb } from "@/lib/db/shiftDb";
import { DEFAULT_LEAVE_TOTAL, getLeaveTotal, setLeaveTotal } from "@/lib/db/leaveSettings";

async function clearDatabase() {
  await shiftDb.delete();
  await shiftDb.open();
}

describe("leaveSettings", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("returns default leave total when not set", async () => {
    expect(await getLeaveTotal("user-1")).toBe(DEFAULT_LEAVE_TOTAL);
  });

  it("persists leave total per user", async () => {
    await setLeaveTotal("user-1", 20);
    expect(await getLeaveTotal("user-1")).toBe(20);
    expect(await getLeaveTotal("user-2")).toBe(DEFAULT_LEAVE_TOTAL);
  });
});
