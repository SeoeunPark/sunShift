"use client";

import { useMemo } from "react";
import {
  getDaysUntilNextOff,
  getNextOffDate,
  getNextWorkShift,
  getShiftForDate,
} from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { addSeoulDays } from "@/lib/date/dateUtils";
import { useSeoulToday } from "@/hooks/useClientOnly";
import { useShiftSettings } from "./useShiftSettings";

export function useTodayShift() {
  const today = useSeoulToday();
  const { settings, isLoading } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  const todayShift = useMemo(
    () => getShiftForDate(today, shiftSettings),
    [today, shiftSettings],
  );

  return { today, todayShift, settings: shiftSettings, isLoading };
}

export function useNextOff() {
  const { today, settings, isLoading } = useTodayShift();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  const nextOffDate = useMemo(
    () => getNextOffDate(today, shiftSettings),
    [today, shiftSettings],
  );

  const daysUntilOff = useMemo(
    () => getDaysUntilNextOff(today, shiftSettings),
    [today, shiftSettings],
  );

  const nextWorkShift = useMemo(
    () => getNextWorkShift(today, shiftSettings),
    [today, shiftSettings],
  );

  return {
    nextOffDate,
    daysUntilOff,
    nextWorkShift,
    isLoading,
  };
}

/** Next work day after today (starting from tomorrow) */
export function useNextWorkDay() {
  const { today, settings, isLoading } = useTodayShift();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  const nextWorkDay = useMemo(() => {
    for (let i = 1; i <= 365; i++) {
      const cursor = addSeoulDays(today, i);
      const shift = getShiftForDate(cursor, shiftSettings);
      if (shift.code !== "OFF") {
        return shift;
      }
    }
    return null;
  }, [today, shiftSettings]);

  return { nextWorkDay, isLoading };
}
