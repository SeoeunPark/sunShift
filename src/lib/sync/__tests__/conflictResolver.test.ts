import { describe, expect, it } from "vitest";
import { resolveLastWriteWins, shouldLocalWin } from "../conflictResolver";

describe("conflictResolver", () => {
  it("local wins when updatedAt is newer", () => {
    const local = { id: "1", updatedAt: "2026-09-10T10:00:00.000Z" };
    const remote = { id: "1", updatedAt: "2026-09-10T09:00:00.000Z" };

    expect(shouldLocalWin(local.updatedAt, remote.updatedAt)).toBe(true);
    expect(resolveLastWriteWins(local, remote).source).toBe("local");
  });

  it("remote wins when updatedAt is newer", () => {
    const local = { id: "1", updatedAt: "2026-09-10T08:00:00.000Z" };
    const remote = { id: "1", updatedAt: "2026-09-10T12:00:00.000Z" };

    expect(shouldLocalWin(local.updatedAt, remote.updatedAt)).toBe(false);
    expect(resolveLastWriteWins(local, remote).source).toBe("remote");
  });

  it("local wins when updatedAt is equal", () => {
    const local = { id: "1", updatedAt: "2026-09-10T10:00:00.000Z" };
    const remote = { id: "1", updatedAt: "2026-09-10T10:00:00.000Z" };

    expect(resolveLastWriteWins(local, remote).source).toBe("local");
  });
});
