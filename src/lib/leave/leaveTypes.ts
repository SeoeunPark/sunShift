export type LeaveType = "annual" | "night_care";

export interface LeaveTypeMeta {
  id: LeaveType;
  label: string;
  shortLabel: string;
}

export const LEAVE_TYPES: LeaveTypeMeta[] = [
  { id: "annual", label: "연중휴가", shortLabel: "연중" },
  { id: "night_care", label: "야간케어 휴가", shortLabel: "야간케어" },
];

export const DEFAULT_LEAVE_TYPE: LeaveType = "annual";

export function isLeaveType(value: string): value is LeaveType {
  return value === "annual" || value === "night_care";
}

export function getLeaveTypeMeta(type: LeaveType): LeaveTypeMeta {
  return LEAVE_TYPES.find((item) => item.id === type) ?? LEAVE_TYPES[0];
}

export function normalizeLeaveType(type: string | null | undefined): LeaveType {
  return isLeaveType(type ?? "") ? type : DEFAULT_LEAVE_TYPE;
}
