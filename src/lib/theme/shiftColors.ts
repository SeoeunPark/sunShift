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
  label: "연차",
};
