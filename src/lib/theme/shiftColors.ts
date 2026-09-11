import type { ShiftCode } from "@/lib/shift/shiftTypes";

export const SHIFT_COLORS: Record<
  ShiftCode,
  { bg: string; text: string; border: string; label: string }
> = {
  A: {
    bg: "bg-shift-a",
    text: "text-shift-a-foreground",
    border: "border-shift-a",
    label: "A조",
  },
  B: {
    bg: "bg-shift-b",
    text: "text-shift-b-foreground",
    border: "border-shift-b",
    label: "B조",
  },
  C: {
    bg: "bg-shift-c",
    text: "text-shift-c-foreground",
    border: "border-shift-c",
    label: "C조",
  },
  OFF: {
    bg: "bg-shift-off",
    text: "text-shift-off-foreground",
    border: "border-shift-off",
    label: "휴무",
  },
};

export const LEAVE_COLOR = {
  bg: "bg-shift-leave",
  text: "text-shift-leave-foreground",
  border: "border-shift-leave",
  label: "연중",
};

export const NIGHT_CARE_LEAVE_COLOR = {
  bg: "bg-violet-500/15",
  text: "text-violet-700 dark:text-violet-300",
  border: "border-violet-500/25",
  label: "야간케어",
};
