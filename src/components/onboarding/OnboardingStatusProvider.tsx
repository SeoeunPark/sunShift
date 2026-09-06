"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding/onboardingStatus";
import { useActiveUserId } from "@/hooks/useActiveUserId";

interface OnboardingStatusContextValue {
  isCompleted: boolean | null;
  isLoading: boolean;
  complete: () => Promise<void>;
  reload: () => void;
}

const OnboardingStatusContext = createContext<OnboardingStatusContextValue | null>(null);

export function OnboardingStatusProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({
      isCompleted,
      isLoading: isCompleted === null,
      complete,
      reload,
    }),
    [complete, isCompleted, reload],
  );

  return (
    <OnboardingStatusContext.Provider value={value}>{children}</OnboardingStatusContext.Provider>
  );
}

export function useOnboardingStatus(): OnboardingStatusContextValue {
  const context = useContext(OnboardingStatusContext);

  if (!context) {
    throw new Error("useOnboardingStatus must be used within OnboardingStatusProvider");
  }

  return context;
}
