"use client";

import { useMemo } from "react";
import { getMonthSchedule } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftResult } from "@/lib/shift/shiftTypes";
import { useLeave } from "./useLeave";
import { useMemos } from "./useMemos";
import { useShiftSettings } from "./useShiftSettings";

export function useMonthSchedule(year: number, month: number) {
  const { settings, isLoading: isSettingsLoading } = useShiftSettings();
  const { records: leaveRecords, isLoading: isLeaveLoading } = useLeave();
  const { records: memoRecords, isLoading: isMemoLoading } = useMemos();

  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  const schedule = useMemo(
    () => getMonthSchedule(year, month, shiftSettings),
    [year, month, shiftSettings],
  );

  const scheduleByDate = useMemo(
    () => new Map(schedule.map((day) => [day.date, day])),
    [schedule],
  );

  const leaveByDate = useMemo(
    () => new Map(leaveRecords.map((record) => [record.date, record])),
    [leaveRecords],
  );

  const memoByDate = useMemo(
    () => new Map(memoRecords.map((record) => [record.date, record])),
    [memoRecords],
  );

  return {
    schedule,
    scheduleByDate,
    leaveByDate,
    memoByDate,
    settings: shiftSettings,
    isLoading: isSettingsLoading || isLeaveLoading || isMemoLoading,
  };
}

export function useScheduleForDate(date: string | null): ShiftResult | null {
  const { settings } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  return useMemo(() => {
    if (!date) return null;
    const [year, month] = date.split("-").map(Number);
    const schedule = getMonthSchedule(year, month, shiftSettings);
    return schedule.find((day) => day.date === date) ?? null;
  }, [date, shiftSettings]);
}
