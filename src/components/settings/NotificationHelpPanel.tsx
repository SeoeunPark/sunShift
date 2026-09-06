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
import { cn } from "@/lib/utils";

interface NotificationHelpPanelProps {
  settings: NotificationSettings;
}

interface NextNotificationItem {
  id: string;
  category: string;
  time: string;
  badge: string;
  accent?: "work" | "sleep";
}

export function NotificationHelpPanel({ settings }: NotificationHelpPanelProps) {
  const today = useSeoulToday();
  const { settings: shiftSettings, isLoading } = useShiftSettings();
  const resolvedSettings = shiftSettings ?? DEFAULT_SHIFT_SETTINGS;

  const nextItems = useMemo(() => {
    const tomorrow = addSeoulDays(today, 1);
    const todayShift = getShiftForDate(today, resolvedSettings);
    const tomorrowShift = getShiftForDate(tomorrow, resolvedSettings);
    const items: NextNotificationItem[] = [];

    if (settings.todayEnabled && todayShift.code !== "OFF" && todayShift.startTime) {
      const slot = getTodayWorkNotifySlot(today, todayShift.startTime);
      items.push({
        id: "today-work",
        category: "오늘 근무",
        time: slot.time,
        badge: todayShift.name,
        accent: "work",
      });
    }

    if (settings.tomorrowEnabled && tomorrowShift.code !== "OFF" && tomorrowShift.startTime) {
      const slot = getTomorrowWorkNotifySlot(today, tomorrow, tomorrowShift.startTime);
      items.push({
        id: "tomorrow-work",
        category: "전날 알림",
        time: slot.time,
        badge: tomorrowShift.name,
        accent: "work",
      });
    }

    if (settings.sleepEnabled) {
      const sleep = getRecommendedSleepForDate(today, resolvedSettings);
      const slot = subtractMinutesFromTime(sleep.bedTime, 60);
      items.push({
        id: "sleep",
        category: "수면",
        time: slot,
        badge: sleep.label,
        accent: "sleep",
      });
    }

    return items;
  }, [today, resolvedSettings, settings]);

  if (isLoading || nextItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border/50 bg-muted/25 px-3 py-2.5">
      <h3 className="mb-2 text-[11px] font-semibold text-foreground">다음 알림</h3>
      <ul className="divide-y divide-border/40">
        {nextItems.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[4.25rem_1fr_auto] items-center gap-x-2 py-2 first:pt-0 last:pb-0"
          >
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">
              {item.category}
            </span>
            <span className="text-center text-sm font-semibold tabular-nums tracking-tight text-foreground">
              {item.time}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                item.accent === "sleep"
                  ? "bg-sleep/15 text-sleep-foreground ring-sleep-foreground/15"
                  : "bg-primary/10 text-primary ring-primary/15",
              )}
            >
              {item.badge}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
