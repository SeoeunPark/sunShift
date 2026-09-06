"use client";

import { useMemo } from "react";
import {
  getConsecutiveOffDays,
  getMonthlyShiftStats,
  getOffDayBlocksInMonth,
} from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { OffDayBlock } from "@/lib/shift/shiftTypes";
import { getCurrentSeoulMonth } from "@/lib/date/today";
import { useNextOff, useTodayShift } from "./useTodayShift";
import { useShiftSettings } from "./useShiftSettings";

export function useDaysOff(year?: number, month?: number) {
  const current = getCurrentSeoulMonth();
  const targetYear = year ?? current.year;
  const targetMonth = month ?? current.month;

  const { settings, isLoading: isSettingsLoading } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const { today, todayShift, isLoading: isTodayLoading } = useTodayShift();
  const { nextOffDate, daysUntilOff, isLoading: isNextOffLoading } = useNextOff();

  const offBlocks = useMemo(
    () => getOffDayBlocksInMonth(targetYear, targetMonth, shiftSettings),
    [targetYear, targetMonth, shiftSettings],
  );

  const totalOffDays = useMemo(
    () => getMonthlyShiftStats(targetYear, targetMonth, shiftSettings).totalOffDays,
    [targetYear, targetMonth, shiftSettings],
  );

  const currentOffBlock = useMemo(() => {
    if (todayShift.code !== "OFF") {
      return null;
    }
    return getConsecutiveOffDays(today, shiftSettings);
  }, [today, todayShift.code, shiftSettings]);

  const upcomingOffBlocks = useMemo(() => {
    return offBlocks.filter((block) => block.endDate >= today);
  }, [offBlocks, today]);

  const pastOffBlocks = useMemo(() => {
    return offBlocks.filter((block) => block.endDate < today);
  }, [offBlocks, today]);

  return {
    year: targetYear,
    month: targetMonth,
    today,
    todayShift,
    nextOffDate,
    daysUntilOff,
    totalOffDays,
    offBlocks,
    upcomingOffBlocks,
    pastOffBlocks,
    currentOffBlock,
    isLoading: isSettingsLoading || isTodayLoading || isNextOffLoading,
  };
}

export type { OffDayBlock };
