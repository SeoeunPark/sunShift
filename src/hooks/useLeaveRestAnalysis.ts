"use client";

import { useMemo } from "react";
import { getRestPeriodAroundLeave, getShiftForDate } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { formatOffBlockRange } from "@/lib/date/offDayUtils";
import { useShiftSettings } from "./useShiftSettings";

export function useLeaveRestAnalysis(date: string | null) {
  const { settings } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  return useMemo(() => {
    if (!date) {
      return null;
    }

    const rest = getRestPeriodAroundLeave(date, shiftSettings);
    const originalShift = getShiftForDate(date, shiftSettings);

    return {
      ...rest,
      originalShift,
      rangeLabel: formatOffBlockRange({
        startDate: rest.startDate,
        endDate: rest.endDate,
        days: rest.totalRestDays,
      }),
    };
  }, [date, shiftSettings]);
}
