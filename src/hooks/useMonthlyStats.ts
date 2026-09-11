"use client";

import { useMemo } from "react";
import { getMonthlyShiftStats } from "@/lib/shift";
import { shiftMonth } from "@/lib/date/calendarUtils";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { getCurrentSeoulMonth } from "@/lib/date/today";
import {
  buildYearSummaries,
  calculateMonthlyWorkHours,
  compareMonthlyStats,
  countLeaveDaysInMonth,
} from "@/lib/stats/statsUtils";
import { useLeave } from "./useLeave";
import { useShiftSettings } from "./useShiftSettings";

export function useMonthlyStats(year?: number, month?: number) {
  const current = getCurrentSeoulMonth();
  const targetYear = year ?? current.year;
  const targetMonth = month ?? current.month;

  const { settings, isLoading: isSettingsLoading } = useShiftSettings();
  const { records: leaveRecords, isLoading: isLeaveLoading } = useLeave();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const leaveRecordsForStats = useMemo(
    () => leaveRecords.map((record) => ({ date: record.date, type: record.type })),
    [leaveRecords],
  );

  const stats = useMemo(
    () => getMonthlyShiftStats(targetYear, targetMonth, shiftSettings),
    [targetYear, targetMonth, shiftSettings],
  );

  const previousMonth = useMemo(
    () => shiftMonth(targetYear, targetMonth, -1),
    [targetYear, targetMonth],
  );

  const previousStats = useMemo(
    () => getMonthlyShiftStats(previousMonth.year, previousMonth.month, shiftSettings),
    [previousMonth.month, previousMonth.year, shiftSettings],
  );

  const leaveCount = useMemo(
    () => countLeaveDaysInMonth(leaveRecordsForStats, targetYear, targetMonth),
    [leaveRecordsForStats, targetYear, targetMonth],
  );

  const annualLeaveCount = useMemo(
    () => countLeaveDaysInMonth(leaveRecordsForStats, targetYear, targetMonth, "annual"),
    [leaveRecordsForStats, targetYear, targetMonth],
  );

  const nightCareLeaveCount = useMemo(
    () => countLeaveDaysInMonth(leaveRecordsForStats, targetYear, targetMonth, "night_care"),
    [leaveRecordsForStats, targetYear, targetMonth],
  );

  const previousLeaveCount = useMemo(
    () => countLeaveDaysInMonth(leaveRecordsForStats, previousMonth.year, previousMonth.month),
    [leaveRecordsForStats, previousMonth.month, previousMonth.year],
  );

  const workHours = useMemo(
    () => calculateMonthlyWorkHours(targetYear, targetMonth, shiftSettings),
    [targetYear, targetMonth, shiftSettings],
  );

  const comparison = useMemo(
    () => compareMonthlyStats(stats, previousStats, leaveCount, previousLeaveCount),
    [stats, previousStats, leaveCount, previousLeaveCount],
  );

  const yearSummaries = useMemo(
    () => buildYearSummaries(targetYear, shiftSettings),
    [targetYear, shiftSettings],
  );

  return {
    stats,
    previousStats,
    leaveCount,
    annualLeaveCount,
    nightCareLeaveCount,
    workHours,
    comparison,
    yearSummaries,
    year: targetYear,
    month: targetMonth,
    isLoading: isSettingsLoading || isLeaveLoading,
  };
}
