import { getMeta, setMeta } from "./initLocalDb";

export const DEFAULT_LEAVE_TOTAL = 15;

function leaveTotalKey(userId: string): string {
  return `leave_total:${userId}`;
}

export async function getLeaveTotal(userId: string): Promise<number> {
  const value = await getMeta(leaveTotalKey(userId));
  if (!value) {
    return DEFAULT_LEAVE_TOTAL;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LEAVE_TOTAL;
}

export async function setLeaveTotal(userId: string, total: number): Promise<void> {
  await setMeta(leaveTotalKey(userId), String(Math.max(0, total)));
}
