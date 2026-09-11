import type { LeaveType } from "@/lib/leave/leaveTypes";
import { getMeta, setMeta } from "./initLocalDb";

export const DEFAULT_ANNUAL_LEAVE_TOTAL = 15;
export const DEFAULT_NIGHT_CARE_LEAVE_TOTAL = 0;

const TOTAL_META_KEYS: Record<LeaveType, string> = {
  annual: "leave_total",
  night_care: "night_care_leave_total",
};

const DEFAULT_TOTALS: Record<LeaveType, number> = {
  annual: DEFAULT_ANNUAL_LEAVE_TOTAL,
  night_care: DEFAULT_NIGHT_CARE_LEAVE_TOTAL,
};

function leaveTotalKey(userId: string, type: LeaveType): string {
  return `${TOTAL_META_KEYS[type]}:${userId}`;
}

export async function getLeaveTotal(userId: string, type: LeaveType): Promise<number> {
  const value = await getMeta(leaveTotalKey(userId, type));
  if (!value) {
    return DEFAULT_TOTALS[type];
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TOTALS[type];
}

export async function setLeaveTotal(
  userId: string,
  type: LeaveType,
  total: number,
): Promise<void> {
  await setMeta(leaveTotalKey(userId, type), String(Math.max(0, total)));
}
