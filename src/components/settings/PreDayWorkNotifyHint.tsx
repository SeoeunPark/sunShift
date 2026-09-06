"use client";

import { useMemo, useState } from "react";
import { getPreDayWorkNotifyTime } from "@/lib/notifications/notificationPlanner";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import { cn } from "@/lib/utils";

export function PreDayWorkNotifyHint() {
  const { settings, isLoading } = useShiftSettings();
  const resolvedSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      resolvedSettings.shiftDefinitions
        .filter((item) => item.code !== "OFF" && item.startTime)
        .map((item) => ({
          name: item.name,
          time: getPreDayWorkNotifyTime(item.startTime!),
          start: item.startTime!,
        })),
    [resolvedSettings],
  );

  if (isLoading || rows.length === 0) {
    return null;
  }

  return (
    <span className="group/help relative inline-flex align-middle">
      <button
        type="button"
        className="inline-flex size-4 items-center justify-center rounded-full border border-border/60 bg-background text-[10px] font-bold leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="근무 전날 알림 조별 시간 보기"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>

      <span
        role="tooltip"
        className={cn(
          "absolute left-0 top-[calc(100%+0.375rem)] z-30 w-max max-w-[15rem] rounded-lg border border-border/60 bg-popover px-2.5 py-2 text-[11px] leading-relaxed text-popover-foreground shadow-md",
          "pointer-events-none opacity-0 transition-opacity",
          "group-hover/help:pointer-events-auto group-hover/help:opacity-100",
          "group-focus-within/help:pointer-events-auto group-focus-within/help:opacity-100",
          open && "pointer-events-auto opacity-100",
        )}
      >
        <span className="mb-1 block font-semibold text-foreground">조별 전날 알림</span>
        <ul className="space-y-0.5 text-muted-foreground">
          {rows.map((row) => (
            <li key={row.name}>
              {row.name} {row.time}
              <span className="text-muted-foreground/80"> (시작 {row.start})</span>
            </li>
          ))}
        </ul>
      </span>
    </span>
  );
}
