"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding/onboardingStatus";
import { useActiveUserId } from "./useActiveUserId";

export function useOnboardingStatus() {
  const userId = useActiveUserId();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const completed = await getOnboardingCompleted(userId);
      if (!cancelled) {
        setIsCompleted(completed);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  const complete = useCallback(async () => {
    await setOnboardingCompleted(userId);
    setIsCompleted(true);
  }, [userId]);

  const reload = useCallback(() => {
    setIsCompleted(null);
    setReloadToken((value) => value + 1);
  }, []);

  return {
    isCompleted,
    isLoading: isCompleted === null,
    complete,
    reload,
  };
}
