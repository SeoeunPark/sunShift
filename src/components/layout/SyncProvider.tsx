"use client";

import { useEffect, useRef } from "react";
import { onLogin, runSync, subscribeOnlineStatus } from "@/lib/sync";
import { useAuthStore } from "@/stores/authStore";
import { useSyncStore } from "@/stores/syncStore";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const authUserId = useAuthStore((state) => state.user?.id ?? null);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const applySyncProgress = useSyncStore((state) => state.applySyncProgress);
  const resetSync = useSyncStore((state) => state.reset);
  const previousAuthUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthInitialized) {
      return;
    }

    if (!authUserId) {
      previousAuthUserIdRef.current = null;
      resetSync();
      return;
    }

    const previousAuthUserId = previousAuthUserIdRef.current;
    previousAuthUserIdRef.current = authUserId;

    if (previousAuthUserId === null || previousAuthUserId !== authUserId) {
      void onLogin(authUserId, applySyncProgress);
      return;
    }

    void runSync(authUserId, applySyncProgress);
  }, [applySyncProgress, authUserId, isAuthInitialized, resetSync]);

  useEffect(() => {
    if (!authUserId) {
      return;
    }

    return subscribeOnlineStatus(
      () => {
        void runSync(authUserId, applySyncProgress);
      },
      () => {
        applySyncProgress({ status: "offline" });
      },
    );
  }, [applySyncProgress, authUserId]);

  return <>{children}</>;
}
