import { describe, expect, it } from "vitest";
import type { MemoRecord } from "@/types/local";
import {
  countMemosInMonth,
  getMemoDayLabel,
  groupMemos,
  isDateInMonth,
} from "../memoUtils";

function memo(date: string, content: string): MemoRecord {
  return {
    id: `memo-${date}`,
    userId: "user-1",
    date,
    content,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("memoUtils", () => {
  it("checks whether a date is in the given month", () => {
    expect(isDateInMonth("2026-09-18", 2026, 9)).toBe(true);
    expect(isDateInMonth("2026-09-18", 2026, 8)).toBe(false);
  });

  it("counts memos in a month", () => {
    const records = [memo("2026-09-18", "병원"), memo("2026-09-25", "약속"), memo("2026-10-01", "회의")];
    expect(countMemosInMonth(records, 2026, 9)).toBe(2);
  });

  it("builds day labels relative to today", () => {
    expect(getMemoDayLabel("2026-09-06", "2026-09-06")).toBe("오늘");
    expect(getMemoDayLabel("2026-09-07", "2026-09-06")).toBe("내일");
    expect(getMemoDayLabel("2026-09-08", "2026-09-06")).toBe("D-2");
    expect(getMemoDayLabel("2026-09-05", "2026-09-06")).toBe("어제");
    expect(getMemoDayLabel("2026-09-04", "2026-09-06")).toBe("2일 전");
  });

  it("groups memos into upcoming and past lists", () => {
    const records = [
      memo("2026-09-04", "지난"),
      memo("2026-09-06", "오늘"),
      memo("2026-09-10", "다가오는"),
    ];

    const groups = groupMemos(records, "2026-09-06");

    expect(groups.total).toBe(3);
    expect(groups.thisMonthCount).toBe(3);
    expect(groups.upcomingCount).toBe(2);
    expect(groups.upcoming.map((record) => record.date)).toEqual(["2026-09-06", "2026-09-10"]);
    expect(groups.past.map((record) => record.date)).toEqual(["2026-09-04"]);
  });
});
