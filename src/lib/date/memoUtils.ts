import type { MemoRecord } from "@/types/local";
import { getDayDifference } from "./dateUtils";

export interface MemoGroups {
  upcoming: MemoRecord[];
  past: MemoRecord[];
  total: number;
  thisMonthCount: number;
  upcomingCount: number;
}

export function isDateInMonth(dateStr: string, year: number, month: number): boolean {
  const [y, m] = dateStr.split("-").map(Number);
  return y === year && m === month;
}

export function countMemosInMonth(records: MemoRecord[], year: number, month: number): number {
  return records.filter((record) => isDateInMonth(record.date, year, month)).length;
}

export function getMemoDayLabel(date: string, today: string): string {
  const diff = getDayDifference(today, date);

  if (diff === 0) {
    return "오늘";
  }
  if (diff === 1) {
    return "내일";
  }
  if (diff > 1) {
    return `D-${diff}`;
  }
  if (diff === -1) {
    return "어제";
  }
  return `${Math.abs(diff)}일 전`;
}

export function groupMemos(records: MemoRecord[], today: string): MemoGroups {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((record) => record.date >= today);
  const past = sorted.filter((record) => record.date < today).reverse();
  const [year, month] = today.split("-").map(Number);

  return {
    upcoming,
    past,
    total: records.length,
    thisMonthCount: countMemosInMonth(records, year, month),
    upcomingCount: upcoming.length,
  };
}
