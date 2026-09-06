"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureCloudNotifications } from "@/lib/notifications/ensureCloudNotifications";
import { notificationRepository } from "@/lib/repositories";
import { isLocalUser } from "@/lib/repositories/getUserId";
import type {
  NotificationSettings,
  SleepSetting,
  UpdateNotificationSettingsInput,
  UpdateSleepSettingInput,
} from "@/types/local";
import type { SleepShiftCode } from "@/types/database";
import { useActiveUserId } from "./useActiveUserId";

export function useNotifications() {
  const userId = useActiveUserId();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [sleepSettings, setSleepSettings] = useState<SleepSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [notificationSettings, sleep] = await Promise.all([
          notificationRepository.getSettings(userId),
          notificationRepository.getSleepSettings(userId),
        ]);

        if (!cancelled) {
          setSettings(notificationSettings);
          setSleepSettings(sleep);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "알림 설정을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const updateSettings = useCallback(
    async (input: UpdateNotificationSettingsInput) => {
      let activeUserId = userId;
      if (isLocalUser(activeUserId)) {
        activeUserId = await ensureCloudNotifications();
      }

      const updated = await notificationRepository.updateSettings(activeUserId, input);
      setSettings(updated);
      return updated;
    },
    [userId],
  );

  const updateSleepSetting = useCallback(
    async (shiftCode: SleepShiftCode, input: UpdateSleepSettingInput) => {
      const updated = await notificationRepository.updateSleepSetting(userId, shiftCode, input);
      setSleepSettings((prev) => {
        const others = prev.filter((item) => item.shiftCode !== shiftCode);
        return [...others, updated].sort((a, b) => a.shiftCode.localeCompare(b.shiftCode));
      });
      return updated;
    },
    [userId],
  );

  return {
    settings,
    sleepSettings,
    isLoading,
    error,
    reload,
    updateSettings,
    updateSleepSetting,
  };
}
