"use client";

import { useEffect } from "react";
import { useSeoulToday } from "@/hooks/useClientOnly";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { syncWidgetSnapshotToNative } from "@/lib/widget/syncWidgetToNative";

export function WidgetSyncProvider({ children }: { children: React.ReactNode }) {
  const today = useSeoulToday();
  const { settings, isLoading } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void syncWidgetSnapshotToNative(shiftSettings, { today });
  }, [isLoading, shiftSettings, today]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && !isLoading) {
        void syncWidgetSnapshotToNative(shiftSettings, { today });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isLoading, shiftSettings, today]);

  return <>{children}</>;
}
