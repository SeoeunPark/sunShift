import type { LeaveType } from "@/lib/leave/leaveTypes";
import { getLeaveTypeMeta } from "@/lib/leave/leaveTypes";
import { LEAVE_COLOR, NIGHT_CARE_LEAVE_COLOR } from "@/lib/theme/shiftColors";

export function getLeaveTypeColors(type: LeaveType) {
  return type === "night_care" ? NIGHT_CARE_LEAVE_COLOR : LEAVE_COLOR;
}

export function getLeaveTypeLabel(type: LeaveType): string {
  return getLeaveTypeMeta(type).shortLabel;
}
