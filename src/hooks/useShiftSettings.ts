"use client";

import { useCallback, useEffect, useState } from "react";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import { shiftSettingsRepository } from "@/lib/repositories";
import type { UpdateShiftSettingsInput } from "@/types/local";
import { useActiveUserId } from "./useActiveUserId";

export function useShiftSettings() {
  const userId = useActiveUserId();
  const [settings, setSettings] = useState<ShiftSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await shiftSettingsRepository.get(userId);
        if (!cancelled) {
          setSettings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "교대 설정을 불러오지 못했습니다.");
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

  const save = useCallback(
    async (input: UpdateShiftSettingsInput) => {
      const updated = await shiftSettingsRepository.save(userId, input);
      setSettings(updated);
      return updated;
    },
    [userId],
  );

  return {
    settings,
    isLoading,
    error,
    reload,
    save,
  };
}
