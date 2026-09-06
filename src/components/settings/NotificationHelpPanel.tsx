"use client";

import { useMemo } from "react";
import { addSeoulDays } from "@/lib/date/dateUtils";
import {
  getTodayWorkNotifySlot,
  getTomorrowWorkNotifySlot,
  subtractMinutesFromTime,
} from "@/lib/notifications/notificationPlanner";
import { getRecommendedSleepForDate } from "@/lib/sleep/sleepSchedule";
import { getShiftForDate } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { useSeoulToday } from "@/hooks/useClientOnly";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import type { NotificationSettings } from "@/types/local";

interface NotificationHelpPanelProps {
  settings: NotificationSettings;
}

export function NotificationHelpPanel({ settings }: NotificationHelpPanelProps) {
  const today = useSeoulToday();
  const { settings: shiftSettings, isLoading } = useShiftSettings();
  const resolvedSettings = shiftSettings ?? DEFAULT_SHIFT_SETTINGS;

  const nextLines = useMemo(() => {
    const tomorrow = addSeoulDays(today, 1);
    const todayShift = getShiftForDate(today, resolvedSettings);
    const tomorrowShift = getShiftForDate(tomorrow, resolvedSettings);
    const items: string[] = [];

    if (settings.todayEnabled && todayShift.code !== "OFF" && todayShift.startTime) {
      const slot = getTodayWorkNotifySlot(today, todayShift.startTime);
      items.push(`오늘 근무 ${slot.time} · ${todayShift.name}`);
    }

    if (settings.tomorrowEnabled && tomorrowShift.code !== "OFF" && tomorrowShift.startTime) {
      const slot = getTomorrowWorkNotifySlot(today, tomorrow, tomorrowShift.startTime);
      items.push(`전날 알림 ${slot.time} · ${tomorrowShift.name}`);
    }

    if (settings.sleepEnabled) {
      const sleep = getRecommendedSleepForDate(today, resolvedSettings);
      const slot = subtractMinutesFromTime(sleep.bedTime, 60);
      items.push(`수면 ${slot} · ${sleep.label}`);
    }

    return items;
  }, [today, resolvedSettings, settings]);

  if (isLoading || nextLines.length === 0) {
    return null;
  }

  return (
    <p className="rounded-xl border border-border/50 bg-muted/25 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">다음 알림 </span>
      {nextLines.join(" · ")}
    </p>
  );
}
