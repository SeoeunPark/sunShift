import type { ShiftCode } from "@/lib/shift/shiftTypes";
import { SHIFT_COLORS } from "@/lib/theme/shiftColors";
import { cn } from "@/lib/utils";

interface ShiftBadgeProps {
  code: ShiftCode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-lg font-semibold",
  xl: "size-14 text-2xl font-bold",
};

export function ShiftBadge({ code, size = "md", className }: ShiftBadgeProps) {
  const colors = SHIFT_COLORS[code];
  const label = code === "OFF" ? "OFF" : code;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold shadow-sm",
        colors.bg,
        colors.text,
        colors.border,
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={`${colors.label} 근무`}
    >
      {label}
    </span>
  );
}
